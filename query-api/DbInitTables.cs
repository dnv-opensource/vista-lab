using Vista.SDK;

namespace VistaLab.Api;

public class DbInitTables
{
    public static readonly string Vessel =
        @"
        CREATE TABLE IF NOT EXISTS Vessel
        (
            Id string NOT NULL,
            Name string NOT NULL,
            ImoNumber int NOT NULL
        );
    ";

    public static readonly string DataChannel =
        @"
       CREATE TABLE IF NOT EXISTS DataChannel
        (
            DataChannelId string NOT NULL,
            VesselId int NOT NULL,
            Name string NOT NULL,
            DataChannelType string NOT NULL,
            UpdateCycle float,
            CalculationPeriod float,
            FormatType string,
            Timestamp timestamp,
            RangeLow float,
            RangeHigh float,
            UnitSymbol string,
            QuantityName string,
            QualityCoding string,
            Remarks string
        );
    ";

    public static string DataChannelLabel => CreateDataChannelLabelTable();

    public static readonly string FormatRestriction =
        @"
        CREATE TABLE IF NOT EXISTS FormatRestriction
        (
            DataChannelId string NOT NULL,
            Type string NOT NULL,
            Enumeration string,
            FractionDigits string,
            Length int,
            MaxExclusive float,
            MaxInclusive float,
            MaxLength int,
            MinExclusive float,
            MinInclusive float,
            MinLength int,
            Pattern int,
            TotalDigits int,
            WhiteSpace string
        );
    ";

    public static readonly string TimeSeries =
        @"
        CREATE TABLE IF NOT EXISTS TimeSeries
        (
            TimeSeriesId int,
            DataChannelId string,
            Value string,
            Quality string,
            EventType string,
            Timestamp timestamp
        );
    ";

    private static string CreateDataChannelLabelTable()
    {
        var codeBookNames = (IEnumerable<CodebookName>)Enum.GetValues(typeof(CodebookName));
        return $@"CREATE TABLE IF NOT EXISTS DataChannelLabel
        (
            DataChannelId string NOT NULL,
            VisVersion string NOT NULL,
            PrimaryItem string NOT NULL,
            SecondaryItem string,
            {string.Join(", ", codeBookNames.Select(name => name + " string"))}
        );";
    }
}
