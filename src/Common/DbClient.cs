using System.Net;
using System.Text.Json;
using System.Web;

namespace Common;

public delegate DateTimeOffset Now();

public interface IDbClient
{
    ValueTask Execute(string query, CancellationToken cancellationToken);
    ValueTask<T?> Execute<T>(string query, CancellationToken cancellationToken);
}

public sealed class DbClient : IDbClient
{
    private readonly HttpClient _httpClient;

    public DbClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("http://localhost:9000/exec");
    }

    public async ValueTask Execute(string query, CancellationToken cancellationToken)
    {
        await Execute<object>(query, cancellationToken);
    }

    public async ValueTask<T?> Execute<T>(string query, CancellationToken cancellationToken)
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

        var json = await JsonSerializer.DeserializeAsync<T>(result.Content.ReadAsStream());

        return json;
    }
}
