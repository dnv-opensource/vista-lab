using Common;
using IngestApi;
using IngestApi.Repositories;
using Serilog;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());
builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddVIS();
builder.Services.AddHttpClient<IDbClient, DbClient>();

if (!builder.Environment.IsEnvironment("OpenApi"))
{
    builder.Services.AddHostedService<DbInitService>();
    builder.Services.AddHostedService<MqttSubscriberClient>();
}

var app = builder.Build();

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
