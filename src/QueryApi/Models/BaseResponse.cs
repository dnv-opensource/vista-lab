using System.Collections;

namespace VistaLab.QueryApi.Models;

public sealed record Column(string Name, string Type);

public record BaseResponse<T>(string Query, Column[] Columns, object[][] Dataset, int Count)
{
    public IEnumerable<IReadOnlyDictionary<string, object>> Data =>
        Dataset.Select(
            data =>
                data.Select((d, index) => (d, index))
                    .ToDictionary(item => Columns[item.index].Name, item => item.d)
        );
}

public static class Util
{
    private static Object GetObject(this Dictionary<string, object> dict, Type type)
    {
        var obj = Activator.CreateInstance(type);

        foreach (var kv in dict)
        {
            var prop = type.GetProperty(kv.Key);
            if (prop == null)
                continue;

            object value = kv.Value;
            if (value is Dictionary<string, object>)
            {
                value = GetObject((Dictionary<string, object>)value, prop.PropertyType); // <= This line
            }

            prop.SetValue(obj, value, null);
        }
        return obj!;
    }

    public static G GetObject<G>(this Dictionary<string, object> dict)
    {
        return (G)GetObject(dict, typeof(G));
    }
}
