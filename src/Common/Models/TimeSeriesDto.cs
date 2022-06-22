namespace Common.Models;

public sealed record TimeSeriesDto(
    string DataChannelId,
    string VesselId,
    string? Value,
    string? Quality,
    DateTime Timestamp
);
