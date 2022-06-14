using Common;
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

    public async Task<IEnumerable<DataChannel>?> Get(DataChannelFilter filter)
    {
        return await _client.Execute<IEnumerable<DataChannel>>(
            SQLHelper.MountSQL(filter),
            new CancellationToken()
        );
    }
}
