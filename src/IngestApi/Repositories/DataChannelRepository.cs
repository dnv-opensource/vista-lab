using Common;
using Vista.SDK;
//using Vista.SDK.Transport.DataChannel;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;

using Vista.SDK.Transport.TimeSeries;

namespace IngestApi.Repositories;

public sealed class DataChannelRepository : IDataChannelRepository
{
    private readonly ILogger<DataChannel> _logger;
    private readonly IDbClient _client;

    public DataChannelRepository(IDbClient client, ILogger<DataChannel> logger)
    {
        _client = client;
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
                await _client.ExecuteAsync(q, cancellationToken);
            }
            _logger.LogInformation("DB initialized");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database");
            throw;
        }
    }

    private readonly record struct DataChannelInfo(
        bool LocalIdParsed,
        LocalIdBuilder? LocalId,
        DataChannel DataChannel
    );

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
                        dataChannelId = d.DataChannel.DataChannelID.ShortID,
                        vesselId = dataChannelList.Package.Header.ShipID,
                        name = d.DataChannel.Property.Name!.Contains("\'")
                          ? d.DataChannel.Property.Name.Replace("\'", "")
                          : d.DataChannel.Property.Name,
                        dataChannelType = d.DataChannel.Property.DataChannelType.Type.Contains("\'")
                          ? d.DataChannel.Property.DataChannelType.Type.Replace("\'", "")
                          : d.DataChannel.Property.DataChannelType.Type,
                        formatRestrictionDataChannelId = d.DataChannel.DataChannelID.ShortID,
                        formatRestrictionType = d.DataChannel.Property.Format.Type,
                        dataChannelLabelDataChannelId = d.DataChannel.DataChannelID.ShortID,
                        dataChannelLabelVisVersion = d.LocalId?.VisVersion.ToString(),
                        dataChannelLabelPrimaryItem = d.LocalId?.PrimaryItem?.ToString()
                    }
            )
            .ToArray();

        try
        {
            _logger.LogInformation("Inserting data into DataChannel");
            foreach (var param in dataChannelParam)
            {
                var query =
                    $@"
            INSERT INTO DataChannel (Timestamp, DataChannelId, VesselId, Name, DataChannelType, FormatRestriction_DataChannelId,
                                       FormatRestriction_Type, DataChannelLabel_DataChannelId, DataChannelLabel_VisVersion, DataChannelLabel_PrimaryItem)
            VALUES (now(), '{param.dataChannelId}', '{param.vesselId}', '{param.name}', '{param.dataChannelType}', '{param.formatRestrictionDataChannelId}',
                            '{param.formatRestrictionType}', '{param.dataChannelLabelDataChannelId}', '{param.dataChannelLabelVisVersion}', '{param.dataChannelLabelPrimaryItem}')
        ";

                await _client.ExecuteAsync(query, cancellationToken);
            }
            _logger.LogInformation("Finished inserting data into DataChannel");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert data into DataChannel");
            throw;
        }
    }

    public ValueTask InsertTimeSeriesData(
        TimeSeriesDataPackage timeSeriesData,
        CancellationToken cancellationToken
    )
    {
        throw new NotImplementedException();
    }
}
