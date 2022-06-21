using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Serilog;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.TimeSeriesData;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
    .ConfigureServices(
        (Action<IServiceCollection>)(services => services.AddHostedService<Manager>())
    )
    .Build();

await host.RunAsync();

public class Manager : IHostedService
{
    const string clientId = "alert-manager-client";

    private readonly ILogger<Manager> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;

    private enum AlertType
    {
        SensorFailure,
        PropDriverCylinderTempInlet
    }

    private readonly HashSet<SubscriptionAlert> _subscriptions;

    public Manager(ILogger<Manager> logger)
    {
        _logger = logger;

        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

        _mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer($"{ingestHost}", 5050)
            .WithClientId(clientId)
            .Build();
        _mqttFactory = new MqttFactory();
        _mqttClient = _mqttFactory.CreateMqttClient();

        _subscriptions = new()
        {
            new SubscriptionAlert(
                "dnv-v2/vis-3-4a/+/+/+/+/+/state-sensor.failure/#",
                "SensorFailure",
                (alert, message, package) =>
                {
                    var dataset = package.Package.TimeSeriesData[0]?.TabularData?[0]?.DataSet?[0];

                    if (dataset is null)
                        return Task.CompletedTask;


                    if(!double.TryParse(alert.State, out var prevValue)) return Task.CompletedTask;
                    if(!double.TryParse(dataset.Value[0], out var value)) return Task.CompletedTask;

                    if(Math.Abs(prevValue - value) > 5)
                    {
                        // Just a dummy case
                        logger.LogError("{name} - Spike in {value}", alert.Name ,value);
                    }
                    alert.State = value.ToString();
                    return Task.CompletedTask;
                }
            ),
            new SubscriptionAlert(
                "dnv-v2/+/+/+/+/+/+/+/+/pos-inlet/#",
                "PropDriverCylTempInlet",
                (alert, message, package) =>
                {
                    var dataset = package.Package.TimeSeriesData[0]?.TabularData?[0]?.DataSet?[0];

                    if (dataset is null)
                        return Task.CompletedTask;


                    if (!double.TryParse(alert.State, out var prevValue)) return Task.CompletedTask;
                    if (!double.TryParse(dataset.Value[0], out var value)) return Task.CompletedTask;

                    if (value > 80)
                    {
                        // Just a dummy case
                        logger.LogError("{name} - Close to upper limit {value}", alert.Name, value);
                    }

                    alert.State = value.ToString();
                    return Task.CompletedTask;
                }
            ),
            new SubscriptionAlert(
                "dnv-v2/vis-3-4a/+/+/+/+/+/+/cmd-shut.down/#",
                "CmdShutDown",
                (alert, message, package) =>
                {
                    var dataset = package.Package.TimeSeriesData[0]?.TabularData?[0]?.DataSet?[0];

                    if (dataset is null)
                        return Task.CompletedTask;


                    if (!int.TryParse(alert.State, out var prevValue)) return Task.CompletedTask;
                    if (!int.TryParse(dataset.Value[0], out var value) || !(value == 1 || value==0)) return Task.CompletedTask;

                    if (value == 0)
                    {
                        // Just a dummy case
                        logger.LogError("{name} - Warning {topic} shut down", message.Topic, value);
                    }

                    alert.State = value.ToString();
                    return Task.CompletedTask;
                }
            )
        };
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _mqttClient.ConnectAsync(_mqttOptions, cancellationToken);
        _logger.LogInformation("{clientId} - Connected to broker", clientId);
        await _mqttClient.PingAsync(cancellationToken);
        _logger.LogInformation("{clientId} - Pinged broker successfully", clientId);

        foreach (var subscriptionTopic in _subscriptions)
        {
            await _mqttClient.SubscribeAsync(
                new MqttTopicFilter() { Topic = subscriptionTopic.Topic },
                cancellationToken
            );
        }

        _mqttClient.ApplicationMessageReceivedAsync += args =>
        {
            _logger.LogInformation(
                "{clientId} - received topic {topic}",
                clientId,
                args.ApplicationMessage.Topic
            );
            return HandleMessage(args.ApplicationMessage);
        };
    }

    private Task HandleMessage(MqttApplicationMessage message)
    {
        using var stream = new MemoryStream(message.Payload);
        var package = Serializer.DeserializeTimeSeriesData(stream)!;
        foreach (var subscription in _subscriptions.Where(a => a.Equals(message.Topic)))
        {
            subscription.OnMessageReceived(message, package);
        }

        return Task.CompletedTask;
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

internal sealed class SubscriptionAlert
{
    private readonly string _topic;
    private readonly string _name;
    private readonly Func<MqttApplicationMessage, TimeSeriesDataPackage, Task> _onMessageReceived;

    public string? State = null;

    public string Topic => _topic;
    public string Name => _name;
    public Func<MqttApplicationMessage, TimeSeriesDataPackage, Task> OnMessageReceived => _onMessageReceived;

    public SubscriptionAlert(
        string topic,
        string name,
        Func<SubscriptionAlert, MqttApplicationMessage, TimeSeriesDataPackage, Task> onMessageReceived
    )
    {
        _topic = topic;
        _name = name;
        _onMessageReceived = (message, package) => onMessageReceived(this, message, package);
    }

    public bool Equals(string? topic)
    {
        return MqttTopicFilterComparer.Compare(topic, _topic)
            == MqttTopicFilterCompareResult.IsMatch;
    }
}
