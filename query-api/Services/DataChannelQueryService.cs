namespace VistaLab.Api.Services;

public sealed record DataChannelsQuery(
    // 411.1/C101
    // VE/400a/*/C101 -> GmodPath[] -> SELECT * FROM Sensors WHERE PrimaryItem in @gmodPaths
    // VE/*/411
    // string[] PrimaryItem - > ...

    // XPath? JsonPath?
    DataChannelsQueryPredicate[] Predicates
);

public sealed record DataChannelsQueryPredicate(string PrimmaryItem);

public static class QuestDBQueryTranslator
{
    // PrimaryItem: 411.1/C101 -> SELECT * FROM Sensors WHERE PrimaryItem = '411.1/C101'
    public static string Translate(DataChannelsQuery query) => "";
}

public sealed class DataChannelQueryService
{
    public async Task<IEnumerable<object>> Query(DataChannelsQuery query)
    {
        var sqlQuery = QuestDBQueryTranslator.Translate(query);

        await Task.Yield();

        return Array.Empty<object>();
    }
}
