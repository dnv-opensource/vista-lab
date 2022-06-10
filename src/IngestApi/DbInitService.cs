using IngestApi.Repositories;

public sealed class DbInitService : IHostedService
{
    private readonly DataChannelRepository _repository;

    public DbInitService(DataChannelRepository repository)
    {
        _repository = repository;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await TryInit(cancellationToken);
    }

    private async Task TryInit(CancellationToken cancellationToken)
    {
        await _repository.Initialize(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
