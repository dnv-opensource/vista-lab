using System.ComponentModel;
using System.Globalization;

using Microsoft.AspNetCore.Mvc;
using Vista.SDK;

namespace Search.Api.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class VISController : ControllerBase
{
    private readonly LuceneSearchService _service;

    public VISController(LuceneSearchService service)
    {
        _service = service;
    }

    public sealed record GmodSearchRequestDto(
        string Phrase,
        [property: DefaultValue(50)] int TopResults,
        [property: DefaultValue(new SearchIndexStrategy[] { SearchIndexStrategy.BM25Similarity })]
            IReadOnlyList<SearchIndexStrategy> Strategies
    );

    public sealed record GmodSearchResultDto(IReadOnlyList<GmodSearchStrategyResultDto> Strategies);

    public sealed record GmodSearchStrategyResultDto(
        string Strategy,
        string Query,
        IReadOnlyList<string> HitsPlaintext,
        IReadOnlyList<GmodSearchStrategyResultHitDto> Hits
    );

    public sealed record GmodSearchStrategyResultHitDto(float Score, string Path);

    /// <summary>
    /// Search for gmod paths.
    /// </summary>
    /// <param name="visVersion"></param>
    /// <param name="body"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [HttpPost("search/{visVersion}")]
    public ActionResult<GmodSearchResultDto> SearchGmod(
        VisVersion visVersion,
        GmodSearchRequestDto body,
        CancellationToken cancellationToken
    )
    {
        var result = _service.Search(visVersion, body.Phrase, body.TopResults, body.Strategies);

        var dto = new GmodSearchResultDto(
            result.Strategies
                .Select(
                    s =>
                        new GmodSearchStrategyResultDto(
                            s.Strategy,
                            s.Query,
                            s.Hits
                                .Select(
                                    h =>
                                        $"{h.Score.ToString("00.00", CultureInfo.InvariantCulture)} | {h.Path.ToStringDump()}"
                                )
                                .ToArray(),
                            s.Hits
                                .Select(
                                    h =>
                                        new GmodSearchStrategyResultHitDto(
                                            h.Score,
                                            h.Path.ToString()
                                        )
                                )
                                .ToArray()
                        )
                )
                .ToArray()
        );

        return Ok(dto);
    }
}
