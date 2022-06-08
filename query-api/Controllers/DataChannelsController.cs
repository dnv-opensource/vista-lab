using Microsoft.AspNetCore.Mvc;

namespace VistaLab.Api.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class DataChannelsController : ApiControllerBase<DataChannelsController>
{
    public sealed record DataChannelsQuery(
        string PrimaryItem
    );

    [HttpPost("search")]
    public async Task<IActionResult> Query([FromBody] DataChannelsQuery query)
    {
        await Task.Yield();



        return Ok();
    }
}
