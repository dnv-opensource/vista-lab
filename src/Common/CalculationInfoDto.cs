using System.Text.Json;

namespace Common;

public enum CalculationType
{
    Simple
}

public sealed record SimpleCalculationConfig(
    int? Operator,
    IEnumerable<string> DataChannelIds,
    IEnumerable<SimpleCalculationConfig>? SubQueries
);

public sealed record CalculationInfoDto(CalculationType Type, string Configuration)
{
    public string Serialize() => JsonSerializer.Serialize(this);

    public static CalculationInfoDto Deserialize(string json) =>
        JsonSerializer.Deserialize<CalculationInfoDto>(json)
        ?? throw new InvalidOperationException("Couldnt deserialize calculationinfo");

    public object GetConfigurationObject()
    {
        return Type switch
            {
                CalculationType.Simple
                  => (object?)JsonSerializer.Deserialize<SimpleCalculationConfig>(Configuration),
                _ => null,
            } ?? throw new Exception("Invalid config: " + ToString());
    }

    public static CalculationInfoDto CreateSimple(SimpleCalculationConfig config) =>
        new CalculationInfoDto(CalculationType.Simple, JsonSerializer.Serialize(config));
};
