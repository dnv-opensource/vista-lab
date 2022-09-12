using Microsoft.AspNetCore.Mvc;
using QueryApi.Models;
using QueryApi.Repository;
using System.ComponentModel;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;
using static QueryApi.Repository.DataChannelRepository;

namespace QueryApi.Controllers;

[ApiController]
public sealed class DataChannelController : ControllerBase
{
    private readonly DataChannelRepository _dataChannelRepository;
    private readonly SimulatorClient.ISimulatorClient _simulatorClient;

    public sealed record Coordinates(double Latitude, double Longitude);

    public sealed record Geometry(string Type, Coordinates Coordinates);

    public sealed record Feature(Geometry Geometry, FeatureProps Properties, string Type);

    public sealed record TimeSeriesRequestDto(
        [property: DefaultValue(
            "/dnv-v2/vis-3-4a/411.1-4/C101.31-3/meta/qty-temperature/pos-inlet"
        )]
            string LocalId,
        string? VesselId
    );

    public sealed record PanelQueryDto(TimeRange TimeRange, IEnumerable<Query> Queries);

    public DataChannelController(
        DataChannelRepository dataChannelRepository,
        SimulatorClient.ISimulatorClient simulatorClient
    )
    {
        _dataChannelRepository = dataChannelRepository;
        _simulatorClient = simulatorClient;
    }

    /// <summary>
    /// Import datachannels file and simulate
    /// </summary>
    /// <param name="file"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/import-file-and-simulate")]
    public async Task<ActionResult> PostImportFileAndSimulate(
        IFormFile file,
        CancellationToken cancellationToken
    )
    {
        var stream = file.OpenReadStream();
        await _simulatorClient.ImportDataChannelsFileAndSimulateAsync(stream, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Get distinct vessels with info
    /// </summary>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [Route("api/data-channel/vessels")]
    public async Task<ActionResult<IEnumerable<Vessel>>> GetVessels(
        CancellationToken cancellationToken
    )
    {
        var result = await _dataChannelRepository.GetVessels(cancellationToken);

        return Ok(result);
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
            request.VesselId,
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

    /// <summary>
    /// Get aggregated values from timeseries as report
    /// </summary>
    /// <param name="query"></param>
    /// <param name="cancellationToken"></param>
    [HttpPost]
    [Route("api/data-channel/time-series/query/report")]
    public async Task<
        ActionResult<IEnumerable<AggregatedQueryResultAsReport>>
    > GetTimeSeriesDataByQueriesAsReport(PanelQueryDto query, CancellationToken cancellationToken)
    {
        var report = await _dataChannelRepository.GetReportByQueries(
            query.TimeRange,
            query.Queries,
            cancellationToken
        );
        return Ok(report);
    }
}
