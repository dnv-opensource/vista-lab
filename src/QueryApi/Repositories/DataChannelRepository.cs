using Questdb.Net;
using Vista.SDK.Transport.DataChannel;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IQuestDBClient _client;

    public DataChannelRepository(IQuestDBClient client, ILogger<DataChannel> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<IEnumerable<DataChannelResult>> Get(DataChannelFilter filter) =>
        await _client
            .GetQueryApi()
            .QueryEnumerableAsync<DataChannelResult>(SQLHelper.MountSQL(filter));
}
