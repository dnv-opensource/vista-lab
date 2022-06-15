using IngestApi.Repositories;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Vista.SDK.Transport.Json;

namespace IngestApi;

public class MqttSubscriberClient : IHostedService
{
    private readonly ILogger<MqttSubscriberClient> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;
    private readonly DataChannelRepository _dataChannelRepository;

    private readonly string[] _subscriptionTopics = new string[]
    {
        "DataChannelLists",
        "TimeSeriesData"
    };

    public MqttSubscriberClient(
        ILogger<MqttSubscriberClient> logger,
        DataChannelRepository dataChannelRepository
    )
    {
        _logger = logger;
        _dataChannelRepository = dataChannelRepository;

        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";
        _logger.LogInformation("ingestHost {ingestHost}", ingestHost);

        _mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer($"{ingestHost}", 5050)
            .WithClientId("subscriber-client")
            .Build();
        _mqttFactory = new MqttFactory();
        _mqttClient = _mqttFactory.CreateMqttClient();
    }

    public async Task StartAsync(CancellationToken stoppingToken)
    {
        await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
        _logger.LogInformation("Subscriber - Connected to broker");
        await _mqttClient.PingAsync(stoppingToken);
        _logger.LogInformation("Subscriber - Pinged broker successfully");

        foreach (var subscriptionTopic in _subscriptionTopics)
        {
            await _mqttClient.SubscribeAsync(
                new MqttTopicFilter() { Topic = subscriptionTopic },
                stoppingToken
            );
        }

        _mqttClient.ApplicationMessageReceivedAsync += async args =>
        {
            _logger.LogInformation(
                "Subscriber - Received message from {clientId} with topic {topic}",
                args.ClientId,
                args.ApplicationMessage.Topic
            );

            var message = args.ApplicationMessage;
            using var stream = new MemoryStream(message.Payload);

            switch (message.Topic)
            {
                case "DataChannelLists":
                    var dataChannelList = Serializer.DeserializeDataChannelList(stream);
                    await _dataChannelRepository.InsertDataChannel(dataChannelList!, stoppingToken);
                    break;
                case "TimeSeriesData":
                    var timeSeriesData = Serializer.DeserializeTimeSeriesData(stream);
                    //await _dataChannelRepository.InsertTimeSeriesData(timeSeriesData!, stoppingToken);
                    break;
            }
        };
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _mqttClient.DisconnectedAsync += args =>
        {
            _logger.LogInformation("Subscriber - disconnected");
            return Task.CompletedTask;
        };

        await _mqttClient.DisconnectAsync();
    }
}
