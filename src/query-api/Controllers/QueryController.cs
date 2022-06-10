using Microsoft.AspNetCore.Mvc;

namespace VistaLab.Api.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class QueryController : ApiControllerBase<QueryController>
{
    public QueryController() { }

    /// <summary>
    /// Creates a vessel for the current user.
    /// </summary>
    /// <param name="vessel"></param>
    /// <param name="cancellationToken"></param>
    [HttpGet(Name = "Query")]
    public async ValueTask<ActionResult> Query(Guid vessel, CancellationToken cancellationToken)
    {
        await Task.Yield();
        return Ok();
    }
}
