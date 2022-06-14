using IngestApi.Repositories;
using System.Reflection;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;

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
        await TryInsert(cancellationToken);
    }

    private async Task TryInit(CancellationToken cancellationToken)
    {
        await _repository.Initialize(cancellationToken);
    }

    private async Task TryInsert(CancellationToken cancellationToken)
    {
        var dataChannelListDto = await GetDataChannelList(cancellationToken);

        await _repository.InsertDataChannel(dataChannelListDto, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    // This is just for testing json data
    async Task<DataChannelListPackage> GetDataChannelList(CancellationToken stoppingToken)
    {
        Stream GetResource(string name)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var names = assembly.GetManifestResourceNames();
            var resourceName = names.FirstOrDefault(n => n.EndsWith(name.Replace("/", ".")));
            if (resourceName is null)
                throw new Exception("Couldnt find file");
            return Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName)
                ?? throw new Exception("Couldnt find file");
        }

        await using var dataChannelsFile = GetResource("resources/DataChannelList.json");

        var dataChannelListDto = await Serializer.DeserializeDataChannelListAsync(
            dataChannelsFile,
            stoppingToken
        );
        if (dataChannelListDto is null)
            throw new Exception("Couldnt load datachannels");

        return dataChannelListDto;
    }
}
