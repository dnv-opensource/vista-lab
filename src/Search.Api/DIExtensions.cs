namespace Search.Api;

internal static class DIExtensions
{
    public static IServiceCollection AddSearchService(this IServiceCollection services)
    {
        services.AddSingleton<ElasticSearchService>();
        services.AddSingleton<IHostedService>(sp => sp.GetRequiredService<ElasticSearchService>());
        return services;
    }
}
