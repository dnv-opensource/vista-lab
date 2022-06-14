using MQTTnet;
using MQTTnet.Server;
using Serilog;

IHost host = Host.CreateDefaultBuilder(args)
    .UseSerilog((context, logging) => logging.WriteTo.Console())
    .ConfigureServices(services => services.AddHostedService<MqttBroker>())
    .Build();

await host.RunAsync();

public class MqttBroker : IHostedService
{
    private readonly ILogger<MqttBroker> _logger;
    private readonly MqttServerOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly MqttServer _mqttServer;

    public MqttBroker(ILogger<MqttBroker> logger)
    {
        _logger = logger;

        _mqttFactory = new MqttFactory();
        _mqttOptions = new MqttServerOptionsBuilder()
            .WithDefaultEndpoint()
            .WithDefaultEndpointPort(5050)
            .Build();
        _mqttServer = _mqttFactory.CreateMqttServer(_mqttOptions);
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _mqttServer.StartAsync();
        _logger.LogInformation(
            "Broker - started on port {port}",
            _mqttOptions.DefaultEndpointOptions.Port
        );

        _mqttServer.InterceptingPublishAsync += async args =>
        {
            _logger.LogInformation(
                "Broker - Intercept published from {args} with topic {topic}",
                args.ClientId,
                args.ApplicationMessage.Topic
            );
            await Task.Yield();
        };

        _mqttServer.InterceptingSubscriptionAsync += async args =>
        {
            _logger.LogInformation(
                "Broker - Intercept subscription from {args} with topic {topic}",
                args.ClientId,
                args.TopicFilter.Topic
            );
            await Task.Yield();
        };
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _mqttServer.StoppedAsync += args =>
        {
            _logger.LogInformation("Broker - stopped");
            return Task.CompletedTask;
        };

        await _mqttServer.StopAsync();
    }
}
