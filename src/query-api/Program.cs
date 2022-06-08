using System.Data.Common;

using Npgsql;

using Vista.SDK;
using VistaLab.Api;
using VistaLab.Api.Repositories;
using VistaLab.Api.Repositories.Interfaces;
using VistaLab.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add database infrastructure
builder.Services.AddScoped<DbConnection>(
    _ => new NpgsqlConnection(configuration["VISTA_LAB_QUEST_DB"])
);

builder.Services.AddScoped<IDbSession, DbSession>();
builder.Services.AddScoped<IVesselRepository, VesselRepository>();
builder.Services.AddScoped<VesselService>();

builder.Services.AddSingleton<Now>(_ => () => DateTimeOffset.UtcNow);

if (!builder.Environment.IsEnvironment("OpenApi"))
    builder.Services.AddHostedService<DbInitService>();

builder.Services.AddVIS();

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

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    options =>
    {
        options.SupportNonNullableReferenceTypes();
        options.CustomOperationIds(
            e =>
                $"{e.ActionDescriptor.RouteValues["controller"]}{e.ActionDescriptor.RouteValues["action"]}"
        );
        var assembly = typeof(ApiControllerBase<>).Assembly;

        var xmlFilename = $"{assembly.GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    }
);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
