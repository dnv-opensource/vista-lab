using Microsoft.AspNetCore.Mvc;
using QueryApi.Models;
using QueryApi.Repository;
using SearchClient;
using System.ComponentModel;
using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;

namespace QueryApi.Controllers;

[ApiController]
public sealed class SearchController : ControllerBase
{
    private readonly ISearchClient _searchClient;
    private readonly DataChannelRepository _dataChannelRepository;
    private readonly IVIS _vis;

    public SearchController(
        ISearchClient searchClient,
        DataChannelRepository dataChannelRepository,
        IVIS vis
    )
    {
        _searchClient = searchClient;
        _dataChannelRepository = dataChannelRepository;
        _vis = vis;
    }

    public sealed record GmodSearchResult(IReadOnlyList<GmodSearchStrategyResult> Strategies);

    public sealed record GmodSearchStrategyResult(
        string Strategy,
        string Query,
        IReadOnlyList<string> HitsPlaintext,
        IReadOnlyList<GmodSearchStrategyResultHit> Hits
    );

    public sealed record GmodSearchStrategyResultHit(float Score, GmodPath Path);

    public sealed record GmodSearchResultDto(IReadOnlyList<GmodSearchStrategyResultDto> Strategies);

    public sealed record GmodSearchStrategyResultDto(
        string Strategy,
        string Query,
        IReadOnlyList<string> HitsPlaintext,
        IReadOnlyList<GmodSearchStrategyResultHitDto> Hits
    );

    public sealed record GmodSearchStrategyResultHitDto(float Score, string Path);

    public enum SearchScope
    {
        Any,
        PrimaryItem,
        SecondaryItem
    }

    public sealed record SearchRequestDto(
        string? VesselId,
        [property: DefaultValue("Main engine")] string? Phrase,
        [property: DefaultValue(SearchScope.Any)] SearchScope? Scope
    );

    /// <summary>
    /// Search for gmod paths.
    /// </summary>
    /// <param name="visVersion"></param>
    /// <param name="body"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [HttpPost]
    [Route("api/search/{visVersion}")]
    public async Task<ActionResult<IEnumerable<DataChannelListPackage>>> Search(
        Vista.SDK.VisVersion visVersion,
        SearchRequestDto body,
        CancellationToken cancellationToken
    )
    {
        var gmod = _vis.GetGmod(visVersion);

        var request = new SearchDto(body.Phrase, null, body.VesselId);

        var searchApiResultDto = await _searchClient.VISSearchAsync(
            (SearchClient.VisVersion)visVersion,
            request,
            cancellationToken
        );
        var filter = new DataChannelFilter();
        filter.VesselId = body.VesselId;

        if (searchApiResultDto.Hits is not null && searchApiResultDto.Hits.Count > 0)
        {
            switch (body.Scope)
            {
                case SearchScope.PrimaryItem:
                    filter.PrimaryItem = searchApiResultDto.Hits!
                        .Select(h => h.Document!.LocalId_PrimaryItem!)
                        .Where(p => p is not null)
                        .ToArray();
                    break;
                case SearchScope.SecondaryItem:
                    filter.SecondaryItem = searchApiResultDto.Hits!
                        .Select(h => h.Document!.LocalId_SecondaryItem!)
                        .Where(p => p is not null)
                        .ToArray();
                    break;
                default:
                    filter.PrimaryItem = searchApiResultDto.Hits!
                        .Select(h => h.Document!.LocalId_PrimaryItem!)
                        .Where(p => p is not null)
                        .ToArray();
                    filter.SecondaryItem = searchApiResultDto.Hits!
                        .Select(h => h.Document!.LocalId_SecondaryItem!)
                        .Where(p => p is not null)
                        .ToArray();
                    break;
            }
        }

        var dataChannelListPackage = await _dataChannelRepository.GetDataChannelByFilter(
            filter,
            cancellationToken
        );

        return Ok(dataChannelListPackage);
    }
}
