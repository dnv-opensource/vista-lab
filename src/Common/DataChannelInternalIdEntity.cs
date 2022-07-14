namespace Common;

public sealed record DataChannelInternalIdEntity(
    string DataChannelId,
    string VesselId,
    string InternalId,
    DateTime Timestamp
)
{
    public static readonly string TableName = "DataChannel_InternalId";
}
