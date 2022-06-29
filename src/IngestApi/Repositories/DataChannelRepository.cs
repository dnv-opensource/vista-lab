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
            {DbInitTables.DataChannel_InternalId}
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
        //TARGET DataChannel - Always updated with the latest version keeping
        //TARGET DataChannel_InternalId - Have all possible DataChannel versions for an invariant InternalId

        //------Algorithm------
        //TODO Check if the incoming DataChannel exists in any possible version in DataChannel
        //TODO
        //TODO      DataChannel already EXISTS
        //TODO          Update DataChannel to the latest version based on InternalID if needed
        //TODO          Add all possible versions to DataChannel_InternalId that are missing
        //TODO
        //TODO      DataChannel does not EXIST
        //TODO          Upgrade it to the latest version and insert on DataChannel
        //TODO          Add all possible versions to DataChannel_InternalId

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
                client
                    .Table("DataChannel")
                    .Symbol("VesselId", param.VesselId)
                    .Symbol("LocalId_Position", param.LocalIdBuilder.Position)
                    .Symbol("LocalId_Quantity", param.LocalIdBuilder.Quantity)
                    .Symbol("LocalId_Calculation", param.LocalIdBuilder.Calculation)
                    .Symbol("LocalId_Content", param.LocalIdBuilder.Content)
                    .Symbol("LocalId_Command", param.LocalIdBuilder.Command)
                    .Symbol("LocalId_Type", param.LocalIdBuilder.Type)
                    .Symbol("LocalId_Detail", param.LocalIdBuilder.Detail)
                    .Column("InternalId", param.InternalId?.ToString())
                    .Column("ShortId", param.ShortId)
                    .Column("LocalId", param.LocalId)
                    .Column("Name", param.Name)
                    .Column("DataChannelType", param.DataChannelType)
                    .Column("FormatType", param.FormatType)
                    .Column("UnitSymbol", param.UnitSymbol)
                    .Column("QuantityName", param.QuantityName)
                    .Column("QualityCoding", param.QualityCoding)
                    .Column("Remarks", param.Remarks)
                    .Column("FormatRestriction_Type", param.FormatRestriction?.Type)
                    .Column("FormatRestriction_Enumeration", param.FormatRestriction?.Enumeration)
                    .Column(
                        "FormatRestriction_FractionDigits",
                        param.FormatRestriction?.FractionDigits
                    )
                    .Column("FormatRestriction_WhiteSpace", param.FormatRestriction?.WhiteSpace)
                    .Column("LocalId_VisVersion", param.LocalIdBuilder!.VisVersion)
                    .Column("LocalId_PrimaryItem", param.LocalIdBuilder.PrimaryItem)
                    .Column("LocalId_SecondaryItem", param.LocalIdBuilder.SecondaryItem);

                if (param.UpdateCycle is not null)
                    client.Column("UpdateCycle", (double)param.UpdateCycle);

                if (param.CalculationPeriod is not null)
                    client.Column("CalculationPeriod", (double)param.CalculationPeriod);

                if (param.RangeLow is not null)
                    client.Column("RangeLow", (double)param.RangeLow);

                if (param.RangeHigh is not null)
                    client.Column("RangeHigh", (double)param.RangeHigh);

                if (param.FormatRestriction?.MaxExclusive is not null)
                    client.Column(
                        "FormatRestriction_MaxExclusive",
                        (double)param.FormatRestriction.MaxExclusive
                    );

                if (param.FormatRestriction?.MaxInclusive is not null)
                    client.Column(
                        "FormatRestriction_MaxInclusive",
                        (double)param.FormatRestriction.MaxInclusive
                    );

                if (param.FormatRestriction?.MinExclusive is not null)
                    client.Column(
                        "FormatRestriction_MinExclusive",
                        (double)param.FormatRestriction.MinExclusive
                    );

                if (param.FormatRestriction?.MinInclusive is not null)
                    client.Column(
                        "FormatRestriction_MinInclusive",
                        (double)param.FormatRestriction.MinInclusive
                    );

                if (param.FormatRestriction?.Length is not null)
                    client.Column(
                        "FormatRestriction_Length",
                        (double)param.FormatRestriction.Length
                    );

                if (param.FormatRestriction?.MinLength is not null)
                    client.Column(
                        "FormatRestriction_MinLength",
                        (double)param.FormatRestriction.MinLength
                    );

                if (param.FormatRestriction?.Pattern is not null)
                    client.Column(
                        "FormatRestriction_Pattern",
                        (double)param.FormatRestriction.Pattern
                    );

                if (param.FormatRestriction?.TotalDigits is not null)
                    client.Column(
                        "FormatRestriction_TotalDigits",
                        (double)param.FormatRestriction.TotalDigits
                    );

                client.At(param.Timestamp);

                client
                    .Table("DataChannel_InternalId")
                    .Symbol("VesselId", param.VesselId)
                    .Symbol("DataChannelId", param.LocalId)
                    .Column("InternalId", param.InternalId?.ToString())
                    .At(param.Timestamp);
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
            _logger.LogInformation($"IS_CONNECTED {_qdbClient?.Client?.IsConnected}");
            var client = _qdbClient?.Client!;

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
                                .Symbol("VesselId", timeSeriesData?.Package?.Header?.ShipID)
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
