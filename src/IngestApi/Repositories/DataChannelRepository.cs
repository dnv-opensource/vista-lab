using Common;
using Vista.SDK.Transport.DataChannel;
using Vista.SDK.Transport.TimeSeries;

namespace IngestApi.Repositories;

public sealed class DataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _client;

    public DataChannelRepository(IDbClient client, ILogger<DataChannel> logger)
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
            var queries = query.Split(
                ";",
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            );
            foreach (var q in queries)
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

    public ValueTask InsertDataChannel(DataChannel dataChannel, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public ValueTask InsertTimeSeriesData(
        TimeSeriesData timeSeriesData,
        CancellationToken cancellationToken
    )
    {
        throw new NotImplementedException();
    }
}
