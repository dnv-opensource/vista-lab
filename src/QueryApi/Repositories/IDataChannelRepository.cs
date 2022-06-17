using Common.Models;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public interface IDataChannelRepository
    {
        Task<IEnumerable<DataChannelDto>?> Get(DataChannelFilter filter);
    }
}
