using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public static class SQLHelper
    {
        private const string SQL_START = "SELECT * FROM DataChannel ";

        internal static string MountSQL(DataChannelFilter filter)
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

            return SQL_START + whereSQL;
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
