using System.Net;
using System.Text.Json;

using System.Web;

namespace Common;

public interface IDbClient
{
    ValueTask ExecuteAsync(string query, CancellationToken cancellationToken);
    ValueTask<T?> ExecuteAsync<T>(string query, CancellationToken cancellationToken);
}

public sealed class DbClient : IDbClient
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public DbClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost:9000";
        _httpClient.BaseAddress = new Uri($"http://{dbHost}/exec");
        _jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
    }

    public async ValueTask ExecuteAsync(string query, CancellationToken cancellationToken)
    {
        await ExecuteAsync<object>(query, cancellationToken);
    }

    public async ValueTask<T?> ExecuteAsync<T>(string query, CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested)
            cancellationToken.ThrowIfCancellationRequested();

        var url = HttpUtility.UrlEncode(query);
        var result = await _httpClient.GetAsync("?query=" + url, cancellationToken);

        if (result.StatusCode != HttpStatusCode.OK)
        {
            var responseMessage = await result.Content.ReadAsStringAsync();
            throw new Exception(
                $"DbClient failed with status code {result.StatusCode}:\n{responseMessage}\nFor query\n{query}"
            );
        }

        var json = JsonSerializer.Deserialize<T>(
            await result.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false),
            _jsonOptions
        );

        //var json = JsonConvert.DeserializeObject<T>(
        //    await result.Content.ReadAsStringAsync(cancellationToken)
        //);

        return json;
    }
}
