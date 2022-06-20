using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Serilog;
using System.Text;
using Vista.SDK;
using Vista.SDK.Mqtt;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.TimeSeriesData;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
    .ConfigureServices(services => services.AddHostedService<ChannelStreamer>())
    .Build();

await host.RunAsync();

public sealed class ChannelStreamer : IHostedService
{
    const string clientId = "channel-streamer-client";

    private readonly ILogger<ChannelStreamer> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;

    private Dictionary<string, string> _localIdMapping;

    private readonly string[] _subscriptionTopics = new string[] { "DataChannelLists", "IMO/#" };

    public ChannelStreamer(ILogger<ChannelStreamer> logger)
    {
        _logger = logger;
        _localIdMapping = new();

        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

        _mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer($"{ingestHost}", 5050)
            .WithClientId(clientId)
            .Build();
        _mqttFactory = new MqttFactory();
        _mqttClient = _mqttFactory.CreateMqttClient();
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _mqttClient.ConnectAsync(_mqttOptions, cancellationToken);
        _logger.LogInformation("{clientId} - Connected to broker", clientId);
        await _mqttClient.PingAsync(cancellationToken);
        _logger.LogInformation("{clientId} - Pinged broker successfully", clientId);

        foreach (var subscriptionTopic in _subscriptionTopics)
        {
            await _mqttClient.SubscribeAsync(
                new MqttTopicFilter() { Topic = subscriptionTopic },
                cancellationToken
            );
        }

        _mqttClient.ApplicationMessageReceivedAsync += async args =>
        {
            _logger.LogInformation(
                "{clientId} - Received message from {clientId} with topic {topic}",
                clientId,
                args.ClientId,
                args.ApplicationMessage.Topic
            );

            var message = args.ApplicationMessage;
            using var stream = new MemoryStream(message.Payload);
            switch (message.Topic)
            {
                case "DataChannelLists":
                    var dataChannelPackage = Serializer.DeserializeDataChannelList(stream)!;
                    _localIdMapping = dataChannelPackage.Package.DataChannelList.DataChannel
                        .Select(dc => dc.DataChannelID)
                        .Where(
                            dc =>
                                !string.IsNullOrEmpty(dc.ShortID)
                                && !_localIdMapping.ContainsKey(dc.ShortID)
                        )
                        .ToDictionary(d => d.ShortID!, d => d.LocalID);
                    break;
                default:

                    var package = Serializer.DeserializeTimeSeriesData(stream)!;

                    foreach (var timeSeries in package.Package.TimeSeriesData)
                    {
                        foreach (var table in timeSeries.TabularData!)
                        {
                            var size = int.Parse(table.NumberOfDataChannel!);
                            var data = table.DataSet![0];
                            for (int i = 0; i < size; i++)
                            {
                                var dataChannel = table.DataChannelID![i];

                                var localIdStr = IsLocalIdPreamble(dataChannel)
                                  ? dataChannel
                                  : _localIdMapping.TryGetValue(dataChannel, out var localIdValue)
                                      ? localIdValue
                                      : "";

                                if (string.IsNullOrWhiteSpace(localIdStr))
                                    continue;

                                var localId = LocalIdBuilder.Parse(localIdStr);

                                if (localId.PrimaryItem is not null)
                                {
                                    localId = localId.WithPrimaryItem(
                                        localId.PrimaryItem.WithoutLocations()
                                    );
                                }

                                if (localId.SecondaryItem is not null)
                                {
                                    localId = localId.WithSecondaryItem(
                                        localId.SecondaryItem.WithoutLocations()
                                    );
                                }
                                var localdIdMqtt = localId.BuildMqtt();


                                var tableData = new TabularDataSet(
                                    data.Quality is not null
                                        && data.Quality.Count > 0
                                        && data.Quality[i] is not null
                                      ? new[] { data.Quality[i] }
                                      : null,
                                    data.TimeStamp,
                                    new[] { data.Value[i] }
                                );

                                var timeSeriesTable = new TabularData(
                                    new List<string>() { dataChannel },
                                    new List<TabularDataSet>() { tableData },
                                    "1",
                                    "1"
                                );

                                var h = package.Package.Header;
                                var timeSeriesPackage = new TimeSeriesDataPackage(
                                    new Package(
                                        h,
                                        new[]
                                        {
                                            new TimeSeriesData(
                                                timeSeries.DataConfiguration,
                                                null,
                                                new List<TabularData>() { timeSeriesTable }
                                            )
                                        }
                                    )
                                );

                                var publishMessage = new MqttApplicationMessage()
                                {
                                    Payload = Encoding.UTF8.GetBytes(
                                        Serializer.Serialize(timeSeriesPackage)
                                    ),
                                    Topic = localdIdMqtt.ToString(),
                                };

                                _logger.LogInformation(
                                    "{clientId} - publishing on {topic}",
                                    clientId,
                                    publishMessage.Topic
                                );
                                await _mqttClient.PublishAsync(publishMessage);
                            }
                        }
                    }
                    break;
            }

            bool IsLocalIdPreamble(string dataChannel)
            {
                return dataChannel.StartsWith("/dnv-v2/");
            }
        };
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
}
