using Microsoft.Extensions.DependencyInjection;

namespace VistaLab.Api.Repositories;

internal abstract class BaseRepository
{
    protected readonly IDbSession DbSession;

    protected BaseRepository(IServiceProvider serviceProvider)
    {
        DbSession = serviceProvider.GetRequiredService<IDbSession>();
    }
}
