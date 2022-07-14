using QuestDB;

namespace IngestApi;

public class QuestDbInsertClient : IHostedService
{
    private readonly ILogger<QuestDbInsertClient> _logger;
    private LineTcpSender? _client;
    private readonly string _clientAddress;

    public LineTcpSender Client =>
        _client
        ?? throw new InvalidOperationException(
            $"Tried to use {nameof(QuestDbInsertClient)} before host was started"
        );

    public QuestDbInsertClient(ILogger<QuestDbInsertClient> logger)
    {
        _logger = logger;
        _clientAddress = Environment.GetEnvironmentVariable("ILP_HOST") ?? "localhost";
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _client = await LineTcpSender.ConnectAsync(
            _clientAddress,
            9009,
            tlsMode: TlsMode.Disable,
            cancellationToken: cancellationToken
        );
        _logger.LogInformation("Connected ILP Database");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
