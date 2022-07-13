namespace Common;

public sealed record TimeSeriesEntity(
    string DataChannelId,
    string VesselId,
    string? Value,
    string? Quality,
    DateTime Timestamp
)
{
    public static readonly string TableName = "TimeSeries";
}
