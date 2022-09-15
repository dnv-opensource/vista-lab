using Common;
using QueryApi.Models;
using Vista.SDK;
using static QueryApi.Repository.DataChannelRepository;

namespace QueryApi.Repository;

public static class SQLGenerator
{
    private static readonly string SELECT_DATA_CHANNEL =
        $"SELECT * FROM {DataChannelEntity.TableName}";

    private static readonly string SELECT_TIME_SERIES =
        $@"
        SELECT
            TS.{nameof(TimeSeriesEntity.DataChannelId)},
            TS.{nameof(TimeSeriesEntity.VesselId)},
            TS.{nameof(TimeSeriesEntity.Value)},
            TS.{nameof(TimeSeriesEntity.Quality)},
            TS.{nameof(TimeSeriesEntity.Timestamp)}
        FROM {TimeSeriesEntity.TableName} AS TS
          JOIN {DataChannelInternalIdEntity.TableName} AS DC_ID ON
            TS.{nameof(TimeSeriesEntity.DataChannelId)} = DC_ID.{nameof(DataChannelInternalIdEntity.DataChannelId)}
            AND TS.{nameof(TimeSeriesEntity.VesselId)} = DC_ID.{nameof(DataChannelInternalIdEntity.VesselId)}
    ";

    private static readonly string TIME_SERIES_DATA_CHANNEL_JOIN =
        $@" JOIN {DataChannelEntity.TableName} DC ON
            DC_ID.{nameof(DataChannelInternalIdEntity.InternalId)} = DC.{nameof(DataChannelEntity.InternalId)}";

    private static readonly string ORDER_BY_TIME_STAMP =
        $" ORDER BY TS.{nameof(TimeSeriesEntity.Timestamp)} DESC ";

    internal static string MountDataChannelSQL(DataChannelFilter filter) =>
        SELECT_DATA_CHANNEL + (filter.IsEmpty ? "" : MountDataChannelWhere(filter));

    internal static string MountTimeSeriesSQL(Guid internalId) =>
        $"{SELECT_TIME_SERIES} WHERE DC_ID.{nameof(DataChannelInternalIdEntity.InternalId)} = '{internalId}'";

    internal static string MountTimeSeriesSQL(DataChannelFilter filter) =>
        SELECT_TIME_SERIES
        + TIME_SERIES_DATA_CHANNEL_JOIN
        + MountDataChannelWhere(filter)
        + ORDER_BY_TIME_STAMP;

    private static string MountDataChannelWhere(DataChannelFilter filter)
    {
        var whereSQL = string.Empty;
        var vesselIdSQL = MountVesselIdFilter(filter);
        var primaryItemsSQL = MountPrimaryItemFilter(filter);
        var secondaryItemsSQL = MountSecondaryItemFilter(filter);

        if (
            vesselIdSQL != string.Empty
            || primaryItemsSQL != string.Empty
            || secondaryItemsSQL != string.Empty
        )
            whereSQL = " WHERE ";

        if (vesselIdSQL != string.Empty)
            whereSQL += vesselIdSQL;

        if (primaryItemsSQL != string.Empty || secondaryItemsSQL != string.Empty)
        {
            if (vesselIdSQL != string.Empty)
                whereSQL += " AND ";

            whereSQL += "(";
            if (!string.IsNullOrWhiteSpace(primaryItemsSQL))
                whereSQL += $"({primaryItemsSQL})";

            if (!string.IsNullOrWhiteSpace(secondaryItemsSQL))
            {
                if (!string.IsNullOrWhiteSpace(primaryItemsSQL))
                    whereSQL += " OR ";

                whereSQL += $"({secondaryItemsSQL})";
            }
            whereSQL += ")";
        }

        return whereSQL;
    }

    private static string MountVesselIdFilter(DataChannelFilter filter)
    {
        var sql = string.Empty;
        if (!string.IsNullOrWhiteSpace(filter.VesselId))
            sql += $" {nameof(DataChannelEntity.VesselId)} = \'{filter.VesselId}\' ";
        return sql;
    }

    private static string MountPrimaryItemFilter(DataChannelFilter filter)
    {
        var sql = string.Empty;
        if (filter.PrimaryItem != null && filter.PrimaryItem.Any())
            sql += string.Join(
                " OR ",
                filter.PrimaryItem.Select(
                    x =>
                        $" {nameof(DataChannelEntity.LocalId_PrimaryItem)} LIKE \'%{x.Replace('*', '%')}\' "
                )
            );
        return sql;
    }

    private static string MountSecondaryItemFilter(DataChannelFilter filter)
    {
        var sql = string.Empty;
        if (filter.SecondaryItem != null && filter.SecondaryItem.Any())
            sql += string.Join(
                " OR ",
                filter.SecondaryItem.Select(
                    x =>
                        $" {nameof(DataChannelEntity.LocalId_SecondaryItem)} LIKE \'%{x.Replace('*', '%')}\' "
                )
            );
        return sql;
    }

    public static string GenerateQueryTimeseriesSQL(
        Query query,
        TimeRange timeRange,
        long now,
        ref int incrementer,
        bool getReport = false
    )
    {
        List<(string Query, int As)> subQueries = new();
        var timeRangeSegment = TimeRangeToBetweenRange(timeRange, now, getReport);

        if (query.DataChannelIds is not null)
        {
            foreach (var id in query.DataChannelIds)
            {
                var universalId = UniversalIdBuilder.Parse(id);

                var q =
                    @$"
                SELECT {(!getReport ? "avg" : "sum")}(CAST({nameof(TimeSeriesEntity.Value)} as double)) as {nameof(TimeSeriesEntity.Value)},
                    {nameof(TimeSeriesEntity.Timestamp)}
                FROM {TimeSeriesEntity.TableName}
                WHERE {nameof(TimeSeriesEntity.DataChannelId)} = '{universalId.LocalId}'
                {(universalId.ImoNumber is not null ? $"AND {nameof(TimeSeriesEntity.VesselId)} = '{universalId.ImoNumber}'" : '\n')}
                {timeRangeSegment}
            ";

                subQueries.Add((q, ++incrementer));
            }
        }

        if (query.SubQueries is not null)
        {
            foreach (var subQuery in query.SubQueries)
            {
                var q = $"{GenerateQueryTimeseriesSQL(subQuery, timeRange, now, ref incrementer)}";
                subQueries.Add((q, ++incrementer));
            }
        }

        var aggregation = string.Join(
            ToOperatorString(query.Operator),
            subQueries.Select(q => $"q{q.As}.{nameof(TimeSeriesEntity.Value)}")
        );

        var subQueryIndex = 0;

        var generatedQuery =
            $@"SELECT ({aggregation}) as {nameof(TimeSeriesEntity.Value)}, q{incrementer}.Timestamp
            FROM
            {subQueries.Aggregate("", (prev, q) => { if (string.IsNullOrWhiteSpace(prev)) return $"({q.Query}) as q{subQueries[subQueryIndex++].As}"; return @$"{prev}
            INNER JOIN (
                {q.Query}
            ) as q{subQueries[subQueryIndex].As}
            ON q{subQueries[subQueryIndex - 1].As}.{nameof(TimeSeriesEntity.Timestamp)} = q{subQueries[subQueryIndex++].As}.{nameof(TimeSeriesEntity.Timestamp)}"; })}
";

        return generatedQuery;
    }

    public static string TimeRangeToBetweenRange(
        TimeRange timeRange,
        long now,
        bool getReport = false
    )
    {
        var from = (now - timeRange.From);
        var to = (now - timeRange.To);

        return $@"AND {nameof(TimeSeriesEntity.Timestamp)} BETWEEN CAST({from * 1000000} as timestamp) AND CAST({to * 1000000} as timestamp) SAMPLE BY {(!getReport ? timeRange.Interval : (to - from) + "s")} ";
    }

    public static string ToOperatorString(QueryOperator queryOperator) =>
        queryOperator switch
        {
            QueryOperator.Subtract => " - ",
            QueryOperator.Sum => " + ",
            QueryOperator.Times => " * ",
            QueryOperator.Divide => " / ",
            _ => throw new System.InvalidOperationException("Invalid QueryOperator enum value"),
        };
}
