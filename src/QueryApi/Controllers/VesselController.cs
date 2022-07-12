using Microsoft.AspNetCore.Mvc;
using QueryApi.Models;
using VistaLab.QueryApi.Repository;

namespace QueryApi.Controllers;

[ApiController]
public sealed class VesselController : ApiControllerBase<VesselController>
{
    private readonly VesselRepository _vesselRepository;

    public VesselController(VesselRepository vesselRepository)
    {
        _vesselRepository = vesselRepository;
    }

    /// <summary>
    /// Search for data channels based in the given filters
    /// </summary>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [Route("api/vessels")]
    public async Task<ActionResult<IEnumerable<Vessel>>> Get(CancellationToken cancellationToken)
    {
        var vesselDtos = await _vesselRepository.GetVessels(cancellationToken);
        return Ok(vesselDtos.Data);
    }
}
