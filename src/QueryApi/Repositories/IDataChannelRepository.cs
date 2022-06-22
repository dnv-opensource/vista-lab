using Common.Models;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public interface IDataChannelRepository
    {
        Task<IEnumerable<DataChannelDto>?> GetDataChannel(
            DataChannelFilter filter,
            CancellationToken cancellationToken
        );
        Task<IEnumerable<TimeSeriesDto>?> GetTimeSeries(
            Guid internalId,
            CancellationToken cancellationToken
        );
    }
}
