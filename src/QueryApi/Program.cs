using Common;
using QueryApi.Repositories;
using Vista.SDK;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());
builder.Services.AddSingleton<DataChannelRepository>();
builder.Services.AddHttpClient<IDbClient, DbClient>();
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.MapControllers();

app.Run();
