using Common.Repositories.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Vista.SDK.Transport.DataChannel;

namespace Common.Repositories;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _client;

    public DataChannelRepository(
        IServiceProvider serviceProvider,
        IDbClient client,
        ILogger<DataChannel> logger
    )
    {
        _client = client;
        _logger = logger;
    }

    public async ValueTask Initialize(CancellationToken cancellationToken)
    {
        var query =
            $@"
            {DbInitTables.DataChannel}
            {DbInitTables.DataChannelLabel}
            {DbInitTables.FormatRestriction}
            {DbInitTables.TimeSeries}
        ";

        try
        {
            foreach (var q in query.Split(";"))
            {
                await _client.Execute(q, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database");
            throw;
        }
    }
}
