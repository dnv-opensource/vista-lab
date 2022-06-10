using System.Reflection;
using Vista.SDK;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.TimeSeries;
using Serilog;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
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
        // await using var timeSeriesFile = GetResource("resources/TimeSeriesData.json");

        var dataChannelListDto = await Serializer.DeserializeDataChannelListAsync(dataChannelsFile);
        if (dataChannelListDto is null)
            throw new Exception("Couldnt load datachannels");
        var dataChannelList = dataChannelListDto.ToDomainModel();
        // var timeSeriesData = await Serializer.DeserializeTimeSeriesDataAsync(timeSeriesFile);

        var header = dataChannelList.Package.Header;
        var parsedDataChannels = dataChannelList.Package.DataChannelList.DataChannel
            .Select(
                d =>
                {
                    try
                    {
                        return (
                            LocalIdParsed: LocalId.TryParse(
                                d.DataChannelId.LocalId,
                                out var localId
                            ),
                            LocalId: localId,
                            Channel: d
                        );
                    }
                    catch
                    {
                        _logger.LogError("Failed to parse {id}", d.DataChannelId.LocalId);
                        return (LocalIdParsed: false, LocalId: null, Channel: d);
                    }
                }
            )
            .ToArray();
        var dataChannels = parsedDataChannels
            .Where(
                d =>
                    d.LocalIdParsed
                    && (d.LocalId?.IsValid ?? false)
                    && !d.Channel.DataChannelId.LocalId.Contains("~", StringComparison.Ordinal)
            )
            .ToArray();
        var invalidChannels = parsedDataChannels
            .Where(d => !d.LocalIdParsed || d.LocalId?.IsValid == false)
            .ToArray();

        var timer = new PeriodicTimer(System.TimeSpan.FromSeconds(10));

        var sentData = new Dictionary<string, List<(double Value, string? Quality)>>();

        var lastTick = DateTimeOffset.UtcNow.AddMinutes(-1);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            var currentTick = DateTimeOffset.UtcNow;
            _logger.LogInformation("Seed {currentTick}", currentTick.ToString());

            var values = new List<string>();
            var shortIds = new List<string>();
            foreach (var dataChannel in dataChannels)
            {
                var dataChannelId = dataChannel.Channel.DataChannelId;
                if (!sentData.TryGetValue(dataChannelId.LocalId, out var data))
                    sentData[dataChannelId.LocalId] = data =
                        new List<(double Value, string? Quality)>(32);

                var value = TryAddData(dataChannel, data);
                if (value is null)
                    continue;

                var valueStr = value.Value.ToString("0.00");
                data.Add((value.Value, null));

                shortIds.Add(dataChannelId.ShortId ?? dataChannelId.LocalId);
                values.Add(valueStr);
            }

            var tableData = new TabularDataSet(currentTick, values, null);
            var table = new TabularData(
                shortIds.Count.ToString(),
                shortIds.Count.ToString(),
                shortIds,
                new[] { tableData }
            );

            var h = new Vista.SDK.Transport.TimeSeries.Header(
                header.ShipId,
                new Vista.SDK.Transport.TimeSeries.TimeSpan(lastTick, currentTick),
                currentTick,
                currentTick,
                "DNV",
                null,
                new Dictionary<string, object>()
            );
            var timeSeries = new TimeSeriesDataPackage(
                new Vista.SDK.Transport.TimeSeries.Package(
                    h,
                    new[]
                    {
                        new TimeSeriesData(
                            null,
                            new[] { table },
                            null,
                            new Dictionary<string, object>()
                        )
                    }
                )
            );

            lastTick = currentTick;
        }
    }

    double? TryAddData(
        (bool LocalIdParsed, LocalId? LocalId, Vista.SDK.Transport.DataChannel.DataChannel Channel) dataChannel,
        IReadOnlyList<(double Value, string? Quality)> data
    )
    {
        var dataChannelId = dataChannel.Channel.DataChannelId;
        var localId = dataChannel.LocalId;
        if (localId is null)
            return null;

        if (localId.Quantity == "temperature")
        {
            var (low, high) = GetRange();

            var value = data.Count == 0 ? high / low : Noise(high, low, data);

            return value;
        }

        return null;

        (double Low, double High) GetRange()
        {
            var range = dataChannel.Channel.Property.Range;
            if (range is null)
                return (0, 100);

            return (double.Parse(range.Low), double.Parse(range.High));
        }

        double Noise(double low, double high, IReadOnlyList<(double Value, string? Quality)> data)
        {
            var prevValue = data[^1].Value;
            return prevValue + (Random.Shared.NextDouble() - 0.5);
        }
    }

    async Task Send(TimeSeriesDataPackage timeSeriesData)
    {
        await Task.Delay(1);
    }
}
