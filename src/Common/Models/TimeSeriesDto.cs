namespace Common.Models;

public sealed record TimeSeriesDto(
    string DataChannelId,
    string? Value,
    string? Quality,
    DateTime Timestamp
);
