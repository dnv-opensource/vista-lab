using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;

namespace Common;

public sealed record DbResponse(
    string Query,
    IReadOnlyList<DbResponseColumn> Columns,
    IReadOnlyList<IReadOnlyList<JsonElement>> DataSet,
    int Count
)
{
    [JsonIgnore]
    private Dictionary<string, int>? _columnMapping;

    [JsonIgnore]
    private Dictionary<string, int> ColumnMapping
    {
        get
        {
            if (_columnMapping is not null)
                return _columnMapping;

            _columnMapping = Columns
                .Select((c, i) => (Col: c.Name, Idx: i))
                .ToDictionary(t => t.Col, t => t.Idx);
            return _columnMapping;
        }
    }

    public JsonElement GetValue(int rowIndex, string column)
    {
        if (rowIndex >= Count)
            throw new Exception("Invalid row index");

        var data = DataSet[rowIndex];

        if (!ColumnMapping.TryGetValue(column, out var colIdx))
        {
            var cols = $"[{string.Join(',', Columns.Select(c => $"'{c.Name}'"))}]";
            throw new Exception(
                $"Unknown column '{column}' not found in column list from response: {cols}"
            );
        }

        return data[colIdx];
    }
}

public sealed record DbResponseColumn(string Name, string Type);

public sealed class QuestDbClient
{
    private readonly HttpClient _httpClient;
    public static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions(
        JsonSerializerDefaults.Web
    );

    public QuestDbClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost:9000";
        _httpClient.BaseAddress = new Uri($"http://{dbHost}/exec");
    }

    private async ValueTask<HttpResponseMessage> ExecuteInternal(
        string query,
        CancellationToken cancellationToken
    )
    {
        if (cancellationToken.IsCancellationRequested)
            cancellationToken.ThrowIfCancellationRequested();

        var url = HttpUtility.UrlEncode(query);
        var response = await _httpClient.GetAsync("?query=" + url, cancellationToken);

        if (response.StatusCode != HttpStatusCode.OK)
        {
            var responseMessage = await response.Content.ReadAsStringAsync();
            throw new Exception(
                $"DbClient failed with status code {response.StatusCode}:\n{responseMessage}\nFor query\n{query}"
            );
        }

        return response;
    }

    public async ValueTask Execute(string query, CancellationToken cancellationToken) =>
        await ExecuteInternal(query, cancellationToken);

    public async ValueTask<DbResponse> Query(string query, CancellationToken cancellationToken)
    {
        var response = await ExecuteInternal(query, cancellationToken);

        var json = await JsonSerializer.DeserializeAsync<DbResponse>(
            await response.Content.ReadAsStreamAsync(),
            JsonOptions,
            cancellationToken
        );

        return json ?? throw new Exception("Couldnt deserialize QuestDB response");
    }
}
