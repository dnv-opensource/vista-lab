namespace QueryApi.Models;

public sealed record Vessel(string VesselId, int NumDataChannels)
{
    public static Vessel FromDto(string vesselId, int numDataChannels)
    {
        return new Vessel(vesselId, numDataChannels);
    }
}
