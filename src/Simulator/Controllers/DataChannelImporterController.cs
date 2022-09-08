using Microsoft.AspNetCore.Mvc;
using Vista.SDK.Transport.Json.DataChannel;

namespace Simulator.Controllers
{
    [ApiController]
    public class DataChannelImporterController : ControllerBase
    {
        private readonly ISimulator _simulator;

        public DataChannelImporterController(ISimulator simulator) => _simulator = simulator;

        [HttpPost]
        [Route("api/data-channel/import-and-simulate")]
        public ActionResult Post(DataChannelListPackage file, CancellationToken cancellationToken)
        {
            _simulator.SimulateDataChannel(file, null, cancellationToken);
            return Ok();
        }
    }
}
