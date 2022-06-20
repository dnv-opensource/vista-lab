using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;

namespace Common.Models;

public readonly record struct DataChannelInfo(
    bool LocalIdParsed,
    LocalIdBuilder? LocalId,
    DataChannel DataChannel,
    Guid InternalId
);

/// <summary>
///
/// </summary>
/// <param name="InternalId">Auto generated ID that won't change across the differente VIS versions</param>
/// <param name="ShortId">Id assigned externally</param>
/// <param name="LocalId">Same as DataChannelId, the VIS representation of a data channel</param>
/// <param name="VesselId"></param>
/// <param name="Name"></param>
/// <param name="DataChannelType"></param>
/// <param name="UpdateCycle"></param>
/// <param name="CalculationPeriod"></param>
/// <param name="FormatType"></param>
/// <param name="RangeLow"></param>
/// <param name="RangeHigh"></param>
/// <param name="UnitSymbol"></param>
/// <param name="QuantityName"></param>
/// <param name="QualityCoding"></param>
/// <param name="Remarks"></param>
/// <param name="FormatRestriction_Type"></param>
/// <param name="FormatRestriction_Enumeration"></param>
/// <param name="FormatRestriction_FractionDigits"></param>
/// <param name="FormatRestriction_Length"></param>
/// <param name="FormatRestriction_MaxExclusive"></param>
/// <param name="FormatRestriction_MaxInclusive"></param>
/// <param name="FormatRestriction_MaxLength"></param>
/// <param name="FormatRestriction_MinExclusive"></param>
/// <param name="FormatRestriction_MinInclusive"></param>
/// <param name="FormatRestriction_MinLength"></param>
/// <param name="FormatRestriction_Pattern"></param>
/// <param name="FormatRestriction_TotalDigits"></param>
/// <param name="FormatRestriction_WhiteSpace"></param>
/// <param name="LocalId_VisVersion"></param>
/// <param name="LocalId_PrimaryItem"></param>
/// <param name="LocalId_SecondaryItem"></param>
/// <param name="LocalId_Position"></param>
/// <param name="LocalId_Quantity"></param>
/// <param name="LocalId_Calculation"></param>
/// <param name="LocalId_State"></param>
/// <param name="LocalId_Content"></param>
/// <param name="LocalId_Command"></param>
/// <param name="LocalId_Type"></param>
/// <param name="LocalId_Detail"></param>
/// <param name="Timestamp"></param>
public record DataChannelDto(
    string InternalId,
    string? ShortId,
    string LocalId,
    string VesselId,
    string? Name,
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
)
{
    public static DataChannelDto CreateFromDataChannel(
        string shipId,
        DataChannelInfo dc,
        DateTime timeStamp
    )
    {
        return new DataChannelDto(
            dc.InternalId.ToString(),
            dc.DataChannel.DataChannelID.ShortID,
            dc.DataChannel.DataChannelID.LocalID,
            shipId,
            dc.DataChannel.Property.Name,
            dc.DataChannel.Property.DataChannelType.Type,
            double.TryParse(
                dc.DataChannel.Property.DataChannelType.UpdateCycle,
                out var updateCycle
            )
              ? updateCycle
              : null,
            double.TryParse(
                dc.DataChannel.Property.DataChannelType.CalculationPeriod,
                out double calcPeriod
            )
              ? calcPeriod
              : null,
            dc.DataChannel.Property.Format.Type,
            double.TryParse(dc.DataChannel.Property.Range?.Low, out var rangeLow) ? rangeLow : null,
            double.TryParse(dc.DataChannel.Property.Range?.Low, out var rangehigh)
              ? rangehigh
              : null,
            dc.DataChannel.Property.Unit?.UnitSymbol,
            dc.DataChannel.Property.Unit?.QuantityName,
            dc.DataChannel.Property.QualityCoding,
            dc.DataChannel.Property.Remarks,
            dc.DataChannel.Property.Format.Type,
            dc.DataChannel.Property.Format.Restriction?.Enumeration is null
              ? null
              : string.Join(", ", dc.DataChannel.Property.Format.Restriction.Enumeration!),
            dc.DataChannel.Property.Format.Restriction?.FractionDigits,
            int.TryParse(dc.DataChannel.Property.Format.Restriction?.Length, out var length)
              ? length
              : null,
            double.TryParse(
                dc.DataChannel.Property.Format.Restriction?.MaxExclusive,
                out var maxExclusive
            )
              ? maxExclusive
              : null,
            double.TryParse(
                dc.DataChannel.Property.Format.Restriction?.MaxInclusive,
                out var maxInclusive
            )
              ? maxInclusive
              : null,
            int.TryParse(dc.DataChannel.Property.Format.Restriction?.MaxLength, out var maxLength)
              ? maxLength
              : null,
            double.TryParse(
                dc.DataChannel.Property.Format.Restriction?.MaxExclusive,
                out var minExclusive
            )
              ? minExclusive
              : null,
            double.TryParse(
                dc.DataChannel.Property.Format.Restriction?.MaxInclusive,
                out var minInclusive
            )
              ? minInclusive
              : null,
            int.TryParse(dc.DataChannel.Property.Format.Restriction?.MaxLength, out var minLength)
              ? minLength
              : null,
            int.TryParse(dc.DataChannel.Property.Format.Restriction?.Pattern, out var pattern)
              ? pattern
              : null,
            int.TryParse(
                dc.DataChannel.Property.Format.Restriction?.TotalDigits,
                out var totalDigits
            )
              ? totalDigits
              : null,
            dc.DataChannel.Property.Format.Restriction?.WhiteSpace?.ToString(),
            VisVersionExtensions.ToVersionString(dc.LocalId?.VisVersion ?? Defaults.VisVersion),
            dc.LocalId!.PrimaryItem!.ToString(),
            dc.LocalId!.SecondaryItem?.ToString(),
            dc.LocalId!.Position,
            dc.LocalId!.Quantity,
            dc.LocalId!.Calculation,
            dc.LocalId!.State,
            dc.LocalId!.Content,
            dc.LocalId!.Command,
            dc.LocalId!.Type,
            dc.LocalId!.Detail,
            timeStamp
        );
    }
}
