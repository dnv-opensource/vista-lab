using Microsoft.AspNetCore.Mvc;
using SearchApi;
using Serilog;
using System.ComponentModel;
using Vista.SDK;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logging) => logging.WriteTo.Console());

if (!builder.Environment.IsEnvironment("OpenApi"))
{
    builder.Services.AddSearchService();
}
builder.Services.AddVIS();

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

app.MapPost(
        "search/{visVersion}",
        async (
            VisVersion visVersion,
            SearchDto body,
            [FromServices] ElasticSearchService service,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await service.Search(
                visVersion,
                body.Scope,
                body.VesselId,
                body.Phrase,
                body.TopResults,
                cancellationToken
            );

            return Results.Ok(result);
        }
    )
    .Produces<ElasticSearchService.HitResults>(200, "application/json")
    .WithName("Search")
    .WithDisplayName("Search vessel for nodes");

app.Run();

public enum SearchScope
{
    Any,
    PrimaryItem,
    SecondaryItem
}

public sealed record SearchDto(
    string? VesselId,
    [property: DefaultValue("Main engine")] string Phrase,
    SearchScope Scope,
    int? TopResults
);
