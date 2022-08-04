using Vista.SDK;

namespace Search.Api;

public enum SearchIndexStrategy
{
    BM25Similarity,
    DefaultSimilarity,
    All
}

public sealed record SearchGmod(
    VisVersion VisVersion,
    string Phrase,
    int TopResults,
    IEnumerable<SearchIndexStrategy> Strategies
);

internal interface ISearchService
{
    SearchResult Search(
        VisVersion version,
        string phrase,
        int topResults,
        IEnumerable<SearchIndexStrategy> searchStrategies
    );
}
