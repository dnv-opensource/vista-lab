using IngestApi.Repositories;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Vista.SDK.Transport.Json;

namespace IngestApi;

public class MqttSubscriberClient : IHostedService
{
    const string clientId = "subscriber-client";

    private readonly ILogger<MqttSubscriberClient> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;
    private readonly DataChannelRepository _dataChannelRepository;

    private readonly string[] _subscriptionTopics = new string[] { "DataChannelLists", "IMO/#" };

    public MqttSubscriberClient(
        ILogger<MqttSubscriberClient> logger,
        DataChannelRepository dataChannelRepository
    )
    {
        _logger = logger;
        _dataChannelRepository = dataChannelRepository;

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
        await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
        _logger.LogInformation("{clientId} - Connected to broker", clientId);
        await _mqttClient.PingAsync(stoppingToken);
        _logger.LogInformation("{clientId} - Pinged broker successfully", clientId);

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
                    var dataChannelList = Serializer.DeserializeDataChannelList(stream)!;
                    await _dataChannelRepository.InsertDataChannel(dataChannelList, stoppingToken);
                    break;
                default:
                    if (!message.Topic.StartsWith("IMO/"))
                        break;
                    var timeSeriesData = Serializer.DeserializeTimeSeriesData(stream);
                    await _dataChannelRepository.InsertTimeSeriesData(
                        timeSeriesData!,
                        stoppingToken
                    );
                    break;
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
