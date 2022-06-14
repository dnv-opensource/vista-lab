using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace IngestApi.Repositories
{
    public interface IDataChannelRepository
    {
        ValueTask Initialize(CancellationToken cancellationToken);
        ValueTask InsertDataChannel(
            DataChannelListPackage dataChannelList,
            CancellationToken cancellationToken
        );
        ValueTask InsertTimeSeriesData(
            TimeSeriesDataPackage timeSeriesData,
            CancellationToken cancellationToken
        );
    }
}
