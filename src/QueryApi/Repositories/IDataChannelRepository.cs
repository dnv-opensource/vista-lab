using Common.Models;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public interface IDataChannelRepository
    {
        Task<IEnumerable<DataChannelDto>?> GetDataChannelByFilter(
            DataChannelFilter filter,
            CancellationToken cancellationToken
        );
        Task<IEnumerable<TimeSeriesDto>?> GetTimeSeriesByInternalId(
            Guid internalId,
            CancellationToken cancellationToken
        );
        Task<IEnumerable<TimeSeriesDto>?> GetTimeSeriesByFilter(
            DataChannelFilter filter,
            CancellationToken cancellationToken
        );
    }
}
