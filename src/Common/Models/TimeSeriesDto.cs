namespace Common.Models;

public sealed record TimeSeriesDto(
    Guid InternalId,
    string? Value,
    string? Quality,
    string? EventType,
    DateTime Timestamp
);
