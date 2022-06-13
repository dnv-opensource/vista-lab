namespace QueryApi.Models;

public sealed record TimeSeriesDto(
    string TimeSeriesId,
    string DataChannelId,
    string Value,
    string Quality,
    string EventType,
    DateTime Timestamp
);
