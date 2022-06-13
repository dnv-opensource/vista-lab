using Microsoft.AspNetCore.Mvc;
using VistaLab.QueryApi.Models;
using VistaLab.QueryApi.Repository;

namespace VistaLab.QueryApi.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class DataChannelController : ApiControllerBase<DataChannelController>
{
    private readonly IDataChannelRepository dataChannelRepository;

    public DataChannelController(IDataChannelRepository dataChannelRepository)
    {
        this.dataChannelRepository = dataChannelRepository;
    }

    /// <summary>
    /// Search for data channels based in the given filters
    /// </summary>
    /// <param name="filter"></param>
    [HttpPost]
    public async Task<ActionResult> Post(DataChannelFilter filter)
    {
        var result = await dataChannelRepository.Get(filter);
        return Ok(result);
    }
}
