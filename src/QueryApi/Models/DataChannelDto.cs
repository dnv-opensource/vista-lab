namespace VistaLab.QueryApi.Models;

public record class DataChannelDto
{
    public string DataChannelId { get; set; } = string.Empty;
    public string VesselId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DataChannelType { get; set; } = string.Empty;
    public double? UpdateCycle { get; set; }
    public double? CalculationPeriod { get; set; }
    public string? FormatType { get; set; }
    public double? RangeLow { get; set; }
    public double? RangeHigh { get; set; }
    public string? UnitSymbol { get; set; }
    public string? QuantityName { get; set; }
    public string? QualityCoding { get; set; }
    public string? Remarks { get; set; }
    public string? FormatRestriction_Type { get; set; }
    public string? FormatRestriction_Enumeration { get; set; }
    public string? FormatRestriction_FractionDigits { get; set; }
    public int? FormatRestriction_Length { get; set; }
    public double? FormatRestriction_MaxExclusive { get; set; }
    public double? FormatRestriction_MaxInclusive { get; set; }
    public int? FormatRestriction_MaxLength { get; set; }
    public double? FormatRestriction_MinExclusive { get; set; }
    public double? FormatRestriction_MinInclusive { get; set; }
    public int? FormatRestriction_MinLength { get; set; }
    public int? FormatRestriction_Pattern { get; set; }
    public int? FormatRestriction_TotalDigits { get; set; }
    public string? FormatRestriction_WhiteSpace { get; set; }
    public string LocalId_VisVersion { get; set; } = string.Empty;
    public string LocalId_PrimaryItem { get; set; } = string.Empty;
    public string? LocalId_SecondaryItem { get; set; }
    public string? LocalId_Position { get; set; }
    public string? LocalId_Quantity { get; set; }
    public string? LocalId_Calculation { get; set; }
    public string? LocalId_State { get; set; }
    public string? LocalId_Content { get; set; }
    public string? LocalId_Command { get; set; }
    public string? LocalId_Type { get; set; }
    public string? LocalId_Detail { get; set; }
    public DateTime Timestamp { get; set; }
}
