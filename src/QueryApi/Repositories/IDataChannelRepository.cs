using Vista.SDK.Transport.DataChannel;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository
{
    public interface IDataChannelRepository
    {
        Task<IEnumerable<DataChannel>?> Get(DataChannelFilter filter);
    }
}
