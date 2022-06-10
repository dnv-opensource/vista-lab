using Common;
using Common.Repositories.Interfaces;
using Common.Repositories;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<Now>(_ => () => DateTimeOffset.UtcNow);
builder.Services.AddVIS();
builder.Services.AddSingleton<IDataChannelRepository, DataChannelRepository>();
builder.Services.AddHttpClient<IDbClient, DbClient>();

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
