using System.Reflection;
using Vista.SDK;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.TimeSeries;
using Serilog;
using System.Globalization;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
    .ConfigureServices(services => services.AddHostedService<Simulator>())
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
        var dataChannelListDto = await GetDataChannelList(stoppingToken);
        var dataChannelList = dataChannelListDto.ToDomainModel();

        await Send(dataChannelListDto);

        var header = dataChannelList.Package.Header;
        var dataChannels = GetDataChannelsForSimulation(dataChannelList);

        var tickInterval = System.TimeSpan.FromSeconds(10);
        var timer = new PeriodicTimer(tickInterval);

        var sentData = new Dictionary<string, List<(double Value, string? Quality)>>();

        var lastTick = DateTimeOffset.UtcNow.Subtract(tickInterval);
        do
        {
            var currentTick = DateTimeOffset.UtcNow;

            var timeSeries = Simulate(currentTick, lastTick, header, dataChannels, sentData);
            await Send(timeSeries);

            lastTick = currentTick;
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    TimeSeriesDataPackage Simulate(
        DateTimeOffset currentTick,
        DateTimeOffset lastTick,
        Vista.SDK.Transport.DataChannel.Header header,
        DataChannelInfo[] dataChannels,
        Dictionary<string, List<(double Value, string? Quality)>> sentData
    )
    {
        var values = new List<string>();
        var channelIds = new List<string>();
        for (int i = 0; i < dataChannels.Length; i++)
        {
            ref readonly var dataChannel = ref dataChannels[i];

            var dataChannelId = dataChannel.Channel.DataChannelId;
            if (!sentData.TryGetValue(dataChannelId.LocalId, out var data))
                sentData[dataChannelId.LocalId] = data = new List<(double Value, string? Quality)>(
                    32
                );

            var value = TryAddData(dataChannel, data);
            if (value is null)
                continue;

            var valueStr = value.Value.ToString("0.00", CultureInfo.InvariantCulture);
            data.Add((value.Value, null));

            channelIds.Add(dataChannelId.ShortId ?? dataChannelId.LocalId);
            values.Add(valueStr);
        }

        _logger.LogInformation("Simulation tick for {channelCount} datachannels", channelIds.Count);

        var tableData = new TabularDataSet(currentTick, values, null);
        var table = new TabularData(
            channelIds.Count.ToString(),
            channelIds.Count.ToString(),
            channelIds,
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
        return new TimeSeriesDataPackage(
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
    }

    double? TryAddData(
        in DataChannelInfo dataChannel,
        IReadOnlyList<(double Value, string? Quality)> data
    )
    {
        var dataChannelId = dataChannel.Channel.DataChannelId;
        var localId = dataChannel.LocalId;
        if (localId is null)
            return null;

        if (!TryGetDataChannelNoiseData(localId, dataChannel.Channel, out var noiseData))
            return null;

        return data.Count == 0
          ? (noiseData.High - noiseData.Low) / 2
          : Noise(noiseData.Low, noiseData.High, noiseData.NoiseDeviation, data);

        double Noise(
            double low,
            double high,
            double noiseDeviation,
            IReadOnlyList<(double Value, string? Quality)> data
        )
        {
            var prevValue = data[^1].Value;
            var nextValue = Math.Max(
                Math.Min(prevValue + noiseDeviation * (Random.Shared.NextDouble() - 0.5), high),
                low
            );

            return nextValue;
        }

        bool TryGetDataChannelNoiseData(
            LocalId localId,
            Vista.SDK.Transport.DataChannel.DataChannel dataChannel,
            out (double Low, double High, double NoiseDeviation) data
        )
        {
            data = (0, 0, 0);
            if (!TryGetRange(dataChannel, out var range))
                return false;

            (bool Condition, double NoiseFactor)[] generationCases = new[]
            {
                (localId.Quantity == "temperature", 1.0),
                (localId.Command == "shut.down", 1.0),
                (localId.Quantity == "frequency", 1.0),
                (
                    localId.Quantity == "level"
                        && localId.Content == "diesel.oil"
                        && localId.State == "high",
                    1.0
                ),
                (
                    localId.Quantity == "pressure"
                        && localId.Content == "lubricating.oil"
                        && localId.State == "low"
                        && localId.Position == "inlet",
                    1.0
                ),
                (
                    localId.Quantity == "temperature"
                        && localId.Content == "exhaust.gas"
                        && localId.Calculation == "deviation",
                    1.0
                )
            };

            var hit = generationCases.Where(c => c.Condition).ToArray();

            if (hit.Length == 0)
                return false;

            data = (range.Low, range.High, hit[0].NoiseFactor);

            return true;
        }

        bool TryGetRange(
            Vista.SDK.Transport.DataChannel.DataChannel dataChannel,
            out (double Low, double High) range
        )
        {
            range = (0, 100);
            var r = dataChannel.Property.Range;
            if (r is null)
                return false;

            range = (double.Parse(r.Low), double.Parse(r.High));
            return true;
        }
    }

    async Task Send(TimeSeriesDataPackage timeSeriesData)
    {
        _logger.LogInformation("Sending TimeSeriesData");
        await Task.Delay(1);
    }

    async Task Send(DataChannelListPackage dataChannelList)
    {
        _logger.LogInformation("Sending DataChannelList");
        await Task.Delay(1);
    }

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

    DataChannelInfo[] GetDataChannelsForSimulation(
        Vista.SDK.Transport.DataChannel.DataChannelListPackage dataChannelList
    )
    {
        return dataChannelList.Package.DataChannelList.DataChannel
            .Select(
                d =>
                    new DataChannelInfo(
                        LocalId.TryParse(d.DataChannelId.LocalId, out var localId),
                        localId,
                        d
                    )
            )
            .Where(
                d =>
                    d.LocalIdParsed
                    && (d.LocalId?.IsValid ?? false)
                    && !d.Channel.DataChannelId.LocalId.Contains("~", StringComparison.Ordinal)
            )
            .ToArray();
    }

    private readonly record struct DataChannelInfo(
        bool LocalIdParsed,
        LocalId? LocalId,
        Vista.SDK.Transport.DataChannel.DataChannel Channel
    );
}
