using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public interface IDataChannelRepository
    {
        Task<IEnumerable<DataChannelResult>> Get(DataChannelFilter filter);
    }
}
