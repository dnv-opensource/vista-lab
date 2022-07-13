using Common;
using System.Globalization;
using System.Text.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;
using QueryApi.Models;

namespace QueryApi.Repository;

public sealed class DataChannelRepository
{
    private readonly ILogger<DataChannelRepository> _logger;
    private readonly QuestDbClient _client;

    public DataChannelRepository(QuestDbClient client, ILogger<DataChannelRepository> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<IEnumerable<DataChannel>> GetDataChannelByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            SQLHelper.MountDataChannelSQL(filter),
            cancellationToken
        );

        var dataChannels = new List<DataChannel>();
        for (int i = 0; i < response.Count; i++)
        {
            var namingRule = response
                .GetValue(i, nameof(DataChannelEntity.NameObject_NamingRule))
                .GetString();
            var dataChannelId = new DataChannelID(
                response.GetValue(i, nameof(DataChannelEntity.LocalId)).GetStringNonNull(),
                namingRule is null ? null : new NameObject(namingRule),
                response.GetValue(i, nameof(DataChannelEntity.ShortId)).GetString()
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
            dataChannels.Add(dataChannel);
        }

        return dataChannels;
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

    public async Task<IEnumerable<EventDataSet>> GetTimeSeriesByInternalId(
        Guid internalId,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(
            SQLHelper.MountTimeSeriesSQL(internalId),
            cancellationToken
        );

        return ToTimeSeries(response);
    }

    public async Task<IEnumerable<EventDataSet>> GetTimeSeriesByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.Query(SQLHelper.MountTimeSeriesSQL(filter), cancellationToken);

        return ToTimeSeries(response);
    }
}
