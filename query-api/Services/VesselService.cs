using VistaLab.Api.Models;
using VistaLab.Api.Repositories.Interfaces;

namespace VistaLab.Api.Services;

public sealed class VesselService : BaseService
{
    private readonly IVesselRepository _vesselRepository;

    public VesselService(
        IServiceProvider serviceProvider,
        IVesselRepository vesselRepository,
        Now now
    ) : base(serviceProvider)
    {
        _vesselRepository = vesselRepository;
    }

    public async ValueTask<Vessel> GetVessel(Guid id, CancellationToken cancellationToken)
    {
        return await _vesselRepository.Get(id, cancellationToken);
    }
}
