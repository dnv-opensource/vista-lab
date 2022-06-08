IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(
        services =>
        {
            services.AddHostedService<Simulator>();
        }
    )
    .Build();

await host.RunAsync();

public class Simulator : BackgroundService
{
    private readonly ILogger<Simulator> _logger;

    public Simulator(ILogger<Simulator> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            await Task.Delay(1000, stoppingToken);
        }
    }
}
