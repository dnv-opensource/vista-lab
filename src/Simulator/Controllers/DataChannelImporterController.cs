using Microsoft.AspNetCore.Mvc;
using Vista.SDK.Transport.Json.DataChannel;

namespace Simulator.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DataChannelImporterController : ControllerBase
    {
        private readonly ISimulator _simulator;

        public DataChannelImporterController(ISimulator simulator) => _simulator = simulator;

        [HttpPost]
        public ActionResult Post(DataChannelListPackage file, CancellationToken cancellationToken)
        {
            _simulator.SimulateDataChannel(file, cancellationToken);
            return Ok();
        }
    }
}
