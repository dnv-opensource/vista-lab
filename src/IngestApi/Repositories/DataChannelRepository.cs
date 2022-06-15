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
                        d
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
                        internalId = NewId.NextGuid(),
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
                        localIdPrimaryItem = d.LocalId?.PrimaryItem?.ToString()
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
                    .AtNow();
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
        DataChannel DataChannel
    );

    public async ValueTask InsertTimeSeriesData(
        TimeSeriesDataPackage timeSeriesData,
        CancellationToken cancellationToken
    )
    {
        await Task.Yield();
        //    foreach (var timeSeries in timeSeriesData.Package.TimeSeriesData)
        //    {
        //        foreach (var table in timeSeries.TabularData!)
        //        {
        //            var size = int.Parse(table.NumberOfDataSet!);
        //            var dataChannelId = table.DataChannelID;

        //            foreach (var dataset in table.DataSet!)
        //            {
        //                var timestamp = dataset.TimeStamp;
        //                var value = dataset.Value;
        //                var quality = dataset.Quality;
        //            }
        //        }
        //    }

        //    var timeSeriesParam = timeSeriesData.Package.TimeSeriesData
        //        .Select(
        //            t =>
        //                new
        //                {
        //                    timeSeriesId = t.DataConfiguration?.ID,
        //                    dataChannelId = t.TabularData?.Select(tt => tt.DataChannelID).ToString(),
        //                    value = t.TabularData
        //                        ?.Select(tt => tt.DataSet?.Select(ttd => ttd.Value))
        //                        .ToString(),
        //                    quality = t.TabularData
        //                        ?.Select(tt => tt.DataSet?.Select(ttd => ttd.Quality))
        //                        .ToString(),
        //                    timestamp = t.TabularData?.Select(
        //                        tt => tt.DataSet?.Select(ttd => ttd.TimeStamp)
        //                    ),
        //                }
        //        )
        //        .ToArray();

        //    try
        //    {
        //        _logger.LogInformation("Inserting data into TimeSeries");
        //        foreach (var param in timeSeriesParam)
        //        {
        //            var query =
        //                $@"
        //                    INSERT INTO TimeSeries (TimeSeriesId, DataChannelId, Value, Quality, Timestamp)
        //                    VALUES ('{param.timeSeriesId}', '{param.dataChannelId}', '{param.value}', '{param.quality}', '{param.timestamp}')
        //                    ";

        //            await _dbClient.ExecuteAsync(query, cancellationToken);
        //        }
        //        _logger.LogInformation("Finished inserting data into TimeSeries");
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Failed to insert data into TimeSeries");
        //        throw;
        //    }
    }
}
