using Microsoft.AspNetCore.Mvc;
using MQTTnet;
using MQTTnet.Client;
using Serilog;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());

if (!builder.Environment.IsEnvironment("OpenApi"))
{
    builder.Services.AddSingleton<Simulator>();
    builder.Services.AddSingleton<IHostedService>(sp => sp.GetRequiredService<Simulator>());
}

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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    options =>
    {
        options.SupportNonNullableReferenceTypes();
        var assembly = typeof(Program).Assembly;

        var xmlFilename = $"{assembly.GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    }
);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

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
        async (
            DataChannelListPackage body,
            [FromServices] Simulator simulator,
            CancellationToken cancellationToken
        ) =>
        {
            await simulator.SimulateDataChannel(body, null, cancellationToken);
            return Results.Ok();
        }
    )
    .WithName("ImportDataChannelsAndSimulate")
    .WithDisplayName("Import datachannels and simulate");

app.MapPost(
        "api/data-channel/import-file-and-simulate",
        async (
            HttpRequest request,
            [FromServices] Simulator simulator,
            CancellationToken cancellationToken
        ) =>
        {
            var body = await Serializer.DeserializeDataChannelListAsync(request.Body);
            if (body is null)
                throw new Exception("Invalid data handed to import endpoint");

            await simulator.SimulateDataChannel(body, null, cancellationToken);
            return Results.Ok();
        }
    )
    .Accepts<IFormFile>("application/json")
    .WithName("ImportDataChannelsFileAndSimulate")
    .WithDisplayName("Import datachannels file and simulate");

app.Run();
