using Common;
using IngestApi;
using IngestApi.Repositories;
using MQTTnet;
using MQTTnet.AspNetCore;
using MQTTnet.Server;
using Serilog;
using Vista.SDK;
using Vista.SDK.Transport.Json;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(
    o =>
    {
        o.ListenAnyIP(5051, l => l.UseMqtt()); // MQTT pipeline
        o.ListenAnyIP(5050); // Default HTTP pipeline
    }
);

builder.Services
    .AddHostedMqttServer(
        mqttServer =>
        {
            mqttServer.WithoutDefaultEndpoint();
        }
    )
    .AddMqttConnectionHandler()
    .AddConnections();

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());
builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddVIS();
builder.Services.AddHttpClient<IDbClient, DbClient>();
builder.Services.AddSingleton<Streamer>();

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

var app = builder.Build();

app.UseRouting();

app.UseEndpoints(
    endpoints =>
    {
        endpoints.MapMqtt("/mqtt");
    }
);

var mqttLogger = app.Services.GetRequiredService<ILogger<MqttServer>>();
app.UseMqttServer(
    server =>
    {
        server.ClientConnectedAsync += args =>
        {
            mqttLogger.LogInformation("Client connected: {client}", args.ClientId);
            return Task.CompletedTask;
        };
        server.InterceptingPublishAsync += async args =>
        {
            var message = args.ApplicationMessage;
            switch (message.Topic)
            {
                case "DataChannelLists":
                {
                    mqttLogger.LogInformation("DataChannelLists from: {client}", args.ClientId);

                    var streamer = app.Services.GetRequiredService<Streamer>();
                    using var stream = new MemoryStream(message.Payload);
                    var data = Serializer.DeserializeDataChannelList(stream);
                    streamer.HandleDataChannels(data!);
                    return;
                }
                case "TimeSeriesData":
                {
                    mqttLogger.LogInformation("TimeSeriesData from: {client}", args.ClientId);

                    var streamer = app.Services.GetRequiredService<Streamer>();
                    using var stream = new MemoryStream(message.Payload);
                    var data = Serializer.DeserializeTimeSeriesData(stream);
                    await streamer.HandleTimeseries(data!);
                    return;
                }
                default:
                    mqttLogger.LogInformation("Unhandled topic: {topic}", message.Topic);
                    return;
            }
            ;
        };
        server.StartedAsync += args =>
        {
            mqttLogger.LogInformation("MqttServer started");
            return Task.CompletedTask;
        };
    }
);

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
