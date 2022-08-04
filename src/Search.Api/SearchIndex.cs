using System.Globalization;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

using Lucene.Net.Analysis.En;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.Search;
using Lucene.Net.Search.Similarities;
using Lucene.Net.Store;
using Lucene.Net.Util;

using Lucene.Net.QueryParsers.Classic;
using Vista.SDK;

namespace Search.Api;

public sealed record SearchResult(IReadOnlyList<SearchStrategyResult> Strategies);

public sealed record SearchStrategyResult(
    string Strategy,
    string Query,
    IReadOnlyList<SearchStrategyResultHit> Hits
);

public sealed record DocumentField(string Field, string Value, float Weight);

public sealed record SearchStrategyResultHit(float Score, GmodPath Path);

internal sealed class SearchIndex : IHostedService, IDisposable
{
    private static readonly LuceneVersion Version = LuceneVersion.LUCENE_48;
    private static readonly string CodeField = "code"; // GmodNode.Code
    private static readonly string PathField = "path"; // GmodNode.Path
    private static readonly string CommonNameField = "commonName"; // GmodNode.Metadata.CommonName

    private readonly Dictionary<string, float> _searchFields;

    private readonly ILogger<SearchIndex> _logger;
    private readonly Gmod _gmod;
    private readonly RAMDirectory _directory;
    private readonly EnglishAnalyzer _analyzer;
    private readonly IndexWriterConfig _indexConfig;
    private readonly IndexWriter _indexWriter;

    private readonly Channel<GmodPath> _documentGenerationChannel;
    private readonly Channel<Document> _indexingChannel;

    private long _pathsProcessedCount;
    private long _pathsIndexedCount;

    public SearchIndex(ILogger<SearchIndex> logger, Gmod gmod)
    {
        _logger = logger;
        _gmod = gmod;
        _directory = new RAMDirectory();
        _analyzer = new EnglishAnalyzer(Version);
        _indexConfig = new IndexWriterConfig(Version, _analyzer);
        _indexWriter = new IndexWriter(_directory, _indexConfig);
        _searchFields = new() { { CodeField, 1f }, { CommonNameField, 1f }, };

        _documentGenerationChannel = Channel.CreateBounded<GmodPath>(
            new BoundedChannelOptions(1024 * 4)
            {
                FullMode = BoundedChannelFullMode.Wait,
                SingleWriter = true,
                SingleReader = false,
            }
        );

        _indexingChannel = Channel.CreateBounded<Document>(
            new BoundedChannelOptions(1024 * 8 * 4)
            {
                FullMode = BoundedChannelFullMode.Wait,
                SingleWriter = false,
                SingleReader = false,
            }
        );
    }

    public long Size => _directory.GetSizeInBytes();

    public long PathsProcessedCount => _pathsProcessedCount;

    public long PathsIndexedCount => _pathsIndexedCount;

    private string ActivityName([CallerMemberName] string caller = "") =>
        $"{nameof(LuceneSearchService)}.{caller}";

    private string ActivityNameForLocal(
        string localFunction,
        [CallerMemberName] string caller = ""
    ) => $"{ActivityName(caller)}.{localFunction}";

    private async Task DocumentGenerationThread(CancellationToken cancellationToken)
    {
        try
        {
            var reader = _documentGenerationChannel.Reader;

            while (await reader.WaitToReadAsync())
            {
                cancellationToken.ThrowIfCancellationRequested();

                while (reader.TryRead(out var path))
                {
                    var node = path.Node;

                    var doc = new Document();

                    var fields = new List<DocumentField>();
                    var pathStr = path.ToString();
                    var parentsLength = path.Length - 1;
                    var code = node.Code;

                    var boostPunisher = 1f;
                    var boostEnhancer = 1f;

                    fields.Add(
                        new(CodeField, code, _searchFields.GetValueOrDefault(CodeField, 1f))
                    );

                    fields.Add(new(PathField, pathStr, 1f));

                    var commonName = path.GetCommonNames().LastOrDefault().Name;
                    if (!string.IsNullOrWhiteSpace(commonName))
                        fields.Add(
                            new(
                                CommonNameField,
                                commonName,
                                _searchFields.GetValueOrDefault(CommonNameField, 1f)
                            )
                        );

                    if (
                        node.Metadata.Category.ToLower().Equals("product")
                        && node.Metadata.Type.ToLower().Equals("type")
                    )
                        boostEnhancer = 1.5f;

                    for (int i = 0; i < fields.Count; i++)
                    {
                        var field = fields[i];

                        if (field is null || field.Value is null)
                            continue;

                        var docField = new TextField(field.Field, field.Value, Field.Store.YES);
                        // statBoostFactor * base weight * enhancer/punisher
                        var boost = field.Weight * (boostEnhancer / boostPunisher);
                        docField.Boost = boost;

                        doc.Add(docField);
                    }

                    while (!_indexingChannel.Writer.TryWrite(doc))
                        Thread.Sleep(10);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error on DocumentGeneration thread");
            throw;
        }
    }

    private async Task<RAMDirectory> IndexingThread(int thread, CancellationToken cancellationToken)
    {
        try
        {
            const int batchSize = 64;
            var reader = _indexingChannel.Reader;
            var batch = new Document[batchSize];
            var analyzer = new EnglishAnalyzer(Version);
            var indexConfig = new IndexWriterConfig(Version, analyzer);
            var directory = new RAMDirectory();
            using var indexWriter = new IndexWriter(directory, indexConfig);
            var total = 0;
            var batches = 0;

            while (await reader.WaitToReadAsync())
            {
                cancellationToken.ThrowIfCancellationRequested();

                var currentIndex = 0;
                while (currentIndex < batch.Length && reader.TryRead(out var document))
                {
                    batch[currentIndex++] = document;
                    total++;
                }

                if (currentIndex == 0)
                    continue;

                batches++;
                indexWriter.AddDocuments(batch.Take(currentIndex));
                Interlocked.Add(ref _pathsIndexedCount, currentIndex);

                if (batches % 1000 == 0)
                    _logger.LogInformation(
                        "[VisVersion={visVersion}, Thread={thread}] indexed {total} paths in {batches} batches so far - currentBatchSize={batchSize}",
                        _gmod.VisVersion.ToVersionString(),
                        thread,
                        total.ToString("N0", CultureInfo.InvariantCulture),
                        batches.ToString("N0", CultureInfo.InvariantCulture),
                        currentIndex
                    );
            }

            _logger.LogInformation(
                "[VisVersion={visVersion}, Thread={thread}] done indexing {total} paths in {batches} batches",
                _gmod.VisVersion.ToVersionString(),
                thread,
                total.ToString("N0", CultureInfo.InvariantCulture),
                batches.ToString("N0", CultureInfo.InvariantCulture)
            );
            indexWriter.ForceMerge(1);
            indexWriter.Commit();
            return directory;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error on indexing thread");
            throw;
        }
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var activity = Diagnostics.Source.StartActivity(ActivityName());
        activity.AddVisVersion(_gmod.VisVersion);
        _logger.LogInformation(
            "[VisVersion={visVersion}] building gmod search index",
            _gmod.VisVersion.ToVersionString()
        );

        var maxThreads = Math.Min(Environment.ProcessorCount, 16);

        _logger.LogInformation(
            "Max threads available: {maxThreads}, ProcessorCount: {processorCount}",
            maxThreads,
            Environment.ProcessorCount
        );

        var usedThreads = 0;

        var threadAllocations = new int[]
        {
            usedThreads += Math.Max(1, (int)Math.Ceiling(maxThreads * 0.4)),
            Math.Max(1, maxThreads - usedThreads - 1)
        };

        var documentGenerationTasks = Enumerable
            .Range(0, threadAllocations[0])
            .Select(i => Task.Run(() => DocumentGenerationThread(cancellationToken)))
            .ToArray();

        var indexingTasks = Enumerable
            .Range(0, threadAllocations[1])
            .Select(i => Task.Run(() => IndexingThread(i, cancellationToken)))
            .ToArray();

        var context = new FindContext(new LongPaths(), cancellationToken);

        var completed = _gmod.Traverse(
            context,
            (context, parents, node) =>
            {
                if (context.CancellationToken.IsCancellationRequested)
                    return TraversalHandlerResult.Stop;

                if (parents.Count == 0)
                    return TraversalHandlerResult.Continue;
                if (node.Code.EndsWith("99"))
                    return TraversalHandlerResult.SkipSubtree;

                var pathParents = parents.ToList();
                var path = new GmodPath(pathParents, node);
                context.LongPaths.TryAdd(path.ToString());

                while (!_documentGenerationChannel.Writer.TryWrite(path))
                    Thread.Sleep(10);

                if (++_pathsProcessedCount % 100_000 == 0)
                    _logger.LogInformation(
                        "[VisVersion={visVersion}] found {gmodPathsCount} -> {indexed} gmod paths",
                        _gmod.VisVersion.ToVersionString(),
                        PathsProcessedCount.ToString("N0", CultureInfo.InvariantCulture),
                        PathsIndexedCount.ToString("N0", CultureInfo.InvariantCulture)
                    );

                return context.CancellationToken.IsCancellationRequested
                  ? TraversalHandlerResult.Stop
                  : TraversalHandlerResult.Continue;
            }
        );

        activity.AddGmodPathCount(PathsProcessedCount);

        if (!completed || cancellationToken.IsCancellationRequested)
        {
            _logger.LogInformation(
                "[VisVersion={visVersion}] cancellation requested, exiting...",
                _gmod.VisVersion.ToVersionString()
            );
            return;
        }

        _documentGenerationChannel.Writer.Complete();
        await Task.WhenAll(documentGenerationTasks);

        _indexingChannel.Writer.Complete();
        var directories = await Task.WhenAll(indexingTasks);

        _logger.LogInformation(
            "[VisVersion={visVersion}] done indexing - processed={processed}, indexed={indexed}",
            _gmod.VisVersion.ToVersionString(),
            PathsProcessedCount.ToString("N0", CultureInfo.InvariantCulture),
            PathsIndexedCount.ToString("N0", CultureInfo.InvariantCulture)
        );

        using (
            var commitActivity = Diagnostics.Source.StartActivity(
                ActivityNameForLocal("CommitIndex")
            )
        )
        {
            _indexWriter.AddIndexes(directories);

            _logger.LogInformation(
                "[VisVersion={visVersion}] done inserting index documents - count={documentCount} - merging and committing...",
                _gmod.VisVersion.ToVersionString(),
                _indexWriter.NumDocs.ToString("N0", CultureInfo.InvariantCulture)
            );
            commitActivity.AddIndexDocumentCount(_indexWriter.NumDocs);

            _indexWriter.ForceMerge(1);
            _indexWriter.Commit();

            foreach (var dir in directories)
                dir?.Dispose();

            _logger.LogInformation(
                "[VisVersion={visVersion}] merged and committed index",
                _gmod.VisVersion.ToVersionString()
            );
        }

        var longPaths = context.LongPaths.ToArray();
        _logger.LogInformation(
            "[VisVersion={visVersion}] long paths:\n{longPaths}",
            _gmod.VisVersion.ToVersionString(),
            string.Join("\n", longPaths)
        );

        _logger.LogInformation(
            "[VisVersion={visVersion}] completed building index!",
            _gmod.VisVersion.ToVersionString()
        );
    }

    public SearchResult Search(
        string phrase,
        int topResults,
        IEnumerable<SearchIndexStrategy> searchStrategies
    )
    {
        var strategies = new List<SearchStrategyResult>();

        foreach (var strategy in searchStrategies)
        {
            switch (strategy)
            {
                case SearchIndexStrategy.All:
                    RunFuzzyQuery(phrase, topResults, strategies, new DefaultSimilarity());
                    RunFuzzyQuery(phrase, topResults, strategies, new BM25Similarity());
                    break;
                case SearchIndexStrategy.DefaultSimilarity:
                    RunFuzzyQuery(phrase, topResults, strategies, new DefaultSimilarity());
                    break;
                case SearchIndexStrategy.BM25Similarity:
                    RunFuzzyQuery(phrase, topResults, strategies, new BM25Similarity());
                    break;
            }
        }

        return new SearchResult(strategies);
    }

    private void RunFuzzyQuery(
        string phrase,
        int topResults,
        List<SearchStrategyResult> strategies,
        Similarity similarity
    )
    {
        using var reader = _indexWriter.GetReader(false);
        var searcher = new IndexSearcher(reader);
        searcher.Similarity = similarity;

        var searchFields = _searchFields.Keys.ToArray();

        var query = new BooleanQuery();
        var parser = new MultiFieldQueryParser(Version, searchFields, _analyzer);

        var words = phrase.Split(Array.Empty<char>(), StringSplitOptions.RemoveEmptyEntries);

        foreach (var word in words)
            query.Add(parser.Parse(word), Occur.SHOULD);

        var hits = searcher.Search(query, topResults);

        var paths = hits.ScoreDocs
            .Select(
                hit =>
                {
                    var doc = reader.Document(hit.Doc);
                    var pathStr = doc.Get(PathField);
                    var path = GmodPath.Parse(pathStr, _gmod);
                    return new SearchStrategyResultHit(hit.Score, path);
                }
            )
            .ToArray();

        var strategy = $"Lucene-Fuzzy-{similarity.GetType().Name}";
        _logger.LogInformation(
            "[VisVersion={visVersion}] {strategy} - searched for '{phrase}' using {queryTypeName} - q='{query}'",
            _gmod.VisVersion.ToVersionString(),
            strategy,
            phrase,
            query.GetType().Name,
            query.ToString()
        );

        var result = new SearchStrategyResult(strategy, query.ToString(), paths);

        strategies.Add(result);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _indexWriter.Dispose();
        _analyzer.Dispose();
    }

    private readonly struct LongPaths
    {
        private const int Size = 10;
        private readonly PriorityQueue<string, int> _paths;

        public LongPaths()
        {
            _paths = new PriorityQueue<string, int>(Size + 1);
        }

        public void TryAdd(string path)
        {
            if (!_paths.TryPeek(out var smallestPath, out _) || _paths.Count < Size)
            {
                _paths.Enqueue(path, path.Length);
                return;
            }

            if (path.Length < smallestPath.Length)
                return;

            _paths.Dequeue();
            _paths.Enqueue(path, path.Length);
        }

        public string[] ToArray() =>
            _paths.UnorderedItems.Select(i => i.Element).OrderByDescending(p => p.Length).ToArray();
    }

    private sealed record FindContext(LongPaths LongPaths, CancellationToken CancellationToken);
}
