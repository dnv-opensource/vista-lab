using MQTTnet;
using MQTTnet.Packets;
using MQTTnet.Server;

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

    // dnv-v2/vis-3-4a/1028.4_I101/1021.31-3S_H203/qty-temperature/cnt-cargo/_/state-sensor.failure/_/_/_/detail-95
    public readonly MqttTopicFilter Filter = new MqttTopicFilterBuilder()
        .WithTopic("dnv-v2/vis-3-4a/+/+/+/+/+/state-sensor.failure/#")
        .Build();

    public void Handle(MqttApplicationMessage message)
    {
        _logger.LogError(
            "Updated data for 'state-sensor.failure' datachannel: {topic}",
            message.Topic
        );
    }
}
