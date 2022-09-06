using Common;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using QueryApi.Models;
using System.ComponentModel;
using System.Globalization;
using System.Text.Json;
using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace QueryApi.Repository;

public enum QueryOperator
{
    Sum,
    Subtract,
    Times,
    Divide,
    Average
}

public sealed partial class DataChannelRepository
{
    private readonly ILogger<DataChannelRepository> _logger;
    private readonly QuestDbClient _client;

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
                "data.dnv.com/IMO1234567/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-outlet",
                "data.dnv.com/IMO1234567/dnv-v2/vis-3-4a/621.21/S90/sec/411.1/C101/meta/qty-mass/cnt-fuel.oil/pos-inlet"
            }
        )]
            IEnumerable<string>? DataChannelIds
    );

    public sealed record TimeRange(
        [property: DefaultValue(900)] long From,
        [property: DefaultValue(0)] long To,
        [property: DefaultValue("10s")] string Interval
    );

    public sealed record AggregatedTimeseries(double Value, DateTimeOffset Timestamp);

    public sealed record AggregatedQueryResultAsReport(double Value, string Id, string Name);

    public sealed record AggregatedQueryResult(
        IEnumerable<AggregatedTimeseries> Timeseries,
        string Id,
        string Name
    );

    public DataChannelRepository(QuestDbClient client, ILogger<DataChannelRepository> logger)
    {
        _client = client;
        _logger = logger;
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

    public async Task<IEnumerable<EventDataSet>> GetTimeSeriesByInternalId(
        Guid internalId,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            SQLGenerator.MountTimeSeriesSQL(internalId),
            cancellationToken
        );

        return ToTimeSeries(response);
    }

    public async Task<IEnumerable<EventDataSet>> GetTimeSeriesByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            SQLGenerator.MountTimeSeriesSQL(filter),
            cancellationToken
        );

        return ToTimeSeries(response);
    }

    public async Task<TimeSeriesDataWithProps> GetLatestTimeSeriesForDataChannel(
        string localId,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            @$"
                SELECT t.*, d.Unit_UnitSymbol, d.Unit_QuantityName, d.Range_High, d.Range_Low, d.Name
                FROM 'TimeSeries' t
                INNER JOIN 'DataChannel' d
                ON d.LocalId = t.DataChannelId
                WHERE t.VesselId = d.VesselId
                AND DataChannelId = '{localId}'
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

    public async Task<IEnumerable<AggregatedQueryResult>> GetTimeSeriesByQueries(
        TimeRange timeRange,
        IEnumerable<Query> queries,
        CancellationToken cancellationToken,
        bool getReport = false
    )
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var incrementer = 0;

        var queryResults = new List<AggregatedQueryResult>();

        foreach (var query in queries)
        {
            var q = SQLGenerator.GenerateQueryTimeseriesSQL(
                query,
                timeRange,
                now,
                ref incrementer,
                getReport
            );

            var response = await _client.Query(q, cancellationToken);
            var timeseries = ToAggregatedTimeseries(response);
            queryResults.Add(new AggregatedQueryResult(timeseries, query.Id, query.Name));
        }

        return queryResults;
    }

    public async Task<IEnumerable<AggregatedQueryResultAsReport>> GetReportByQueries(
        TimeRange timeRange,
        IEnumerable<Query> queries,
        CancellationToken cancellationToken
    )
    {
        var queryResults = await GetTimeSeriesByQueries(
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
}
