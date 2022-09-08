using MQTTnet;
using MQTTnet.Client;
using Serilog;
using Simulator;
using Vista.SDK;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
var clientId = "simulator-client";
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());

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

builder.Services.AddSingleton<ISimulator, Simulator.Simulator>();
builder.Services
    .AddSingleton<SimulatorService>()
    .AddSingleton<IHostedService>(sp => sp.GetRequiredService<SimulatorService>());

builder.Services.AddSingleton(
    sp =>
    {
        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

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
builder.Services.AddControllers();

var app = builder.Build();
app.UseCors();
app.MapControllers();

app.Use(
    (context, next) =>
    {
        if (context.Request.Path == "/health")
        {
            context.Response.StatusCode = 200;
            return Task.CompletedTask;
        }

        return next();
    }
);

app.Run();
