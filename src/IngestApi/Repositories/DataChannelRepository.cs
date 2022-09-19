using Common;
using Vista.SDK.Transport.Json.DataChannel;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace IngestApi.Repositories;

public sealed class DataChannelRepository : IHostedService
{
    private readonly ILogger<DataChannel> _logger;
    private readonly QuestDbClient _dbClient;
    private readonly QuestDbInsertClient _questDbClient;

    public DataChannelRepository(
        QuestDbClient client,
        QuestDbInsertClient questDbClient,
        ILogger<DataChannel> logger
    )
    {
        _questDbClient = questDbClient;
        _dbClient = client;
        _logger = logger;
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

        var dataChannels = dataChannelList.Package.DataChannelList.DataChannel
            .Select(d => DataChannelEntity.FromSdkDataChannel(d, dataChannelList.Package.Header))
            .Where(d => d is not null)
            .Cast<DataChannelEntity>()
            .ToArray();

        try
        {
            _logger.LogInformation("Inserting data into DataChannel");
            var client = _questDbClient.Client;

            foreach (var dataChannel in dataChannels)
            {
                client
                    .Table(DataChannelEntity.TableName)
                    // Symbols first
                    .Symbol(nameof(DataChannelEntity.VesselId), dataChannel.VesselId)
                    .Symbol(nameof(DataChannelEntity.InternalId), dataChannel.InternalId)
                    .Symbol(
                        nameof(DataChannelEntity.LocalId_VisVersion),
                        dataChannel.LocalId_VisVersion
                    )
                    .Symbol(
                        nameof(DataChannelEntity.LocalId_PrimaryItem),
                        dataChannel.LocalId_PrimaryItem
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_SecondaryItem),
                        dataChannel.LocalId_SecondaryItem
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_Position),
                        dataChannel.LocalId_Position
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_Quantity),
                        dataChannel.LocalId_Quantity
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_Calculation),
                        dataChannel.LocalId_Calculation
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_Content),
                        dataChannel.LocalId_Content
                    )
                    .TrySymbol(
                        nameof(DataChannelEntity.LocalId_Command),
                        dataChannel.LocalId_Command
                    )
                    .TrySymbol(nameof(DataChannelEntity.LocalId_Type), dataChannel.LocalId_Type)
                    .TrySymbol(nameof(DataChannelEntity.LocalId_Detail), dataChannel.LocalId_Detail)
                    // Columns
                    .Column(nameof(DataChannelEntity.LocalId), dataChannel.LocalId)
                    .TryColumn(nameof(DataChannelEntity.VesselName), dataChannel.VesselName)
                    .TryColumn(nameof(DataChannelEntity.ShortId), dataChannel.ShortId)
                    .TryColumn(
                        nameof(DataChannelEntity.NameObject_NamingRule),
                        dataChannel.NameObject_NamingRule
                    )
                    .Column(
                        nameof(DataChannelEntity.DataChannelType_Type),
                        dataChannel.DataChannelType_Type
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.DataChannelType_UpdateCycle),
                        dataChannel.DataChannelType_UpdateCycle
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.DataChannelType_CalculationPeriod),
                        dataChannel.DataChannelType_CalculationPeriod
                    )
                    .Column(nameof(DataChannelEntity.Format_Type), dataChannel.Format_Type)
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_Enumeration),
                        dataChannel.Format_Restriction_Enumeration
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_FractionDigits),
                        dataChannel.Format_Restriction_FractionDigits
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_Length),
                        dataChannel.Format_Restriction_Length
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MaxExclusive),
                        dataChannel.Format_Restriction_MaxExclusive
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MaxInclusive),
                        dataChannel.Format_Restriction_MaxInclusive
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MaxLength),
                        dataChannel.Format_Restriction_MaxLength
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MinExclusive),
                        dataChannel.Format_Restriction_MinExclusive
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MinInclusive),
                        dataChannel.Format_Restriction_MinInclusive
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_MinLength),
                        dataChannel.Format_Restriction_MinLength
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_Pattern),
                        dataChannel.Format_Restriction_Pattern
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_TotalDigits),
                        dataChannel.Format_Restriction_TotalDigits
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Format_Restriction_WhiteSpace),
                        dataChannel.Format_Restriction_WhiteSpace
                    )
                    .TryColumn(nameof(DataChannelEntity.Range_Low), dataChannel.Range_Low)
                    .TryColumn(nameof(DataChannelEntity.Range_High), dataChannel.Range_High)
                    .TryColumn(
                        nameof(DataChannelEntity.Unit_UnitSymbol),
                        dataChannel.Unit_UnitSymbol
                    )
                    .TryColumn(
                        nameof(DataChannelEntity.Unit_QuantityName),
                        dataChannel.Unit_QuantityName
                    )
                    .TryColumn(nameof(DataChannelEntity.QualityCoding), dataChannel.QualityCoding)
                    .TryColumn(nameof(DataChannelEntity.AlertPriority), dataChannel.AlertPriority)
                    .TryColumn(nameof(DataChannelEntity.Name), dataChannel.Name)
                    .TryColumn(nameof(DataChannelEntity.Remarks), dataChannel.Remarks)
                    .TryColumn(nameof(DataChannelEntity.CalculationInfo), default(string))
                    .At(dataChannel.Timestamp);

                client
                    .Table(DataChannelInternalIdEntity.TableName)
                    .Symbol(nameof(DataChannelInternalIdEntity.VesselId), dataChannel.VesselId)
                    .Symbol(nameof(DataChannelInternalIdEntity.DataChannelId), dataChannel.LocalId)
                    .Symbol(
                        nameof(DataChannelInternalIdEntity.InternalId),
                        dataChannel.InternalId?.ToString()
                    )
                    .At(dataChannel.Timestamp);
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
            var client = _questDbClient.Client;

            var vesselId = timeSeriesData.Package.Header?.ShipID;

            var count = 0;

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
                                .Table(TimeSeriesEntity.TableName)
                                .Symbol(nameof(TimeSeriesEntity.DataChannelId), dataChannel)
                                .Symbol(nameof(TimeSeriesEntity.VesselId), vesselId)
                                .TryColumn(
                                    nameof(TimeSeriesEntity.Value),
                                    j < data.Value.Count ? data.Value[j] : null
                                )
                                .TryColumn(
                                    nameof(TimeSeriesEntity.Quality),
                                    j < data.Quality?.Count ? data.Quality?[j] : null
                                )
                                .At(data.TimeStamp.DateTime);
                            count++;
                        }
                    }
                }
            }

            await client.SendAsync(cancellationToken);
            _logger.LogInformation(
                "Finished inserting data into TimeSeries - samples={samplesCount}",
                count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into TimeSeries");
            throw;
        }
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var query =
            $@"
            {DbSchemas.DataChannel}
            {DbSchemas.TimeSeries}
            {DbSchemas.DataChannel_InternalId}
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
                await _dbClient.Execute(q, cancellationToken);
            }
            _logger.LogInformation("DB initialized");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
