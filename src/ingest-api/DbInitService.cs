using Vista.IngestApi.Repositories;

public delegate DateTimeOffset Now();

public sealed class DbInitService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;

    public DbInitService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        //var builder = new DbContextOptionsBuilder<QuestDbContext>();
        //var connectionString =
        //    _configuration["VISTA_LAB_QUEST_DB"]
        //    ?? throw new Exception("No DB connection string configured");

        //builder.UseNpgsql(connectionString);
        //await using var context = new QuestDbContext(builder.Options);

        //var createdDb = await context.Database.EnsureCreatedAsync(cancellationToken);

        //if (createdDb)
        //    _logger.LogInformation("Created DB");
        await TryInit(cancellationToken);
        //await TrySeed(cancellationToken);
    }

    private async Task TryInit(CancellationToken cancellationToken)
    {
        var dataChannelRepo = _serviceProvider.GetRequiredService<IDataChannelRepository>();
        await dataChannelRepo.Initialize(cancellationToken);
    }

    //private async Task TrySeed(CancellationToken cancellationToken)
    //{
    //    await using var scope = _serviceProvider.CreateAsyncScope();

    //    var dbSession = scope.ServiceProvider.GetRequiredService<IDbSession>();
    //    var now = scope.ServiceProvider.GetRequiredService<Now>();

    //    var vesselRepository = scope.ServiceProvider.GetRequiredService<IVesselRepository>();

    //    var existingVessels = await vesselRepository.List(cancellationToken);
    //    if (existingVessels.Any())
    //        return;

    //    await dbSession.Begin(cancellationToken);

    //    try
    //    {
    //        _logger.LogInformation("Seeding DB");

    //        var vessel = new Vessel(
    //            Guid.Parse("6c420700-ef3d-41c6-ac4a-a989514e0014"),
    //            "Test vessel",
    //            9879877
    //        );

    //        await vesselRepository.Create(vessel, cancellationToken);
    //    }
    //    catch (Exception ex)
    //    {
    //        _logger.LogError(ex, "Error seeding DB");
    //        await dbSession.DisposeAsync();
    //        throw;
    //    }

    //    _logger.LogInformation("DB seeded");
    //}

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
