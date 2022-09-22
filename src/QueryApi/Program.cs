using Common;
using MQTTnet;
using MQTTnet.Client;
using QueryApi.Repository;
using SearchClient;
using Serilog;
using SimulatorClient;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());

builder.Services.AddVIS();
builder.Services.AddSearchClient(configuration);
builder.Services.AddSimulatorClient(configuration);

builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddHttpClient<QuestDbClient>();

builder.Services.AddSingleton(
    sp =>
    {
        var ingestHost = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";

        const string clientId = "query-client";
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

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    options =>
    {
        options.SupportNonNullableReferenceTypes();
        options.CustomOperationIds(
            e =>
                $"{e.ActionDescriptor.RouteValues["controller"]}{e.ActionDescriptor.RouteValues["action"]}"
        );
        var assembly = typeof(Program).Assembly;

        var xmlFilename = $"{assembly.GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    }
);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.MapControllers();

app.Run();
