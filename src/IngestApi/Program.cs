using Common;
using IngestApi.Repositories;
using Serilog;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());
builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddVIS();
builder.Services.AddHttpClient<IDbClient, DbClient>();

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
