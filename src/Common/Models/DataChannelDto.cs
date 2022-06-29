using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;

namespace Common.Models;

public readonly record struct DataChannelInfo(
    bool LocalIdParsed,
    LocalIdBuilder? LocalId,
    DataChannel DataChannel,
    Guid InternalId
);

public record LocalIdDto(
    string VisVersion,
    string PrimaryItem,
    string? SecondaryItem,
    string? Position,
    string? Quantity,
    string? Calculation,
    string? State,
    string? Content,
    string? Command,
    string? Type,
    string? Detail
);

public record FormatRestrictionDto(
    string? Type,
    string? Enumeration,
    string? FractionDigits,
    int? Length,
    double? MaxExclusive,
    double? MaxInclusive,
    int? MaxLength,
    double? MinExclusive,
    double? MinInclusive,
    int? MinLength,
    int? Pattern,
    int? TotalDigits,
    string? WhiteSpace
);

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
    FormatRestrictionDto? FormatRestriction,
    LocalIdDto LocalIdBuilder,
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
            double.TryParse(dc.DataChannel.Property.Range?.High, out var rangehigh)
              ? rangehigh
              : null,
            dc.DataChannel.Property.Unit?.UnitSymbol,
            dc.DataChannel.Property.Unit?.QuantityName,
            dc.DataChannel.Property.QualityCoding,
            dc.DataChannel.Property.Remarks,
            new FormatRestrictionDto(
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
                int.TryParse(
                    dc.DataChannel.Property.Format.Restriction?.MaxLength,
                    out var maxLength
                )
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
                int.TryParse(
                    dc.DataChannel.Property.Format.Restriction?.MaxLength,
                    out var minLength
                )
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
                dc.DataChannel.Property.Format.Restriction?.WhiteSpace?.ToString()
            ),
            new LocalIdDto(
                VisVersionExtensions.ToVersionString(dc.LocalId?.VisVersion ?? Defaults.VisVersion),
                dc.LocalId!.PrimaryItem!.ToFullPathString(),
                dc.LocalId!.SecondaryItem?.ToFullPathString(),
                dc.LocalId!.Position,
                dc.LocalId!.Quantity,
                dc.LocalId!.Calculation,
                dc.LocalId!.State,
                dc.LocalId!.Content,
                dc.LocalId!.Command,
                dc.LocalId!.Type,
                dc.LocalId!.Detail
            ),
            timeStamp
        );
    }
}
