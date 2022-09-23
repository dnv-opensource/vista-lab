using Common;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using MQTTnet.Client;
using QueryApi.Models;
using System.ComponentModel;
using System.Globalization;
using System.Text.Json;
using Vista.SDK;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace QueryApi.Repository;

public enum QueryOperator
{
    Sum,
    Subtract,
    Times,
    Divide
}

public sealed partial class DataChannelRepository
{
    private readonly ILogger<DataChannelRepository> _logger;
    private readonly QuestDbClient _client;
    private readonly IMqttClient _mqttClient;

    public sealed record Vessel(string VesselId, int NumberOfDataChannels, string? Name);

    public sealed record TimeSeriesDataWithProps(
        EventDataSet? EventData,
        AdditionalTimeSeriesProperties? AdditionalProps
    );

    public sealed record VesselPosition(
        string VesselId,
        double Latitude,
        double Longitude,
        DateTimeOffset Timestamp
    );

    public sealed record Query(
        [property: DefaultValue("123abc")] string Id,
        [property: DefaultValue("Subtract")] string Name,
        [property: DefaultValue(QueryOperator.Subtract)] QueryOperator Operator,
        [property: DefaultValue(null)] IEnumerable<Query>? SubQueries,
        [property: DefaultValue(
            new string[]
            {
                "/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-outlet",
                "/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-inlet"
            }
        )]
            IEnumerable<string>? DataChannelIds
    )
    {
        public static SimpleCalculationConfig ToSimpleCalculationConfig(Query query)
        {
            return new SimpleCalculationConfig(
                (int?)query.Operator,
                query.DataChannelIds ?? Array.Empty<string>(),
                query.SubQueries?.Select(ToSimpleCalculationConfig).ToArray()
            );
        }

        public static Query ToQuery(SimpleCalculationConfig query)
        {
            return new Query(
                "",
                "",
                (QueryOperator)(query.Operator ?? 0),
                query.SubQueries?.Select(ToQuery).ToArray(),
                query.DataChannelIds.Count() == 0 ? null : query.DataChannelIds
            );
        }
    };

    public sealed record TimeRange(
        [property: DefaultValue(900)] long From,
        [property: DefaultValue(0)] long To,
        [property: DefaultValue("10s")] string Interval
    );

    public sealed record AggregatedTimeseries(double Value, DateTimeOffset Timestamp);

    private sealed record AggregatedTimeseriesDto(
        double Value,
        DateTimeOffset Timestamp,
        string VesselId
    );

    public sealed record AggregatedQueryResultAsReport(double Value, string Id, string Name);

    public sealed record AggregatedQueryResult(
        IEnumerable<AggregatedTimeseries> Timeseries,
        string Id,
        string Name,
        string VesselId
    );

    public DataChannelRepository(
        QuestDbClient client,
        ILogger<DataChannelRepository> logger,
        IMqttClient mqttClient
    )
    {
        _client = client;
        _logger = logger;
        _mqttClient = mqttClient;
    }

    public async Task<IEnumerable<Vessel>> GetVessels(CancellationToken cancellationToken)
    {
        var query =
            @$"
            SELECT DISTINCT {nameof(DataChannelEntity.VesselId)}, count() as {nameof(Vessel.NumberOfDataChannels)}, {nameof(DataChannelEntity.VesselName)}
            FROM {DataChannelEntity.TableName}
        ";

        var response = await _client.Query(query, cancellationToken);

        return ToVessels(response);
    }

    public async Task<IEnumerable<DataChannelListPackage>> GetDataChannelByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            SQLGenerator.MountDataChannelSQL(filter),
            cancellationToken
        );

        var dataChannelListsPackage =
            new Dictionary<
                string,
                (List<DataChannel> DataChannelList, DataChannelListPackage Package)
            >();

        (List<DataChannel> DataChannelList, DataChannelListPackage Package) GetDataChannelListPackageFromResponse(
            int i,
            DbResponse response,
            ref Dictionary<
                string,
                (List<DataChannel> DataChannelList, DataChannelListPackage Package)
            > dataChannelListPackages
        )
        {
            var vesselId = response
                .GetValue(i, nameof(DataChannelEntity.VesselId))
                .GetStringNonNull();
            var vesselName = response.GetValue(i, nameof(DataChannelEntity.VesselName)).GetString();
            if (!dataChannelListsPackage.ContainsKey(vesselId))
            {
                var dcList = new List<DataChannel>();
                var timestamp = response
                    .GetValue(i, nameof(DataChannelEntity.Timestamp))
                    .GetDateTimeOffset();
                var visVersion = response
                    .GetValue(i, nameof(DataChannelEntity.LocalId_VisVersion))
                    .GetStringNonNull();
                var namingRule = response
                    .GetValue(i, nameof(DataChannelEntity.NameObject_NamingRule))
                    .GetString();

                var configurationReference =
                    new Vista.SDK.Transport.Json.DataChannel.ConfigurationReference(
                        vesselId,
                        timestamp,
                        visVersion
                    );
                var versionInformation = new VersionInformation(
                    namingRule ?? "dnv",
                    "v2",
                    "https://vista.dnv.com/docs"
                );
                var header = new Vista.SDK.Transport.Json.DataChannel.Header(
                    "N/A",
                    configurationReference,
                    timestamp,
                    vesselId,
                    versionInformation
                );

                header.AdditionalProperties ??= new Dictionary<string, object>();
                if (!string.IsNullOrWhiteSpace(vesselName))
                    header.AdditionalProperties.Add("ShipName", vesselName);

                var package = new Vista.SDK.Transport.Json.DataChannel.Package(
                    new DataChannelList(dcList),
                    header
                );

                var dataChannelListPackage = new DataChannelListPackage(package);

                dataChannelListPackages.Add(vesselId, (dcList, dataChannelListPackage));
                return (dcList, dataChannelListPackage);
            }

            return dataChannelListPackages[vesselId];
        }

        for (int i = 0; i < response.Count; i++)
        {
            var dataChannelListPackageMap = GetDataChannelListPackageFromResponse(
                i,
                response,
                ref dataChannelListsPackage
            );
            var dataChannelList = dataChannelListPackageMap.DataChannelList;

            var namingRule = response
                .GetValue(i, nameof(DataChannelEntity.NameObject_NamingRule))
                .GetString();
            var dataChannelId = new DataChannelID(
                response.GetValue(i, nameof(DataChannelEntity.LocalId)).GetStringNonNull(),
                new NameObject(namingRule ?? "N/A"),
                response.GetValue(i, nameof(DataChannelEntity.ShortId)).GetString()
            );

            dataChannelId.NameObject!.AdditionalProperties.Add(
                nameof(DataChannelEntity.InternalId),
                response.GetValue(i, nameof(DataChannelEntity.InternalId)).GetStringNonNull()
            );
            dataChannelId.NameObject!.AdditionalProperties.Add(
                nameof(DataChannelEntity.VesselId),
                response.GetValue(i, nameof(DataChannelEntity.VesselId)).GetStringNonNull()
            );

            var formatRestrictionEnumerationStr = response
                .GetValue(i, nameof(DataChannelEntity.Format_Restriction_Enumeration))
                .GetString();
            var formatRestrictionEnumeration = formatRestrictionEnumerationStr is null
                ? null
                : JsonSerializer.Deserialize<IReadOnlyList<string>>(
                      formatRestrictionEnumerationStr
                  );
            var formatRestrictionWhiteSpaceStr = response
                .GetValue(i, nameof(DataChannelEntity.Format_Restriction_WhiteSpace))
                .GetString();
            var formatRestrictionWhiteSpace = formatRestrictionWhiteSpaceStr is null
                ? default(RestrictionWhiteSpace?)
                : Enum.Parse<RestrictionWhiteSpace>(formatRestrictionWhiteSpaceStr);

            var rangeHigh = response
                .GetValue(i, nameof(DataChannelEntity.Range_High))
                .GetDoubleOrNull()
                ?.ToString(CultureInfo.InvariantCulture);
            var rangeLow = response
                .GetValue(i, nameof(DataChannelEntity.Range_Low))
                .GetDoubleOrNull()
                ?.ToString(CultureInfo.InvariantCulture);

            var unitSymbol = response
                .GetValue(i, nameof(DataChannelEntity.Unit_UnitSymbol))
                .GetString();

            var property = new Property(
                alertPriority: null,
                new DataChannelType(
                    response
                        .GetValue(i, nameof(DataChannelEntity.DataChannelType_CalculationPeriod))
                        .GetDoubleOrNull()
                        ?.ToString(CultureInfo.InvariantCulture),
                    response
                        .GetValue(i, nameof(DataChannelEntity.DataChannelType_Type))
                        .GetStringNonNull(),
                    response
                        .GetValue(i, nameof(DataChannelEntity.DataChannelType_UpdateCycle))
                        .GetDoubleOrNull()
                        ?.ToString(CultureInfo.InvariantCulture)
                ),
                new Format(
                    new Restriction(
                        formatRestrictionEnumeration,
                        response
                            .GetValue(
                                i,
                                nameof(DataChannelEntity.Format_Restriction_FractionDigits)
                            )
                            .GetString(),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_Length))
                            .GetIntOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MaxExclusive))
                            .GetDoubleOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MaxInclusive))
                            .GetDoubleOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MaxLength))
                            .GetIntOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MinExclusive))
                            .GetDoubleOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MinInclusive))
                            .GetDoubleOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_MinLength))
                            .GetIntOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_Pattern))
                            .GetIntOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        response
                            .GetValue(i, nameof(DataChannelEntity.Format_Restriction_TotalDigits))
                            .GetIntOrNull()
                            ?.ToString(CultureInfo.InvariantCulture),
                        formatRestrictionWhiteSpace
                    ),
                    response.GetValue(i, nameof(DataChannelEntity.Format_Type)).GetStringNonNull()
                ),
                response.GetValue(i, nameof(DataChannelEntity.Name)).GetString(),
                response.GetValue(i, nameof(DataChannelEntity.QualityCoding)).GetString(),
                rangeHigh is null || rangeLow is null
                  ? null
                  : new Vista.SDK.Transport.Json.DataChannel.Range(rangeHigh, rangeLow),
                response.GetValue(i, nameof(DataChannelEntity.Remarks)).GetString(),
                unitSymbol is null
                  ? null
                  : new Unit(
                        response
                            .GetValue(i, nameof(DataChannelEntity.Unit_QuantityName))
                            .GetString(),
                        unitSymbol
                    )
            );
            var dataChannel = new DataChannel(dataChannelId, property);
            dataChannelList.Add(dataChannel);
        }

        return dataChannelListsPackage
            .Select(
                d =>
                {
                    var package = new Vista.SDK.Transport.Json.DataChannel.Package(
                        new DataChannelList(d.Value.DataChannelList),
                        d.Value.Package.Package.Header
                    );
                    return new DataChannelListPackage(package);
                }
            )
            .ToArray();
    }

    public async Task<TimeSeriesDataWithProps> GetLatestTimeSeriesForDataChannel(
        string localId,
        string vesselId,
        CancellationToken cancellationToken
    )
    {
        var dataChannels = await GetDataChannels(new[] { localId }, vesselId, cancellationToken);
        var dataChannel = dataChannels.SingleOrDefault();

        if (dataChannel is null)
            return new TimeSeriesDataWithProps(null, null);

        var response = await _client.Query(
            @$"
                SELECT t.*, d.Unit_UnitSymbol, d.Unit_QuantityName, d.Range_High, d.Range_Low, d.Name
                FROM 'TimeSeries' t
                INNER JOIN 'DataChannel' d
                ON d.LocalId = t.DataChannelId AND t.VesselId = d.VesselId
                WHERE DataChannelId = '{localId}'
                {(!string.IsNullOrWhiteSpace(vesselId) ? $"AND t.VesselId = '{vesselId}'" : "")}
                LATEST ON Timestamp PARTITION BY DataChannelId;
            ",
            cancellationToken
        );

        var eventData = ToTimeSeries(response).FirstOrDefault();
        var additionalProps = ToAdditionalTimeSeriesProps(response).FirstOrDefault();

        return new TimeSeriesDataWithProps(eventData, additionalProps);
    }

    public async Task<IEnumerable<Feature<Point, FeatureProps>>> GetLatestVesselPositions(
        CancellationToken cancellationToken
    )
    {
        var latLocalId = LocalIdBuilder.TryParse(
            "/dnv-v2/vis-3-4a/710.1/F211.1/meta/qty-latitude",
            out var latBuilder
        )
          ? latBuilder
          : null;
        var lngLocalId = LocalIdBuilder.TryParse(
            "/dnv-v2/vis-3-4a/710.1/F211.1/meta/qty-longitude",
            out var lnbBuilder
        )
          ? lnbBuilder
          : null;

        if (latLocalId is null || lngLocalId is null)
            throw new Exception("Failed to parse localIds");

        var query =
            @$"
            SELECT lat.Value as latitude, lng.Value as longitude, lat.Timestamp, lat.VesselId
            FROM 
                (
                SELECT Value, Timestamp, VesselId, DataChannelId
                FROM 'TimeSeries'
                WHERE DataChannelId  = '{latLocalId}'
                LATEST ON Timestamp PARTITION BY VesselId
            ) lat
            INNER JOIN 
            (
                SELECT Value, Timestamp, VesselId, DataChannelId
                FROM 'TimeSeries'
                WHERE DataChannelId  = '{lngLocalId}'
                LATEST ON Timestamp PARTITION BY VesselId
            ) lng
            ON lng.VesselId = lat.VesselId

        ";

        var response = await _client.Query(query, cancellationToken);

        var geoJson = ToGeoJsonFeatures(response);

        return geoJson.ToArray();
    }

    static IEnumerable<string> GetQueryDataChannelIds(IEnumerable<Query> queries) =>
        queries.SelectMany(
            q =>
                q.SubQueries?.Any() ?? false
                    ? (q.DataChannelIds ?? Array.Empty<string>()).Concat(
                          GetQueryDataChannelIds(q.SubQueries)
                      )
                    : q.DataChannelIds ?? Array.Empty<string>()
        );

    private async Task<
        IReadOnlyDictionary<(string VesselId, string LocalId), IEnumerable<AggregatedTimeseries>?>
    > ResolveCalculatedDataChannels(
        string vessel,
        TimeRange timeRange,
        IEnumerable<Query> queries,
        CancellationToken cancellationToken
    )
    {
        var dataChannelIds = GetQueryDataChannelIds(queries).Distinct().ToArray();

        var dataChannels = await GetDataChannels(dataChannelIds, vessel, cancellationToken);
        var resolveCalculatedChannels = new Queue<DataChannelInfo>(dataChannels);

        var resolved =
            new Dictionary<(string VesselId, string LocalId), IEnumerable<AggregatedTimeseries>?>();

        while (resolveCalculatedChannels.Count > 0)
        {
            var dataChannel = resolveCalculatedChannels.Dequeue();
            var calculationInfoJson = dataChannel.CalculationInfo;
            if (calculationInfoJson is null)
            {
                resolved[(dataChannel.VesselId, dataChannel.LocalId)] = null;
                continue;
            }

            var calculationInfo = CalculationInfoDto.Deserialize(calculationInfoJson);
            var calculationConfig = calculationInfo.GetConfigurationObject();
            if (calculationConfig is SimpleCalculationConfig simpleConfig)
            {
                var query = Query.ToQuery(simpleConfig);
                var results = await GetTimeSeriesByQueries(
                    vessel,
                    timeRange,
                    new[] { query },
                    cancellationToken
                );
                resolved[(dataChannel.VesselId, dataChannel.LocalId)] = results.Single().Timeseries;
            }
            else
            {
                throw new InvalidOperationException(
                    "Invalid calculation config: " + calculationConfig.GetType()
                );
            }
        }

        return resolved;
    }

    public async Task<IEnumerable<AggregatedQueryResult>> GetTimeSeriesByQueries(
        string vessel,
        TimeRange timeRange,
        IEnumerable<Query> queries,
        CancellationToken cancellationToken,
        bool getReport = false
    )
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var incrementer = 0;

        var calculatedTimeseries = await ResolveCalculatedDataChannels(
            vessel,
            timeRange,
            queries,
            cancellationToken
        );

        var queryResults = new List<AggregatedQueryResult>();

        var isFleet = vessel is "fleet";

        foreach (var query in queries)
        {
            var q = SQLGenerator.GenerateQueryTimeseriesSQL(
                vessel,
                query,
                timeRange,
                now,
                calculatedTimeseries,
                ref incrementer,
                getReport
            );

            var dataChannelIds = GetQueryDataChannelIds(new[] { query }).Distinct().ToArray();

            var useCalculatedTimeseries = calculatedTimeseries
                .Where(kvp => dataChannelIds.Contains(kvp.Key.LocalId) && kvp.Value is not null)
                .GroupBy(
                    kvp => kvp.Key.VesselId,
                    kvp =>
                        (
                            Lookup: kvp.Value!.ToDictionary(v => v.Timestamp, v => v.Value),
                            Timeseries: kvp.Value
                        )
                )
                .ToDictionary(grp => grp.Key, grp => grp.ToArray());

            if (q == string.Empty)
            {
                foreach (var r in useCalculatedTimeseries)
                {
                    if (r.Value.Length == 1)
                    {
                        queryResults.Add(
                            new AggregatedQueryResult(
                                r.Value[0].Timeseries!,
                                $"{r.Key}{query.Id}",
                                query.Name,
                                r.Key
                            )
                        );
                    }
                }
                continue;
            }

            var response = await _client.Query(q, cancellationToken);
            var timeseries = ToAggregatedTimeseriesDto(response);

            var vesselGroupedQueries = timeseries.GroupBy(
                t => t.VesselId,
                t =>
                {
                    var value = t.Value;
                    if (useCalculatedTimeseries.TryGetValue(t.VesselId, out var data))
                    {
                        foreach (var series in data)
                        {
                            if (
                                series.Lookup is null
                                || !series.Lookup.TryGetValue(t.Timestamp, out var subValue)
                            )
                                continue;

                            switch (query.Operator)
                            {
                                case QueryOperator.Subtract:
                                    value -= subValue;
                                    break;
                                case QueryOperator.Sum:
                                    value += subValue;
                                    break;
                                case QueryOperator.Times:
                                    value *= subValue;
                                    break;
                                case QueryOperator.Divide:
                                    value /= subValue;
                                    break;
                            }
                        }
                    }
                    return new AggregatedTimeseries(t.Value, t.Timestamp);
                }
            );

            foreach (var r in vesselGroupedQueries)
            {
                queryResults.Add(
                    new AggregatedQueryResult(r, $"{r.Key}{query.Id}", query.Name, r.Key)
                );
            }
        }

        return queryResults;
    }

    private sealed record DataChannelInfo(
        string InternalId,
        string VesselId,
        string LocalId,
        string? CalculationInfo
    );

    private async Task<IEnumerable<DataChannelInfo>> GetDataChannels(
        IEnumerable<string> dataChannelIds,
        string vessel,
        CancellationToken cancellationToken
    )
    {
        var isFleet = vessel is "fleet";

        var localIds = string.Join(", ", dataChannelIds.Select(i => $"'{i}'"));
        var sql =
            @$"
            SELECT
                {nameof(DataChannelEntity.InternalId)},
                {nameof(DataChannelEntity.VesselId)},
                {nameof(DataChannelEntity.LocalId)},
                {nameof(DataChannelEntity.CalculationInfo)}
            FROM '{DataChannelEntity.TableName}'
            WHERE
            {(isFleet ? "" : $"{nameof(DataChannelEntity.VesselId)} = '{vessel}' AND ")}
            {nameof(DataChannelEntity.LocalId)} IN ({localIds})
        ";

        var response = await _client.Query(sql, cancellationToken);

        return response.DataSet
            .Select(
                (s, i) =>
                {
                    var internalId = response
                        .GetValue(i, nameof(DataChannelEntity.InternalId))
                        .GetStringNonNull();
                    var vesselId = response
                        .GetValue(i, nameof(DataChannelEntity.VesselId))
                        .GetStringNonNull();
                    var localId = response
                        .GetValue(i, nameof(DataChannelEntity.LocalId))
                        .GetStringNonNull();
                    var calculationInfo = response
                        .GetValue(i, nameof(DataChannelEntity.CalculationInfo))
                        .GetString();
                    return new DataChannelInfo(internalId, vesselId, localId, calculationInfo);
                }
            )
            .ToArray();
    }

    public async Task<IEnumerable<AggregatedQueryResultAsReport>> GetReportByQueries(
        string vessel,
        TimeRange timeRange,
        IEnumerable<Query> queries,
        CancellationToken cancellationToken
    )
    {
        var queryResults = await GetTimeSeriesByQueries(
            vessel,
            timeRange,
            queries,
            cancellationToken,
            getReport: true
        );

        var reports = new List<AggregatedQueryResultAsReport>();
        foreach (var queryResult in queryResults)
        {
            foreach (var timeseries in queryResult.Timeseries)
            {
                reports.Add(
                    new AggregatedQueryResultAsReport(
                        timeseries.Value,
                        queryResult.Id,
                        queryResult.Name
                    )
                );
            }
        }
        return reports;
    }

    public async Task DispatchDataChannelFromQuery(
        string vessel,
        string? vesselName,
        DataChannel dataChannel,
        Query query,
        CancellationToken cancellationToken
    )
    {
        await _mqttClient.PingAsync();

        var now = DateTimeOffset.UtcNow;
        var localId = LocalId.Parse(dataChannel.DataChannelID.LocalID);

        // Adding calculationInfo
        dataChannel.Property.AdditionalProperties.Add(
            nameof(DataChannelEntity.CalculationInfo),
            CalculationInfoDto.CreateSimple(Query.ToSimpleCalculationConfig(query))
        );

        var package = new DataChannelListPackage(
            new Vista.SDK.Transport.Json.DataChannel.Package(
                new DataChannelList(new[] { dataChannel }),
                new Vista.SDK.Transport.Json.DataChannel.Header(
                    "",
                    new Vista.SDK.Transport.Json.DataChannel.ConfigurationReference(
                        query.Id,
                        now,
                        VisVersionExtensions.ToVersionString(localId.VisVersion)
                    ),
                    now,
                    vessel,
                    null
                )
            )
        );

        if (vesselName is not null)
            package.Package.Header.AdditionalProperties.Add("ShipName", vesselName);

        await _mqttClient.PublishStringAsync(
            "DataChannelLists",
            Serializer.Serialize(package),
            default,
            default,
            cancellationToken
        );
    }
}
