using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Serilog;
using System.Text;
using Vista.SDK;
using Vista.SDK.Mqtt;
using Vista.SDK.Transport.Json;

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

    private readonly string[] _subscriptionTopics = new string[]
    {
        "DataChannelLists",
        "TimeSeriesData"
    };

    private Dictionary<string, string> _localIdMapping;

    public ChannelStreamer(ILogger<ChannelStreamer> logger)
    {
        _logger = logger;
        _localIdMapping = new Dictionary<string, string>();

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

                        if (!_localIdMapping.TryGetValue(dataChannel, out var localIdStr))
                            continue;

                        var localId = LocalIdBuilder.Parse(localIdStr).BuildMqtt();
                        var publishMessage = new MqttApplicationMessage()
                        {
                            Payload = Encoding.UTF8.GetBytes(Serializer.Serialize(package)),
                            Topic = localId.ToString(),
                        };

                        _logger.LogInformation(
                            "{clientId} - ready to publish on {topic}",
                            clientId,
                            publishMessage.Topic
                        );
                        await _mqttClient.PublishAsync(publishMessage);
                    }
                }
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
