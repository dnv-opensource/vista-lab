using Microsoft.AspNetCore.Mvc;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;
using QueryApi.Models;
using QueryApi.Repository;
using System.ComponentModel;
using static QueryApi.Repository.DataChannelRepository;

namespace QueryApi.Controllers;

[ApiController]
public sealed class DataChannelController : ControllerBase
{
    private readonly DataChannelRepository _dataChannelRepository;

    public sealed record Coordinates(double Latitude, double Longitude);

    public sealed record Geometry(string Type, Coordinates Coordinates);

    public sealed record Feature(Geometry Geometry, FeatureProps Properties, string Type);

    public sealed record TimeSeriesRequestDto(
        [property: DefaultValue(
            "/dnv-v2/vis-3-4a/411.1-4/C101.31-3/meta/qty-temperature/pos-inlet"
        )]
            string LocalId
    );

    public sealed record PanelQueryDto(TimeRange TimeRange, IEnumerable<Query> Queries);

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
    public async Task<ActionResult<IEnumerable<DataChannelListPackage>>> GetDataChannelByFilter(
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

    /// <summary>
    /// Search for time series given a data channel internalId
    /// </summary>
    /// <param name="request"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/time-series/latest")]
    public async Task<
        ActionResult<DataChannelRepository.TimeSeriesDataWithProps>
    > GetLatestTimeSeriesValue(TimeSeriesRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _dataChannelRepository.GetLatestTimeSeriesForDataChannel(
            request.LocalId,
            cancellationToken
        );
        return Ok(result);
    }

    /// <summary>
    /// Retreives the latest vessel positions
    /// </summary>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [Route("api/data-channel/time-series/position/latest")]
    public async Task<ActionResult<IEnumerable<Feature>>> GetVesselPositions(
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetLatestVesselPositions(cancellationToken);

        var features = result.Select(
            r =>
            {
                var coordinates = new Coordinates(
                    r.Geometry.Coordinates.Latitude,
                    r.Geometry.Coordinates.Longitude
                );
                var geometry = new Geometry("Point", coordinates);
                return new Feature(geometry, r.Properties, "Feature");
            }
        );

        return Ok(features);
    }

    /// <summary>
    /// Get timeseries by queries
    /// </summary>
    /// <param name="query"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/time-series/query")]
    public async Task<ActionResult<IEnumerable<AggregatedQueryResult>>> GetTimeSeriesDataByQueries(
        PanelQueryDto query,
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetTimeSeriesByQueries(
            query.TimeRange,
            query.Queries,
            cancellationToken
        );

        return Ok(result);
    }
}
