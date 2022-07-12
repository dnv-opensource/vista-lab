using Common;
using QueryApi.Models;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Repository;

public sealed class VesselRepository
{
    private readonly IDbClient _client;

    public class VesselDto
    {
        public string VesselId;
        public int NumDataChannels;

        public VesselDto()
        {
            VesselId = "";
            NumDataChannels = 0;
        }

        public VesselDto(string vesselId, int numDataChannels)
        {
            VesselId = vesselId;
            NumDataChannels = numDataChannels;
        }
    };

    public VesselRepository(IDbClient client)
    {
        _client = client;
    }

    public async Task<BaseResponse<VesselDto>> GetVessels(CancellationToken cancellationToken)
    {
        var query = "SELECT VesselId, count() as NumDataChannels  from DataChannel";
        //await _client.ExecuteAsync(query, cancellationToken);
        var res = await _client.ExecuteAsync<BaseResponse<VesselDto>>(query, cancellationToken);

        if (res is null)
            throw new Exception("Failed to get vessels");

        return res;
    }
}
