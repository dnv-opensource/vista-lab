using QuestDB;

namespace IngestApi;

public class QuestDbInsertClient
{
    private readonly ILogger<QuestDbInsertClient> _logger;
    private LineTcpSender? _client;
    private readonly string _clientAddress;

    public LineTcpSender? Client => _client;

    public QuestDbInsertClient(ILogger<QuestDbInsertClient> logger)
    {
        _logger = logger;
        _clientAddress = Environment.GetEnvironmentVariable("ILP_HOST") ?? "localhost";
    }

    public async Task ConnectAsync(CancellationToken stoppingToken)
    {
        _client = await LineTcpSender.ConnectAsync(
            _clientAddress,
            9009,
            tlsMode: TlsMode.Disable,
            cancellationToken: stoppingToken
        );
        _logger.LogInformation("Connected ILP Database");
    }
}
