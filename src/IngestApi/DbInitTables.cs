using Vista.SDK;

public sealed class DbInitTables
{
    public static readonly string Vessel =
        @"
        CREATE TABLE IF NOT EXISTS Vessel
        (
            Id STRING NOT NULL,
            Name STRING NOT NULL,
            ImoNumber INT NOT NULL
        );
    ";

    public static string DataChannel => CreateDataChannel();

    private static string CreateDataChannel()
    {
        var codeBookNames = (IEnumerable<CodebookName>)Enum.GetValues(typeof(CodebookName));
        return $@"
        CREATE TABLE IF NOT EXISTS DataChannel
        (
            DataChannelId STRING NOT NULL,
            VesselId SYMBOL capacity 1024 cache index capacity 1048576 NOT NULL,
            Name STRING NOT NULL,
            DataChannelType STRING NOT NULL,
            UpdateCycle FLOAT,
            CalculationPeriod FLOAT,
            FormatType STRING,
            RangeLow FLOAT,
            RangeHigh FLOAT,
            UnitSymbol STRING,
            QuantityName STRING,
            QualityCoding STRING,
            Remarks STRING,
            Timestamp TIMESTAMP,
            FormatRestriction_DataChannelId STRING NOT NULL,
            FormatRestriction_Type STRING NOT NULL,
            FormatRestriction_Enumeration STRING,
            FormatRestriction_FractionDigits STRING,
            FormatRestriction_Length INT,
            FormatRestriction_MaxExclusive FLOAT,
            FormatRestriction_MaxInclusive FLOAT,
            FormatRestriction_MaxLength INT,
            FormatRestriction_MinExclusive FLOAT,
            FormatRestriction_MinInclusive FLOAT,
            FormatRestriction_MinLength INT,
            FormatRestriction_Pattern INT,
            FormatRestriction_TotalDigits INT,
            FormatRestriction_WhiteSpace STRING,
            DataChannelLabel_DataChannelId STRING NOT NULL,
            DataChannelLabel_VisVersion STRING NOT NULL ,
            DataChannelLabel_PrimaryItem STRING NOT NULL,
            DataChannelLabel_SecondaryItem STRING,
            {string.Join(", ", codeBookNames.Select(name => "DataChannelLabel_" + name + " SYMBOL capacity 1024 cache index capacity 1024"))}
        ) timestamp(Timestamp)
        PARTITION BY YEAR;
        ";
    }

    public static readonly string TimeSeries =
        @"
        CREATE TABLE IF NOT EXISTS TimeSeries
        (
            TimeSeriesId INT,
            DataChannelId SYMBOL capacity 8388608 nocache index capacity 8388608 NOT NULL,
            Value STRING,
            Quality STRING,
            EventType STRING,
            Timestamp TIMESTAMP
        ) timestamp(Timestamp)
        PARTITION BY DAY;
    ";
}
