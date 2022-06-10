namespace QueryApi.Models;

public sealed record Vessel(Guid Id, string Name, int ImoNumber);

public sealed record VesselDbo(string Id, string Name, int ImoNumber);
