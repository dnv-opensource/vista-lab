using Dapper;

using VistaLab.Api.Models;
using VistaLab.Api.Repositories.Interfaces;

namespace VistaLab.Api.Repositories;

internal sealed class VesselRepository : BaseRepository, IVesselRepository
{
    public VesselRepository(IServiceProvider serviceProvider) : base(serviceProvider) { }

    public async ValueTask Create(Vessel vessel, CancellationToken cancellationToken)
    {
        var session = DbSession.Connection;

        var query =
            @"
            INSERT INTO Vessel (Id, Name, ImoNumber)
            VALUES (@id, @name, @imo);
        ";

        var param = new { id = vessel.Id.ToString(), name = vessel.Name, imo = vessel.ImoNumber };
        await session.ExecuteAsync(
            new CommandDefinition(query, param, cancellationToken: cancellationToken)
        );
    }

    public ValueTask Update(Vessel vessel, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async ValueTask<Vessel> Get(Guid id, CancellationToken cancellationToken)
    {
        var session = DbSession.Connection;

        var query =
            $@"
                SELECT * FROM Vessel
                WHERE Id = @id
            ";

        var param = new { id = id.ToString() };

        var selected = await session.QuerySingleAsync<VesselDbo>(
            new CommandDefinition(query, param, cancellationToken: cancellationToken)
        );

        return new Vessel(Guid.Parse(selected.Id), selected.Name, selected.ImoNumber);
    }

    public async ValueTask<IEnumerable<Vessel>> List(CancellationToken cancellationToken)
    {
        var session = DbSession.Connection;

        var query =
            $@"
                SELECT * FROM Vessel
            ";

        var selected = await session.QueryAsync<VesselDbo>(
            new CommandDefinition(query, cancellationToken: cancellationToken)
        );

        return selected.Select(s => new Vessel(Guid.Parse(s.Id), s.Name, s.ImoNumber));
    }
}
