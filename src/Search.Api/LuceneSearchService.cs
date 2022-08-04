using System.Runtime.CompilerServices;

using UnitsNet;
using UnitsNet.Units;

using Vista.SDK;

namespace Search.Api;

public sealed class LuceneSearchService : ISearchService, IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LuceneSearchService> _logger;
    private readonly IVIS _vis;
    private readonly IConfiguration _configuration;
    private readonly SearchIndex[] _indices;

    private string ActivityName([CallerMemberName] string caller = "") =>
        $"{nameof(LuceneSearchService)}.{caller}";

    public LuceneSearchService(
        IServiceProvider serviceProvider,
        ILogger<LuceneSearchService> logger,
        IVIS vis,
        IConfiguration configuration
    )
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _vis = vis;
        _configuration = configuration;
        _indices = new SearchIndex[VisVersions.All.Count()];
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var activity = Diagnostics.Source.StartActivity(ActivityName());
        _logger.LogInformation("Building search indices...");

        var gmods = _vis.GetGmodsMap(VisVersions.All);

        var indices = gmods
            .Select(
                kvp =>
                    new SearchIndex(
                        _serviceProvider.GetRequiredService<ILogger<SearchIndex>>(),
                        kvp.Value
                    )
            )
            .ToArray();

        await Task.WhenAll(indices.Select(i => i.StartAsync(cancellationToken)));

        for (int i = 0; i < indices.Length; i++)
            _indices[i] = indices[i];

        activity?.Stop();

        var sizeInRam = _indices.Sum(i => i.Size);

        _logger.LogInformation(
            "All indices online! - buildDuration={buildDuration} estIndicesSize={estIndicesSize}",
            Duration.FromSeconds(activity?.Duration.TotalSeconds ?? 0d),
            Information.FromBytes(sizeInRam).ToUnit(InformationUnit.Megabyte)
        );
    }

    public SearchResult Search(
        VisVersion version,
        string phrase,
        int topResults,
        IEnumerable<SearchIndexStrategy> strategies
    )
    {
        var index = (int)version;
        return _indices[index].Search(phrase, topResults, strategies);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.WhenAll(_indices.Select(i => i.StopAsync(cancellationToken)));
    }

    public void Dispose()
    {
        foreach (var i in _indices)
            i?.Dispose();
    }
}
