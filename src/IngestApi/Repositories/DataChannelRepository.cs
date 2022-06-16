using Common;
using MassTransit;
using QuestDB;
using Vista.SDK;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace IngestApi.Repositories;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _dbClient;
    private readonly Dictionary<Guid, string> _internalIdMapping = new();

    public DataChannelRepository(IDbClient client, ILogger<DataChannel> logger)
    {
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
                    new
                    {
                        internalId = d.InternalId,
                        shortId = d.DataChannel.DataChannelID.ShortID?.ToString(),
                        localId = d.LocalId?.ToString(),
                        vesselId = dataChannelList.Package.Header.ShipID,
                        name = d.DataChannel.Property.Name!.Contains("\'")
                          ? d.DataChannel.Property.Name.Replace("\'", "")
                          : d.DataChannel.Property.Name,
                        dataChannelType = d.DataChannel.Property.DataChannelType.Type.Contains("\'")
                          ? d.DataChannel.Property.DataChannelType.Type.Replace("\'", "")
                          : d.DataChannel.Property.DataChannelType.Type,
                        formatRestrictionType = d.DataChannel.Property.Format.Type,
                        localIdVisVersion = d.LocalId?.VisVersion.ToString(),
                        localIdPrimaryItem = d.LocalId?.PrimaryItem?.ToString(),
                        timestamp = dataChannelList.Package.Header.DataChannelListID.TimeStamp
                    }
            )
            .ToArray();

        try
        {
            _logger.LogInformation("Inserting data into DataChannel");
            using var sender = await LineTcpSender.ConnectAsync(
                "localhost",
                9009,
                tlsMode: TlsMode.Disable,
                cancellationToken: cancellationToken
            );

            foreach (var param in dataChannelParam)
            {
                _internalIdMapping.Add(param.internalId, param.localId!);
                sender
                    .Table("DataChannel")
                    .Symbol("VesselId", param.vesselId)
                    .Column("InternalId", param.internalId.ToString())
                    .Column("ShortId", param.shortId)
                    .Column("LocalId", param.localId)
                    .Column("Name", param.name)
                    .Column("DataChannelType", param.dataChannelType)
                    .Column("FormatRestriction_Type", param.formatRestrictionType)
                    .Column("LocalId_VisVersion", param.localIdVisVersion)
                    .Column("LocalId_PrimaryItem", param.localIdVisVersion)
                    .At(param.timestamp.DateTime);
            }
            await sender.SendAsync(cancellationToken);

            _logger.LogInformation("Finished inserting data into DataChannel");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into DataChannel");
            throw;
        }
    }

    private readonly record struct DataChannelInfo(
        bool LocalIdParsed,
        LocalIdBuilder? LocalId,
        DataChannel DataChannel,
        Guid InternalId
    );

    public async ValueTask InsertTimeSeriesData(
        TimeSeriesDataPackage timeSeriesData,
        CancellationToken cancellationToken
    )
    {
        try
        {
            _logger.LogInformation("Inserting data into TimeSeries");
            using var sender = await LineTcpSender.ConnectAsync(
                "localhost",
                9009,
                tlsMode: TlsMode.Disable,
                cancellationToken: cancellationToken
            );

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
                            sender
                                .Table("TimeSeries")
                                .Column("DataChannelId", dataChannel)
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
            await sender.SendAsync(cancellationToken);
            _logger.LogInformation("Finished inserting data into TimeSeries");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into TimeSeries");
            throw;
        }
    }
}
