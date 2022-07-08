using Common.Models;
using Microsoft.AspNetCore.Mvc;
using VistaLab.QueryApi.Models;
using VistaLab.QueryApi.Repository;

namespace VistaLab.QueryApi.Controllers;

[ApiController]
public sealed class DataChannelController : ApiControllerBase<DataChannelController>
{
    private readonly IDataChannelRepository dataChannelRepository;

    public DataChannelController(IDataChannelRepository dataChannelRepository)
    {
        this.dataChannelRepository = dataChannelRepository;
    }

    /// <summary>
    /// Search for data channels based in the given filters
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel")]
    public async Task<ActionResult<IEnumerable<DataChannelDto>?>> Post(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var result = await dataChannelRepository.GetDataChannelByFilter(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Search for time series given a data channel internalId
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [Route("api/data-channel/{id}/time-series")]
    public async Task<ActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await dataChannelRepository.GetTimeSeriesByInternalId(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Search for time series given a data channel internalId
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/time-series")]
    public async Task<ActionResult> PostSearchByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var result = await dataChannelRepository.GetTimeSeriesByFilter(filter, cancellationToken);
        return Ok(result);
    }
}
