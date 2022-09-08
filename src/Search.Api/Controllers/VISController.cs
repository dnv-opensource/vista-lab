using Microsoft.AspNetCore.Mvc;
using Nest;
using System.ComponentModel;
using Vista.SDK;
using static Search.Api.ElasticSearchService;

namespace Search.Api.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class VISController : ControllerBase
{
    private readonly ElasticSearchService _service;

    public VISController(ElasticSearchService service)
    {
        _service = service;
    }

    public sealed record SearchDto(
        string? VesselId,
        [property: DefaultValue("Main engine")] string Phrase,
        int? TopResults
    );

    /// <summary>
    /// Search for gmod paths.
    /// </summary>
    /// <param name="visVersion"></param>
    /// <param name="body"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [HttpPost]
    [Route("search/{visVersion}")]
    public async Task<ActionResult<HitResults>> Search(
        VisVersion visVersion,
        SearchDto body,
        CancellationToken cancellationToken
    )
    {
        var result = await _service.Search(
            visVersion,
            body.VesselId,
            body.Phrase,
            body.TopResults,
            cancellationToken
        );

        return Ok(result);
    }
}
