using Common;
using Common.Models;
using MassTransit;
using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace IngestApi.Repositories;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _dbClient;
    private readonly QuestDbInsertClient _qdbClient;
    private readonly Dictionary<Guid, string> _internalIdMapping = new();

    public DataChannelRepository(
        IDbClient client,
        QuestDbInsertClient qdbClient,
        ILogger<DataChannel> logger
    )
    {
        _qdbClient = qdbClient;
        _dbClient = client;
        _logger = logger;
    }

    public async ValueTask Initialize(CancellationToken cancellationToken)
    {
        var query =
            $@"
            {DbInitTables.DataChannel}
            {DbInitTables.TimeSeries}
        ";

        try
        {
            _logger.LogInformation("Initializing DB");
            var queries = query.Split(
                ";",
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            );
            foreach (var q in queries)
            {
                await _dbClient.ExecuteAsync(q, cancellationToken);
            }
            _logger.LogInformation("DB initialized");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database");
            throw;
        }
    }

    public async ValueTask InsertDataChannel(
        DataChannelListPackage dataChannelList,
        CancellationToken cancellationToken
    )
    {
        var dataChannelInfo = dataChannelList.Package.DataChannelList.DataChannel
            .Select(
                d =>
                    new DataChannelInfo(
                        LocalIdBuilder.TryParse(d.DataChannelID.LocalID, out var localId),
                        localId,
                        d,
                        NewId.NextGuid()
                    )
            )
            .Where(
                d =>
                    d.LocalIdParsed
                    && (d.LocalId?.IsValid ?? false)
                    && !d.DataChannel.DataChannelID.LocalID.Contains("~", StringComparison.Ordinal)
            )
            .ToArray();

        var dataChannelParam = dataChannelInfo
            .Select(
                d =>
                    DataChannelDto.CreateFromDataChannel(
                        dataChannelList.Package.Header.ShipID,
                        d,
                        dataChannelList.Package.Header.DataChannelListID.TimeStamp.DateTime
                    )
            )
            .ToArray();

        try
        {
            _logger.LogInformation("Inserting data into DataChannel");
            await _qdbClient.EnsureConnectedAsync(cancellationToken);
            var client = _qdbClient.Client!;

            foreach (var param in dataChannelParam)
            {
                _internalIdMapping.Add(Guid.Parse(param.InternalId), param.LocalId!);
                var codeBookNames = Enum.GetValues(typeof(CodebookName))
                    .Cast<CodebookName>()
                    .Select(c => c.ToString());

                client.Table("DataChannel").Symbol("VesselId", param.VesselId);

                var paramType = param.GetType();

                foreach (var codebook in codeBookNames)
                {
                    var val = paramType.GetProperty("LocalId_" + codebook)?.GetValue(param, null);
                    if (val is null)
                        continue;

                    client.Symbol("LocalId_" + codebook, val.ToString());
                }

                foreach (
                    var field in paramType
                        .GetProperties()
                        .Where(
                            n =>
                                !codeBookNames.Contains(n.Name.Split("LocalId_").Last())
                                && n.Name != "Timestamp"
                        )
                )
                {
                    var fieldValue = field.GetValue(param, null)?.ToString();

                    if (fieldValue is null)
                        continue;

                    if (double.TryParse(fieldValue, out double value))
                    {
                        client.Column(field.Name, value);
                        continue;
                    }

                    client.Column(field.Name, fieldValue);
                }
                client.At(param.Timestamp);
            }

            await client.SendAsync(cancellationToken);

            _logger.LogInformation("Finished inserting data into DataChannel");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into DataChannel");
            throw;
        }
    }

    public async ValueTask InsertTimeSeriesData(
        TimeSeriesDataPackage timeSeriesData,
        CancellationToken cancellationToken
    )
    {
        try
        {
            _logger.LogInformation("Inserting data into TimeSeries");
            await _qdbClient.EnsureConnectedAsync(cancellationToken);
            var client = _qdbClient.Client!;

            foreach (var timeSeries in timeSeriesData.Package.TimeSeriesData)
            {
                foreach (var table in timeSeries.TabularData!)
                {
                    var dataChannelSize = table.DataChannelID?.Count;
                    var dataSetSize = table.DataSet!.Count;

                    for (int i = 0; i < dataSetSize; i++)
                    {
                        var data = table.DataSet![0]; // change index to i later, simulator has wrong number
                        for (int j = 0; j < data.Value.Count; j++)
                        {
                            var dataChannel = table.DataChannelID![j];
                            client
                                .Table("TimeSeries")
                                .Symbol("DataChannelId", dataChannel)
                                .Column("Value", j < data.Value.Count ? data.Value[j] : null)
                                .Column(
                                    "Quality",
                                    j < data.Quality?.Count ? data.Quality?[j] : null
                                )
                                .At(data.TimeStamp.DateTime);
                        }
                    }
                }
            }
            await client.SendAsync(cancellationToken);
            _logger.LogInformation("Finished inserting data into TimeSeries");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into TimeSeries");
            throw;
        }
    }
}
