using MQTTnet;
using MQTTnet.Client;
using Serilog;
using System.Globalization;
using System.Reflection;
using Vista.SDK;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
    .ConfigureServices(services => services.AddHostedService<Simulator>())
    .Build();

await host.RunAsync();

public class Simulator : IHostedService
{
    const string clientId = "simulator-client";

    private readonly ILogger<Simulator> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;

    public Simulator(ILogger<Simulator> logger)
    {
        _logger = logger;

        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

        _mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer($"{ingestHost}", 5050)
            .WithClientId(clientId)
            .Build();
        _mqttFactory = new MqttFactory();
        _mqttClient = _mqttFactory.CreateMqttClient();
    }

    public async Task StartAsync(CancellationToken stoppingToken)
    {
        var dataChannelListDtos = (await GetDataChannelLists(stoppingToken)).ToArray();
        var dataChannelCount = dataChannelListDtos.Length;

        var maxThreads = Math.Min(Math.Min(Environment.ProcessorCount, dataChannelCount), 16);
        var threads = new Task[maxThreads];

        _logger.LogInformation(
            "Max threads available: {maxThreads}, ProcessorCount: {processorCount}",
            maxThreads,
            Environment.ProcessorCount
        );

        await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
        _logger.LogInformation("Connected to ingest API");
        await _mqttClient.PingAsync(stoppingToken);
        _logger.LogInformation("Pinged ingest API successfully");

        for (int i = 0; i < maxThreads; i++)
        {
            // Assumes no more than 16 data channel lists
            var dataChannelDto = dataChannelListDtos[i];
            threads[i] = Task.Run(() => SimulateDataChannel(dataChannelDto, stoppingToken));
        }
    }

    private async Task SimulateDataChannel(
        DataChannelListPackage dataChannelListDto,
        CancellationToken stoppingToken
    )
    {
        var dataChannelList = dataChannelListDto.ToDomainModel();
        await Send(dataChannelListDto);

        var header = dataChannelList.Package.Header;
        var dataChannels = GetDataChannelsForSimulation(dataChannelList);

        var tickInterval = System.TimeSpan.FromSeconds(1);
        var timer = new PeriodicTimer(tickInterval);

        var sentData = new Dictionary<string, List<(double Value, string? Quality)>>();

        var lastTick = DateTimeOffset.UtcNow.Subtract(tickInterval);
        do
        {
            var currentTick = DateTimeOffset.UtcNow;

            var timeSeries = Simulate(
                currentTick,
                lastTick,
                header,
                dataChannels,
                sentData,
                out var simulatedIds
            );

            if (simulatedIds.Count > 0)
                await Send(timeSeries.ToJsonDto());

            lastTick = currentTick;
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    Vista.SDK.Transport.TimeSeries.TimeSeriesDataPackage Simulate(
        DateTimeOffset currentTick,
        DateTimeOffset lastTick,
        Vista.SDK.Transport.DataChannel.Header header,
        DataChannelInfo[] dataChannels,
        Dictionary<string, List<(double Value, string? Quality)>> sentData,
        out List<string> channelIds
    )
    {
        var values = new List<string>();
        channelIds = new List<string>();
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

            channelIds.Add(dataChannelId.LocalId);
            values.Add(valueStr);
        }

        _logger.LogInformation(
            "Simulation tick for {channelCount} datachannels for {dataChannelListId}",
            channelIds.Count,
            header.DataChannelListId.Id
        );

        var tableData = new Vista.SDK.Transport.TimeSeries.TabularDataSet(
            currentTick,
            values,
            new List<string>()
        );
        var table = new Vista.SDK.Transport.TimeSeries.TabularData(
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
        return new Vista.SDK.Transport.TimeSeries.TimeSeriesDataPackage(
            new Vista.SDK.Transport.TimeSeries.Package(
                h,
                new[]
                {
                    new Vista.SDK.Transport.TimeSeries.TimeSeriesData(
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
          ? noiseData.Boolean
              ? 0
              : (noiseData.High - noiseData.Low) / 2
          : Noise(noiseData.Low, noiseData.High, noiseData.NoiseFactor, noiseData.Boolean, data);

        double Noise(
            double low,
            double high,
            double noiseFactor,
            bool isBoolean,
            IReadOnlyList<(double Value, string? Quality)> data
        )
        {
            var prevValue = data[^1].Value;
            if (isBoolean)
            {
                var rand = Random.Shared.NextDouble();
                // To reduce variation
                if (rand < 0.05)
                {
                    return prevValue == 1 ? 0 : 1;
                }
                return prevValue;
            }

            // factor * (high - low) * random number between -1 and 1
            var nextValue = Math.Max(
                Math.Min(
                    prevValue + noiseFactor * (high - low) * (Random.Shared.NextDouble() * 2 - 1),
                    high
                ),
                low
            );

            return nextValue;
        }

        bool TryGetDataChannelNoiseData(
            LocalIdBuilder localId,
            Vista.SDK.Transport.DataChannel.DataChannel dataChannel,
            out (double Low, double High, double NoiseFactor, bool Boolean) data
        )
        {
            data = (0, 0, 0, false);
            if (!TryGetRange(dataChannel, out var range))
                return false;

            // Boolean cases
            if (range.Low == 0 && range.High == 1)
            {
                data = (range.Low, range.High, 1, true);
                return true;
            }

            // Important that spesific cases are checked first
            (bool Condition, double NoiseFactor)[] generationCases = new[]
            {
                (
                    localId.Quantity == "pressure"
                        && localId.Content == "lubricating.oil"
                        && localId.State == "low"
                        && localId.Position == "inlet",
                    0.05
                ),
                (
                    localId.Quantity == "level"
                        && localId.Content == "diesel.oil"
                        && localId.State == "high",
                    0.05
                ),
                (
                    localId.Quantity == "temperature"
                        && localId.Content == "exhaust.gas"
                        && localId.Calculation == "deviation",
                    0.05
                ),
                (
                    localId.Quantity == "pressure"
                        && localId.Content == "lubricating.oil"
                        && localId.Position == "inlet",
                    0.05
                ),
                (localId.Quantity == "angle" && localId.Type == "request", 0.05),
                (localId.Quantity == "temperature", 0.05),
                (localId.Command == "shut.down", 0.05),
                (localId.Quantity == "frequency", 0.05),
                (localId.Quantity == "rotational.frequency", 0.05),
                (localId.Quantity == "wind.speed.vs.vessel", 0.05),
            };

            foreach (var generationCase in generationCases)
            {
                if (generationCase.Condition)
                {
                    data = (range.Low, range.High, generationCase.NoiseFactor, false);
                    return true;
                }
            }

            return false;
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

    async Task Send(Vista.SDK.Transport.Json.TimeSeriesData.TimeSeriesDataPackage timeSeriesData)
    {
        _logger.LogInformation(
            "Sending TimeSeriesData for {shipId}",
            timeSeriesData.Package.Header?.ShipID
        );
        var json = Serializer.Serialize(timeSeriesData);
        var imoNumber = timeSeriesData.Package.Header?.ShipID.Split("IMO")[1];
        if (string.IsNullOrWhiteSpace(imoNumber))
            return;

        await _mqttClient.PublishStringAsync("IMO/" + imoNumber!, json);
    }

    async Task Send(DataChannelListPackage dataChannelList)
    {
        _logger.LogInformation(
            "Sending DataChannelList for {shipId}",
            dataChannelList.Package.Header.ShipID
        );
        var json = Serializer.Serialize(dataChannelList);
        await _mqttClient.PublishStringAsync("DataChannelLists", json);
    }

    async Task<IEnumerable<DataChannelListPackage>> GetDataChannelLists(
        CancellationToken stoppingToken
    )
    {
        Stream GetResource(string resourceName)
        {
            return Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName)
                ?? throw new Exception("Couldnt find file");
        }
        var assembly = Assembly.GetExecutingAssembly();
        var names = assembly.GetManifestResourceNames();

        var dataChannels = new List<DataChannelListPackage>();

        foreach (var name in names)
        {
            await using var dataChannelsFile = GetResource(name);
            var dataChannelListDto = await Serializer.DeserializeDataChannelListAsync(
                dataChannelsFile,
                stoppingToken
            );
            if (dataChannelListDto is null)
                throw new Exception("Couldnt load datachannels");

            dataChannels.Add(dataChannelListDto);
        }

        return dataChannels.ToArray();
    }

    DataChannelInfo[] GetDataChannelsForSimulation(
        Vista.SDK.Transport.DataChannel.DataChannelListPackage dataChannelList
    )
    {
        return dataChannelList.Package.DataChannelList.DataChannel
            .Select(
                d =>
                    new DataChannelInfo(
                        LocalIdBuilder.TryParse(d.DataChannelId.LocalId, out var localId),
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

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _mqttClient.DisconnectedAsync += args =>
        {
            _logger.LogInformation("{clientId} - disconnected", clientId);
            return Task.CompletedTask;
        };

        await _mqttClient.DisconnectAsync();
    }

    private readonly record struct DataChannelInfo(
        bool LocalIdParsed,
        LocalIdBuilder? LocalId,
        Vista.SDK.Transport.DataChannel.DataChannel Channel
    );
}
