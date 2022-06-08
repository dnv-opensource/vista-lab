using System.Data;
using System.Data.Common;

namespace VistaLab.Api;

public delegate DateTimeOffset Now();

public interface IDbSession : IAsyncDisposable
{
    DbConnection Connection { get; }

    ValueTask Begin(CancellationToken cancellation);

    ValueTask Execute(string query);
}

public sealed class DbSession : IDbSession
{
    private readonly ILogger<DbSession> _logger;
    private readonly DbConnection _connection;

    public DbSession(ILogger<DbSession> logger, DbConnection connection)
    {
        _logger = logger;
        _connection = connection;
    }

    public DbConnection Connection => _connection;

    public async ValueTask Begin(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Open connection");
        if (_connection.State != ConnectionState.Open)
            await _connection.OpenAsync(cancellationToken);
    }

    public async ValueTask Execute(string query)
    {
        _logger.LogInformation("Execute");
        await _connection.ExecuteAsync(query);
    }

    public async ValueTask DisposeAsync()
    {
        _logger.LogDebug("Disposing db session");
        await _connection.DisposeAsync();
    }
}
