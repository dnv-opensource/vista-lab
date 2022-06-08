using Microsoft.AspNetCore.Mvc;

using VistaLab.Api.Models;
using VistaLab.Api.Services;

namespace VistaLab.Api.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class QueryController : ApiControllerBase<QueryController>
{
    private readonly VesselService _vesselService;

    public QueryController(VesselService vesselService)
    {
        _vesselService = vesselService;
    }

    /// <summary>
    /// Creates a vessel for the current user.
    /// </summary>
    /// <param name="vessel"></param>
    /// <param name="cancellationToken"></param>
    [HttpGet(Name = "GetVessel")]
    public async ValueTask<ActionResult<Vessel>> Get(
        Guid vessel,
        CancellationToken cancellationToken
    )
    {
        return await _vesselService.GetVessel(vessel, cancellationToken);
    }
}
