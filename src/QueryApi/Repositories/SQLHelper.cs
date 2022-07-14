using Common;
using QueryApi.Models;

namespace QueryApi.Repository;

public static class SQLGenerator
{
    private static readonly string SELECT_DATA_CHANNEL = $"SELECT * FROM {DataChannelEntity.TableName}";

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

    private static readonly string ORDER_BY_TIME_STAMP = $" ORDER BY TS.{nameof(TimeSeriesEntity.Timestamp)} DESC ";

    internal static string MountDataChannelSQL(DataChannelFilter filter) =>
        SELECT_DATA_CHANNEL + MountDataChannelWhere(filter);

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
        var primaryItemsSQL = MountPrimaryItemFilter(filter);
        var secondaryItemsSQL = MountSecondaryItemFilter(filter);

        if (primaryItemsSQL != null || secondaryItemsSQL != null)
        {
            whereSQL = " WHERE ";

            if (!string.IsNullOrWhiteSpace(primaryItemsSQL))
                whereSQL += primaryItemsSQL;

            if (!string.IsNullOrWhiteSpace(secondaryItemsSQL))
            {
                if (!string.IsNullOrWhiteSpace(whereSQL))
                    whereSQL += " OR ";

                whereSQL += secondaryItemsSQL;
            }
        }

        return whereSQL;
    }

    private static string MountPrimaryItemFilter(DataChannelFilter filter)
    {
        var sql = string.Empty;
        if (filter.PrimaryItem != null && filter.PrimaryItem.Any())
            sql += string.Join(
                " OR ",
                filter.PrimaryItem.Select(
                    x => $" {nameof(DataChannelEntity.LocalId_PrimaryItem)} LIKE \'%{x.Replace('*', '%')}\' "
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
                    x => $" {nameof(DataChannelEntity.LocalId_SecondaryItem)} LIKE \'%{x.Replace('*', '%')}\' "
                )
            );
        return sql;
    }
}
