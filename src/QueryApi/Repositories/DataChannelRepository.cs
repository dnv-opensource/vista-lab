using Common;
using QueryApi.Models;
using System.Globalization;
using System.Text.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace QueryApi.Repository;

public sealed class DataChannelRepository
{
    private readonly ILogger<DataChannelRepository> _logger;
    private readonly QuestDbClient _client;

    public sealed record AdditionalTimeSeriesProperties(
        string? UnitSymbol,
        string? QuantityName,
        float? RangeHigh,
        float? RangeLow,
        string? Name
    );

    public sealed record TimeSeriesDataWithProps(
        EventDataSet? EventData,
        AdditionalTimeSeriesProperties? AdditionalProps
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

    private static IEnumerable<EventDataSet> ToTimeSeries(DbResponse response)
    {
        var timeSeriesData = new List<EventDataSet>();
        for (int i = 0; i < response.Count; i++)
        {
            var timeSeries = new EventDataSet(
                response.GetValue(i, nameof(TimeSeriesEntity.DataChannelId)).GetStringNonNull(),
                response.GetValue(i, nameof(TimeSeriesEntity.Quality)).GetString(),
                response.GetValue(i, nameof(TimeSeriesEntity.Timestamp)).GetDateTimeOffset(),
                response.GetValue(i, nameof(TimeSeriesEntity.Value)).GetString() ?? "N/A"
            );

            timeSeriesData.Add(timeSeries);
        }

        return timeSeriesData;
    }

    private static IEnumerable<AdditionalTimeSeriesProperties> ToAdditionalTimeSeriesProps(
        DbResponse response
    )
    {
        var props = new List<AdditionalTimeSeriesProperties>();
        for (int i = 0; i < response.Count; i++)
        {
            float? rangeHigh = response
                .GetValue(i, nameof(DataChannelEntity.Range_High))
                .TryGetDouble(out var rh)
              ? (float)rh
              : null;
            float? rangeLow = response
                .GetValue(i, nameof(DataChannelEntity.Range_Low))
                .TryGetDouble(out var rl)
              ? (float)rl
              : null;

            var additionalProps = new AdditionalTimeSeriesProperties(
                response.GetValue(i, nameof(DataChannelEntity.Unit_UnitSymbol)).GetString(),
                response.GetValue(i, nameof(DataChannelEntity.Unit_QuantityName)).GetString(),
                rangeHigh,
                rangeLow,
                response.GetValue(i, nameof(DataChannelEntity.Name)).GetString()
            );

            props.Add(additionalProps);
        }

        return props;
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
}
