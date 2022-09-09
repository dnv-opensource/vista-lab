using Microsoft.AspNetCore.Mvc;
using MQTTnet;
using MQTTnet.Client;
using Serilog;
using Vista.SDK.Transport.Json.DataChannel;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
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

builder.Services.AddSingleton<Simulator>();
builder.Services.AddSingleton<IHostedService>(sp => sp.GetRequiredService<Simulator>());

builder.Services.AddSingleton(
    sp =>
    {
        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

        const string clientId = "simulator-client";
        var mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer(ingestHost, 5050)
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

app.MapPost(
    "api/data-channel/import-and-simulate",
    async (DataChannelListPackage file, [FromServices] Simulator simulator, CancellationToken cancellationToken) =>
    {
        await simulator.SimulateDataChannel(file, null, cancellationToken);
        return Results.Ok();
    }
);

app.Run();
