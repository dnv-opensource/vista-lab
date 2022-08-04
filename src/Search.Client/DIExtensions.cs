using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Search.Client;

public static class DIExtensions
{
    public static IServiceCollection AddSearchClient(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        const string clientName = "SearchClient";
        services.AddHttpClient(clientName);
        services.AddSingleton<ISearchClient, SearchClient>(
            sp =>
            {
                var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
                return new SearchClient(
                    configuration["SEARCH_API_URL"],
                    httpClientFactory.CreateClient(clientName)
                );
            }
        );
        return services;
    }
}
