using Common;

public sealed class DbSchemas
{
    public static readonly string DataChannel =
        $@"
        CREATE TABLE IF NOT EXISTS {DataChannelEntity.TableName}
        (
            {nameof(DataChannelEntity.InternalId)} SYMBOL capacity 1048576 nocache index capacity 8192 NOT NULL,
            {nameof(DataChannelEntity.ShortId)} STRING,
            {nameof(DataChannelEntity.LocalId)} STRING NOT NULL,
            {nameof(DataChannelEntity.VesselId)} SYMBOL capacity 1024 cache index capacity 8192 NOT NULL,
            {nameof(DataChannelEntity.VesselName)} STRING,

            {nameof(DataChannelEntity.NameObject_NamingRule)} STRING,

            {nameof(DataChannelEntity.DataChannelType_Type)} STRING NOT NULL,
            {nameof(DataChannelEntity.DataChannelType_UpdateCycle)} FLOAT,
            {nameof(DataChannelEntity.DataChannelType_CalculationPeriod)} FLOAT,

            {nameof(DataChannelEntity.Format_Type)} STRING NOT NULL,
            {nameof(DataChannelEntity.Format_Restriction_Enumeration)} STRING,
            {nameof(DataChannelEntity.Format_Restriction_FractionDigits)} STRING,
            {nameof(DataChannelEntity.Format_Restriction_Length)} INT,
            {nameof(DataChannelEntity.Format_Restriction_MaxExclusive)} FLOAT,
            {nameof(DataChannelEntity.Format_Restriction_MaxInclusive)} FLOAT,
            {nameof(DataChannelEntity.Format_Restriction_MaxLength)} INT,
            {nameof(DataChannelEntity.Format_Restriction_MinExclusive)} FLOAT,
            {nameof(DataChannelEntity.Format_Restriction_MinInclusive)} FLOAT,
            {nameof(DataChannelEntity.Format_Restriction_MinLength)} INT,
            {nameof(DataChannelEntity.Format_Restriction_Pattern)} INT,
            {nameof(DataChannelEntity.Format_Restriction_TotalDigits)} INT,
            {nameof(DataChannelEntity.Format_Restriction_WhiteSpace)} STRING,

            {nameof(DataChannelEntity.Range_Low)} FLOAT,
            {nameof(DataChannelEntity.Range_High)} FLOAT,

            {nameof(DataChannelEntity.Unit_UnitSymbol)} STRING,
            {nameof(DataChannelEntity.Unit_QuantityName)} STRING,

            {nameof(DataChannelEntity.QualityCoding)} STRING,
            {nameof(DataChannelEntity.AlertPriority)} STRING,
            {nameof(DataChannelEntity.Name)} STRING,
            {nameof(DataChannelEntity.Remarks)} STRING,

            {nameof(DataChannelEntity.LocalId_VisVersion)} SYMBOL capacity 128 cache index capacity 8192 NOT NULL,
            {nameof(DataChannelEntity.LocalId_PrimaryItem)} SYMBOL capacity 8192 cache index capacity 8192 NOT NULL,
            {nameof(DataChannelEntity.LocalId_SecondaryItem)} SYMBOL capacity 8192 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Position)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Quantity)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Calculation)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Content)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Command)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Type)} SYMBOL capacity 1024 cache index capacity 8192,
            {nameof(DataChannelEntity.LocalId_Detail)} SYMBOL capacity 1024 cache index capacity 8192,

            {nameof(DataChannelEntity.CalculationInfo)} STRING,

            {nameof(DataChannelEntity.Timestamp)} TIMESTAMP NOT NULL
        ) timestamp({nameof(DataChannelEntity.Timestamp)})
        PARTITION BY YEAR;
        ";

    public static readonly string TimeSeries =
        $@"
        CREATE TABLE IF NOT EXISTS {TimeSeriesEntity.TableName}
        (
            {nameof(TimeSeriesEntity.DataChannelId)} SYMBOL capacity 1048576 nocache index capacity 8192 NOT NULL,
            {nameof(TimeSeriesEntity.VesselId)} SYMBOL capacity 1024 cache index capacity 8192 NOT NULL,
            {nameof(TimeSeriesEntity.Value)} STRING,
            {nameof(TimeSeriesEntity.Quality)} STRING,
            {nameof(TimeSeriesEntity.Timestamp)} TIMESTAMP NOT NULL
        ) timestamp({nameof(TimeSeriesEntity.Timestamp)})
        PARTITION BY DAY;
    ";

    public static readonly string DataChannel_InternalId =
        $@"
        CREATE TABLE IF NOT EXISTS {DataChannelInternalIdEntity.TableName}
        (
            {nameof(DataChannelInternalIdEntity.DataChannelId)} SYMBOL capacity 1048576 nocache index capacity 8192 NOT NULL,
            {nameof(DataChannelInternalIdEntity.VesselId)} SYMBOL capacity 1024 cache index capacity 8192 NOT NULL,
            {nameof(DataChannelInternalIdEntity.InternalId)} SYMBOL capacity 1048576 nocache index capacity 8192 NOT NULL,
            {nameof(DataChannelInternalIdEntity.Timestamp)} TIMESTAMP NOT NULL
        ) timestamp({nameof(DataChannelInternalIdEntity.Timestamp)})
        PARTITION BY YEAR;
    ";
}
