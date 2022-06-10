using Common;
using Vista.SDK.Transport.DataChannel;

namespace QueryApi.Repositories;

public sealed class DataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _client;

    public DataChannelRepository(IDbClient client, ILogger<DataChannel> logger)
    {
        _client = client;
        _logger = logger;
    }

    public ValueTask<T> Query<T>(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
