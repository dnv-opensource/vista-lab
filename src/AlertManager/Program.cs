using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Serilog;
using System.Globalization;
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
                "dnv-v2/vis-3-4a/411.1_C101.31/+/qty-temperature/+/+/+/+/+/pos-inlet/#",
                "PropDriverCylTempInlet",
                (alert, message, package) =>
                {
                    var dataset = package.Package.TimeSeriesData[0]?.TabularData?[0]?.DataSet?[0];

                    if (dataset is null)
                        return Task.CompletedTask;

                    var v = dataset.Value[0];
                    if (
                        !double.TryParse(
                            v,
                            NumberStyles.Any,
                            CultureInfo.InvariantCulture,
                            out var value
                        )
                    )
                        return Task.CompletedTask;

                    var (lvl, msg) = (value) switch
                    {
                        > 70
                          => (
                              LogLevel.Error,
                              string.Format(
                                  "{0} - Exceeded upper limit {1}",
                                  alert.Name,
                                  value.ToString()
                              )
                          ),
                        > 50
                          => (
                              LogLevel.Warning,
                              string.Format(
                                  "{0} - Close to upper limit {1}",
                                  alert.Name,
                                  value.ToString()
                              )
                          ),
                        < 30
                          => (
                              LogLevel.Error,
                              string.Format(
                                  "{0} - Exceeded upper limit {1}",
                                  alert.Name,
                                  value.ToString()
                              )
                          ),
                        < 50
                          => (
                              LogLevel.Warning,
                              string.Format(
                                  "{0} - Close to lower limit {1}",
                                  alert.Name,
                                  value.ToString()
                              )
                          ),
                        _
                          => (
                              LogLevel.Information,
                              string.Format(
                                  "{0} - Received topic from {1}",
                                  alert.Name,
                                  message.Topic
                              )
                          )
                    };

                    _logger.Log(lvl, msg);

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
    public Func<MqttApplicationMessage, TimeSeriesDataPackage, Task> OnMessageReceived =>
        _onMessageReceived;

    public SubscriptionAlert(
        string topic,
        string name,
        Func<
            SubscriptionAlert,
            MqttApplicationMessage,
            TimeSeriesDataPackage,
            Task
        > onMessageReceived
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
