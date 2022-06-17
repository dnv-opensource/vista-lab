using Common;
using QueryApi.Models;
using Vista.SDK.Transport.DataChannel;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _client;

    public DataChannelRepository(IDbClient client, ILogger<DataChannel> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<IEnumerable<DataChannelDto>?> GetDataChannel(
        DataChannelFilter filter,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.ExecuteAsync<DataChannelResponse>(
            SQLHelper.MountDataChannelSQL(filter),
            cancellationToken
        );
        return response?.DataChannels;
    }

    public async Task<IEnumerable<TimeSeriesDto>?> GetTimeSeries(
        Guid internalId,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.ExecuteAsync<TimeSeriesResponse>(
            SQLHelper.MountTimeSeriesSQL(internalId),
            cancellationToken
        );
        return response?.TimeSeries;
    }
}
