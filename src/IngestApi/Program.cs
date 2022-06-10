using Common;
using IngestApi.Repositories;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<Now>(_ => () => DateTimeOffset.UtcNow);
builder.Services.AddSingleton<IDataChannelRepository, DataChannelRepository>();
builder.Services.AddVIS();
builder.Services.AddHttpClient<IDbClient, DbClient>();

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
