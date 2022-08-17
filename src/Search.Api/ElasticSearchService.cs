namespace Search.Api;

using Elasticsearch.Net;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Packets;
using Nest;
using System.Threading;
using System.Threading.Tasks;
using Vista.SDK;
using Vista.SDK.Transport.Json;

public sealed class ElasticSearchService : IHostedService
{
    const string clientId = "elastic-search-service";
    private string defaultIndex = Vista.SDK.Defaults.VisVersion.ToString();

    private readonly ILogger<ElasticSearchService> _logger;
    private readonly MqttClientOptions _mqttOptions;
    private readonly MqttFactory _mqttFactory;
    private readonly IMqttClient _mqttClient;

    private readonly string[] _subscriptionTopics = new string[] { "DataChannelLists" };

    private Dictionary<string, string> _localIdMapping;

    private IElasticClient _esClient;

    public sealed record DataChannelDocument(
        string LocalId,
        string LocalId_PrimaryItem,
        string? LocalId_SecondaryItem,
        string? LocalId_Position,
        string? LocalId_Quantity,
        string? LocalId_Calculation,
        string? LocalId_Content,
        string? LocalId_Command,
        string? LocalId_Type,
        string? LocalId_Detail,
        string? Unit_UnitSymbol,
        string? Unit_QuantityName,
        string? name,
        string? Remarks,
        DateTime Timestamp
    );

    public sealed record HitResult(
        Explanation Explanation,
        FieldValues fields,
        IReadOnlyDictionary<string, IReadOnlyCollection<string>> Highlight,
        string Id,
        string Index,
        IReadOnlyCollection<object> Sorts,
        double? Score,
        IReadOnlyCollection<string> MatchedQueries,
        long? PrimaryTerm,
        string Routing,
        long? SequenceNumber,
        string Type,
        long Version,
        DataChannelDocument Document
    );

    public sealed record HitResults(
        double MaxScore,
        double? MinScore,
        double? AvgScore,
        int NumberOfHits,
        long TotalPotentialHits,
        IEnumerable<HitResult> Hits
    );

    public ElasticSearchService(ILogger<ElasticSearchService> logger)
    {
        _logger = logger;
        _localIdMapping = new();

        // MQTT
        var brokerUrl = Environment.GetEnvironmentVariable("BROKER_SERVER") ?? "localhost";
        _mqttOptions = new MqttClientOptionsBuilder()
            .WithTcpServer($"{brokerUrl}", 5050)
            .WithClientId(clientId)
            .Build();
        _mqttFactory = new MqttFactory();
        _mqttClient = _mqttFactory.CreateMqttClient();

        // Client
        var apiUrl = Environment.GetEnvironmentVariable("ES_API_URL") ?? "localhost";

        if (apiUrl is null)
            throw new Exception(
                "ElasticSearch configuration error: missing environment variable 'ES_API_URL'"
            );

        var settings = new ConnectionSettings(new Uri("http://" + apiUrl + ":9200")).DefaultIndex(
            defaultIndex
        );

        _esClient = new ElasticClient(settings);
    }

    public async ValueTask<HitResults> Search(
        VisVersion version,
        string phrase,
        int? topResult,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(phrase))
            return new HitResults(0, 0, 0, 0, 0, new List<HitResult>());

        await _esClient.PingAsync(new PingRequest(), cancellationToken);
        _logger.LogInformation("{cliendId} - Pinged ElasticSearch client successfully", clientId);
        var searchResponse = _esClient.Search<DataChannelDocument>(
            d =>
            {
                if (topResult is not null) { }
                return d.Index(version.ToString())
                    .Query(
                        q =>
                            q.Bool(
                                b =>
                                    b.Must(
                                        filter =>
                                            filter.MultiMatch(
                                                mu =>
                                                    mu.Type(TextQueryType.BestFields).Query(phrase)
                                            )
                                    )
                            )
                    )
                    .Size(100);
            }
        );

        if (!searchResponse.IsValid)
            throw new Exception(
                $"Invalid search response {searchResponse.DebugInformation} {searchResponse.ServerError.Error}"
            );

        var maxScore = searchResponse.MaxScore;
        var minScore = searchResponse.Hits.Min(h => h.Score);
        var avgScore = searchResponse.Hits.Average(h => h.Score);

        return new HitResults(
            maxScore,
            minScore,
            avgScore,
            searchResponse.Hits.Count,
            searchResponse.Total,
            searchResponse.Hits
                .Select(
                    h =>
                        new HitResult(
                            h.Explanation,
                            h.Fields,
                            h.Highlight,
                            h.Id,
                            h.Index,
                            h.Sorts,
                            h.Score,
                            h.MatchedQueries,
                            h.PrimaryTerm,
                            h.Routing,
                            h.SequenceNumber,
                            h.Type,
                            h.Version,
                            h.Source
                        )
                )
                .ToArray()
        );
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _mqttClient.ConnectAsync(_mqttOptions, cancellationToken);
        _logger.LogInformation("{clientId} - Connected to broker", clientId);
        await _mqttClient.PingAsync(cancellationToken);
        _logger.LogInformation("{clientId} - Pinged broker successfully", clientId);
        await _esClient.PingAsync(new PingRequest(), cancellationToken);
        _logger.LogInformation("{cliendId} - Pinged ElasticSearch client successfully", clientId);

        foreach (var subscriptionTopic in _subscriptionTopics)
        {
            await _mqttClient.SubscribeAsync(
                new MqttTopicFilter() { Topic = subscriptionTopic },
                cancellationToken
            );
        }

        _mqttClient.ApplicationMessageReceivedAsync += async args =>
        {
            _logger.LogInformation(
                "{clientId} - Received message from {argsClient} with topic {topic}",
                clientId,
                args.ClientId,
                args.ApplicationMessage.Topic
            );
            await _esClient.PingAsync(new PingRequest(), cancellationToken);
            _logger.LogInformation(
                "{cliendId} - Pinged ElasticSearch client successfully on message received",
                clientId
            );

            var message = args.ApplicationMessage;
            using var stream = new MemoryStream(message.Payload);

            if (message.Topic != "DataChannelLists")
                return;

            var dataChannelListPackage = Serializer.DeserializeDataChannelList(stream)!;

            foreach (var dc in dataChannelListPackage.Package.DataChannelList.DataChannel)
            {
                var id = dc.DataChannelID;

                if (!string.IsNullOrEmpty(id.ShortID) && !_localIdMapping.ContainsKey(id.ShortID!))
                {
                    var header = dataChannelListPackage.Package.Header;

                    var entity = DataChannelEntity.FromSdkDataChannel(
                        dc,
                        dataChannelListPackage.Package.Header
                    );

                    if (entity is null)
                        continue;

                    var index = _esClient.Index(
                        new DataChannelDocument(
                            entity.LocalId,
                            entity.LocalId_PrimaryItem,
                            entity.LocalId_SecondaryItem,
                            entity.LocalId_Position,
                            entity.LocalId_Quantity,
                            entity.LocalId_Calculation,
                            entity.LocalId_Content,
                            entity.LocalId_Command,
                            entity.LocalId_Type,
                            entity.LocalId_Detail,
                            entity.Unit_UnitSymbol,
                            entity.Unit_QuantityName,
                            entity.Name,
                            entity.Remarks,
                            DateTime.UtcNow
                        ),
                        i => i.Index(entity.LocalId_VisVersion)
                    );
                    if (!index.IsValid)
                        _logger.LogInformation(
                            "Error indexing {dc} - {debugInfo} - {serverError}",
                            dc.DataChannelID.LocalID,
                            index.DebugInformation,
                            index.ServerError?.Error?.ToString() ?? "local error"
                        );
                    else
                    {
                        _localIdMapping[id.ShortID!] = id.LocalID;
                        _logger.LogInformation("Indexed {dc}", dc.DataChannelID.LocalID);
                    }
                }
            }
        };
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _mqttClient.DisconnectedAsync += args =>
        {
            _logger.LogInformation("{clientId} - disconnected", clientId);
            return Task.CompletedTask;
        };

        await _mqttClient.DisconnectAsync();
    }
}
