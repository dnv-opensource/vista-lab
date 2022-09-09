using Vista.SDK;

using SearchApi;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());

if (!builder.Environment.IsEnvironment("OpenApi"))
{
    builder.Services.AddSearchService();
}
builder.Services.AddControllers();
builder.Services.AddVIS();

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

//RepoDb.SqlServerBootstrap.Initialize();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();
