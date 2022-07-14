using System.Text.Json;

namespace Common;

public static class JsonExtensions
{
    public static string GetStringNonNull(this JsonElement el)
    {
        return el.GetString()
            ?? throw new Exception(
                $"{nameof(GetStringNonNull)} called on invalid JsonElement: {el}"
            );
    }

    public static double? GetDoubleOrNull(this JsonElement el) =>
        el.ValueKind == JsonValueKind.Number && el.TryGetDouble(out var v) ? v : null;

    public static int? GetIntOrNull(this JsonElement el) =>
        el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var v) ? v : null;
}
