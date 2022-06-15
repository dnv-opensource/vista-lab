namespace VistaLab.QueryApi.Models;

public record DataChannelDto(
    string InternalId,
    string? ShortId,
    string LocalId,
    string VesselId,
    string Name,
    string DataChannelType,
    double? UpdateCycle,
    double? CalculationPeriod,
    string? FormatType,
    double? RangeLow,
    double? RangeHigh,
    string? UnitSymbol,
    string? QuantityName,
    string? QualityCoding,
    string? Remarks,
    string? FormatRestriction_Type,
    string? FormatRestriction_Enumeration,
    string? FormatRestriction_FractionDigits,
    int? FormatRestriction_Length,
    double? FormatRestriction_MaxExclusive,
    double? FormatRestriction_MaxInclusive,
    int? FormatRestriction_MaxLength,
    double? FormatRestriction_MinExclusive,
    double? FormatRestriction_MinInclusive,
    int? FormatRestriction_MinLength,
    int? FormatRestriction_Pattern,
    int? FormatRestriction_TotalDigits,
    string? FormatRestriction_WhiteSpace,
    string LocalId_VisVersion,
    string LocalId_PrimaryItem,
    string? LocalId_SecondaryItem,
    string? LocalId_Position,
    string? LocalId_Quantity,
    string? LocalId_Calculation,
    string? LocalId_State,
    string? LocalId_Content,
    string? LocalId_Command,
    string? LocalId_Type,
    string? LocalId_Detail,
    DateTime Timestamp
);
