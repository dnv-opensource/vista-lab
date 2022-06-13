using Common;
using IngestApi.Repositories;
using MQTTnet.AspNetCore;
using Serilog;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(
    o =>
    {
        o.ListenAnyIP(5051, l => l.UseMqtt()); // MQTT pipeline
        o.ListenAnyIP(5050); // Default HTTP pipeline
    }
);

builder.Services.AddHostedMqttServer(mqttServer => mqttServer.WithoutDefaultEndpoint());

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());
builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddVIS();
builder.Services.AddHttpClient<IDbClient, DbClient>();

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
