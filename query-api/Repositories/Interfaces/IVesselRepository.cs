using VistaLab.Api.Models;

namespace VistaLab.Api.Repositories.Interfaces;

public interface IVesselRepository
{
    ValueTask Create(Vessel vessel, CancellationToken cancellationToken);

    ValueTask Update(Vessel vessel, CancellationToken cancellationToken);

    ValueTask<Vessel> Get(Guid id, CancellationToken cancellationToken);

    ValueTask<IEnumerable<Vessel>> List(CancellationToken cancellationToken);
}
