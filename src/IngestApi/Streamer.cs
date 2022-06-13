using MQTTnet;
using MQTTnet.Packets;
using MQTTnet.Server;
using System.Text;
using Vista.SDK;
using Vista.SDK.Mqtt;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace IngestApi;

public sealed class FailureLogger
{
    private readonly ILogger<FailureLogger> _logger;
    private readonly MqttServer _server;

    public FailureLogger(ILogger<FailureLogger> logger, MqttServer server)
    {
        _logger = logger;
        _server = server;
    }

    public readonly MqttTopicFilter Filter = new MqttTopicFilterBuilder()
        .WithTopic("dnv-v2/vis-3-4a/+/+/+/+/+/state-sensor.failure/+/+/+/+")
        .Build();

    public async Task Start()
    {
        await _server.SubscribeAsync("failure-logger", Filter);
        // dnv-v2/vis-3-4a/1028.4_I101/1021.31-3S_H203/qty-temperature/cnt-cargo/_/state-sensor.failure/_/_/_/detail-95
    }

    public void Handle(MqttApplicationMessage message)
    {
        _logger.LogError("Got error message: {topic}", message.Topic);
    }
}

public sealed class Streamer
{
    private readonly ILogger<Streamer> _logger;
    private readonly MqttServer _server;

    private Dictionary<string, string> _localIdMapping;

    public Streamer(ILogger<Streamer> logger, MqttServer server)
    {
        _logger = logger;
        _server = server;
        _localIdMapping = new Dictionary<string, string>();
    }

    public void HandleDataChannels(DataChannelListPackage package)
    {
        var newMapping = package.Package.DataChannelList.DataChannel
            .Select(dc => dc.DataChannelID)
            .Where(dc => !string.IsNullOrEmpty(dc.ShortID))
            .ToDictionary(dc => dc.ShortID!, dc => dc.LocalID);
        _localIdMapping = newMapping;
    }

    public async Task HandleTimeseries(TimeSeriesDataPackage package)
    {
        foreach (var timeSeries in package.Package.TimeSeriesData)
        {
            foreach (var table in timeSeries.TabularData!)
            {
                var size = int.Parse(table.NumberOfDataChannel!);
                var data = table.DataSet![0];
                for (int i = 0; i < size; i++)
                {
                    var dataChannel = table.DataChannelID![i];

                    var localIdStr = _localIdMapping.TryGetValue(
                        dataChannel,
                        out var localIdMapping
                    )
                      ? localIdMapping
                      : dataChannel;

                    var localId = LocalIdBuilder.Parse(localIdStr).BuildMqtt();
                    var message = new MqttApplicationMessage()
                    {
                        Payload = Encoding.UTF8.GetBytes(Serializer.Serialize(package)),
                        Topic = localId.ToString(),
                    };
                    _logger.LogInformation(
                        "Publishing message for channel - {localId}",
                        message.Topic
                    );

                    var injectedMessage = new InjectedMqttApplicationMessage(message)
                    {
                        SenderClientId = "ingest-api",
                    };
                    await _server.InjectApplicationMessage(injectedMessage);
                }
            }
        }
    }
}
