using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SimulatorClient;

public static class DIExtensions
{
    public static IServiceCollection AddSimulatorClient(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        const string clientName = "SimulatorClient";
        services.AddHttpClient(clientName);
        services.AddSingleton<ISimulatorClient, SimulatorClient>(
            sp =>
            {
                var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
                return new SimulatorClient(
                    configuration["SIMULATOR_API_URL"],
                    httpClientFactory.CreateClient(clientName)
                );
            }
        );
        return services;
    }
}
