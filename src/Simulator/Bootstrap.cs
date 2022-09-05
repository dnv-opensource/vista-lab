using MQTTnet;
using MQTTnet.Client;
using Serilog;

namespace Simulator
{
    public static class Bootstrap
    {
        public static void AddMqttClient(this IServiceCollection sc, string clientId)
        {
            sc.AddSingleton(
                sp =>
                {
                    var ingestHost =
                        Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

                    var mqttOptions = new MqttClientOptionsBuilder()
                        .WithTcpServer($"{ingestHost}", 5050)
                        .WithClientId(clientId)
                        .Build();
                    var mqttFactory = new MqttFactory();
                    var mqttClient = mqttFactory.CreateMqttClient();

                    mqttClient.ConnectAsync(mqttOptions).Wait();
                    mqttClient.PingAsync().Wait();

                    return mqttClient;
                }
            );
        }

        public static Task BuildHostedService(string[] args, string clientId)
        {
            IHost host = Host.CreateDefaultBuilder(args)
                .UseSerilog((context, logging) => logging.WriteTo.Console())
                .ConfigureServices(
                    services =>
                    {
                        services.AddSingleton<ISimulator, Simulator>();
                        services.AddHostedService<SimulatorService>();
                        services.AddMqttClient(clientId);
                    }
                )
                .Build();

            return host.RunAsync();
        }

        public static Task BuildAPIControllers(string[] args, string clientId)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(
                options =>
                {
                    options.AddDefaultPolicy(
                        builder =>
                        {
                            builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                        }
                    );
                }
            );

            builder.Services.AddScoped<ISimulator, Simulator>();
            builder.Services.AddControllers();
            builder.Services.AddMqttClient(clientId);

            var app = builder.Build();
            app.UseCors();
            app.MapControllers();
            return app.RunAsync();
        }
    }
}
