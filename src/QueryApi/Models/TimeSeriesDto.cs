namespace QueryApi.Models;

public sealed record TimeSeriesDto(
    string TimeSeriesId,
    string DataChannelId,
    double? Value,
    string? Quality,
    string? EventType,
    DateTime Timestamp
);
