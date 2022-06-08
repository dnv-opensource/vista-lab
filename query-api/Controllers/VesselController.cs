using Microsoft.AspNetCore.Mvc;

using VistaLab.Api.Models;
using VistaLab.Api.Services;

namespace VistaLab.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class VesselController : ApiControllerBase<VesselController>
{
    private readonly ILogger<VesselController> _logger;
    private readonly VesselService _vesselService;

    public VesselController(ILogger<VesselController> logger, VesselService vesselService)
    {
        _logger = logger;
        _vesselService = vesselService;
    }

    /// <summary>
    /// Creates a vessel for the current user.
    /// </summary>
    /// <param name="vesselId"></param>
    /// <param name="cancellationToken"></param>
    [HttpGet(Name = "Get")]
    public async ValueTask<ActionResult<Vessel>> Get(
        Guid vesselId,
        CancellationToken cancellationToken
    )
    {
        return await _vesselService.GetVessel(vesselId, cancellationToken);
    }
}
