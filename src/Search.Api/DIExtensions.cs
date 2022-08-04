namespace Search.Api;

internal static class DIExtensions
{
    public static IServiceCollection AddSearchService(this IServiceCollection services)
    {
        services.AddSingleton<LuceneSearchService>();
        services.AddSingleton<IHostedService>(sp => sp.GetRequiredService<LuceneSearchService>());
        return services;
    }
}
