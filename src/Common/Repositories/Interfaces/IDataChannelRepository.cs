using Vista.SDK.Transport.DataChannel;

namespace Common.Repositories.Interfaces;

public interface IDataChannelRepository
{
    ValueTask Initialize(CancellationToken cancellationToken);
}
