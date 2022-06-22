using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public static class SQLHelper
    {
        private const string SELECT_DATA_CHANNEL = "SELECT * FROM DataChannel ";
        private const string SELECT_TIME_SERIES =
            @"
SELECT TS.DataChannelId, TS.VesselId, TS.Value, TS.Quality, TS.Timestamp
FROM TimeSeries AS TS
  JOIN DataChannel_InternalId AS DC_ID ON TS.DataChannelId = DC_ID.DataChannelId AND TS.VesselId = DC_ID.VesselId";
        private const string TIME_SERIES_DATA_CHANNEL_JOIN =
            " JOIN DataChannel DC ON DC_ID.InternalId = DC.InternalId";

        internal static string MountDataChannelSQL(DataChannelFilter filter) =>
            SELECT_DATA_CHANNEL + MountDataChannelWhere(filter);

        internal static string MountTimeSeriesSQL(Guid internalId) =>
            $"{SELECT_TIME_SERIES} WHERE DC_ID.InternalId = '{internalId}'";

        internal static string MountTimeSeriesSQL(DataChannelFilter filter) =>
            SELECT_TIME_SERIES + TIME_SERIES_DATA_CHANNEL_JOIN + MountDataChannelWhere(filter);

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
                        x =>
                            $" LocalId_PrimaryItem LIKE \'%{x.Replace("/", string.Empty).Replace('*', '%')}%\' "
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
                            $" LocalId_SecondaryItem LIKE \'%{x.Replace("/", string.Empty).Replace('*', '%')}%\' "
                    )
                );
            return sql;
        }
    }
}
