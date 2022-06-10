using Vista.SDK;

namespace Common;

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

    public static readonly string DataChannel =
        @"
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
            Timestamp TIMESTAMP
        ) timestamp(Timestamp)
        PARTITION BY YEAR;
    ";

    public static string DataChannelLabel => CreateDataChannelLabelTable();

    private static string CreateDataChannelLabelTable()
    {
        var codeBookNames = (IEnumerable<CodebookName>)Enum.GetValues(typeof(CodebookName));
        return $@"CREATE TABLE IF NOT EXISTS DataChannelLabel
        (
            DataChannelId STRING NOT NULL,
            VisVersion STRING NOT NULL ,
            PrimaryItem STRING NOT NULL,
            SecondaryItem STRING,
            {string.Join(", ", codeBookNames.Select(name => name + " SYMBOL capacity 1024 cache index capacity 1024"))}
        );";
    }

    public static readonly string FormatRestriction =
        @"
        CREATE TABLE IF NOT EXISTS FormatRestriction
        (
            DataChannelId STRING NOT NULL,
            Type STRING NOT NULL,
            Enumeration STRING,
            FractionDigits STRING,
            Length INT,
            MaxExclusive FLOAT,
            MaxInclusive FLOAT,
            MaxLength INT,
            MinExclusive FLOAT,
            MinInclusive FLOAT,
            MinLength INT,
            Pattern INT,
            TotalDigits INT,
            WhiteSpace STRING
        );
    ";

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
