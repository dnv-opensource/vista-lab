namespace VistaLab.Api.Models;

public sealed record Sensor(Guid Id, Guid VesselId);

public sealed record SensorDbo(string Id, string VesselId);
