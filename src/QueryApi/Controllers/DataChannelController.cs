using Microsoft.AspNetCore.Mvc;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;
using QueryApi.Models;
using QueryApi.Repository;

namespace QueryApi.Controllers;

[ApiController]
public sealed class DataChannelController : ControllerBase
{
    private readonly DataChannelRepository _dataChannelRepository;

    public DataChannelController(DataChannelRepository dataChannelRepository)
    {
        _dataChannelRepository = dataChannelRepository;
    }

    /// <summary>
    /// Search for data channels based in the given filters
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel")]
    public async Task<ActionResult<IEnumerable<DataChannel>>> Post(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetDataChannelByFilter(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Search for time series given a data channel internalId
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [Route("api/data-channel/{id}/time-series")]
    public async Task<ActionResult<IEnumerable<EventDataSet>>> Get(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetTimeSeriesByInternalId(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Search for time series given a data channel internalId
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/time-series")]
    public async Task<ActionResult<IEnumerable<EventDataSet>>> PostSearchByFilter(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetTimeSeriesByFilter(filter, cancellationToken);
        return Ok(result);
    }
}
