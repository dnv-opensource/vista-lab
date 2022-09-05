using Vista.SDK.Transport.Json.DataChannel;

namespace Simulator
{
    public interface ISimulator
    {
        Task SimulateDataChannel(
            DataChannelListPackage dataChannelListDto,
            CancellationToken stoppingToken
        );
    }
}
