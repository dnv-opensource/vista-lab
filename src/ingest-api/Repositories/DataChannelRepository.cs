using Common;
using Vista.SDK.Transport.DataChannel;
using Vista.SDK.Transport.TimeSeries;

namespace Vista.IngestApi.Repositories;

public interface IDataChannelRepository
{
    ValueTask Initialize(CancellationToken cancellationToken);
    ValueTask InsertDataChannel(DataChannel dataChannel, CancellationToken cancellationToken);
    ValueTask InsertTimeSeriesData(
        TimeSeriesData timeSeriesData,
        CancellationToken cancellationToken
    );
}

public sealed class DataChannelRepository : IDataChannelRepository
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
