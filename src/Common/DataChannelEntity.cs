using MassTransit;
using System.Globalization;
using System.Text.Json;
using Vista.SDK;
using Vista.SDK.Transport.Json.DataChannel;

namespace Common;

public sealed record DataChannelEntity(
    string VesselId,
    string? VesselName,
    // Generated to uniquely identify a physical datachannel (does not change across VIS versions)
    string InternalId,
    // DataChannelID fields
    string LocalId,
    string? ShortId,
    // DataChannelID.NameObject fields
    string? NameObject_NamingRule,
    // Property.DataChannelType fields
    string DataChannelType_Type,
    double? DataChannelType_CalculationPeriod,
    double? DataChannelType_UpdateCycle,
    // Property.Format fields
    string Format_Type,
    string? Format_Restriction_Enumeration,
    string? Format_Restriction_FractionDigits,
    int? Format_Restriction_Length,
    double? Format_Restriction_MaxExclusive,
    double? Format_Restriction_MaxInclusive,
    int? Format_Restriction_MaxLength,
    double? Format_Restriction_MinExclusive,
    double? Format_Restriction_MinInclusive,
    int? Format_Restriction_MinLength,
    int? Format_Restriction_Pattern,
    int? Format_Restriction_TotalDigits,
    string? Format_Restriction_WhiteSpace,
    // Property.Range fields
    double? Range_High,
    double? Range_Low,
    // Property.Unit fields
    string? Unit_UnitSymbol,
    string? Unit_QuantityName,
    // Property root fields
    string? QualityCoding,
    string? AlertPriority,
    string? Name,
    string? Remarks,
    // DataChannelID.LocalId destructured
    string LocalId_VisVersion,
    string LocalId_PrimaryItem,
    string? LocalId_SecondaryItem,
    string? LocalId_Position,
    string? LocalId_Quantity,
    string? LocalId_Calculation,
    string? LocalId_Content,
    string? LocalId_Command,
    string? LocalId_Type,
    string? LocalId_Detail,
    DateTime Timestamp
)
{
    public static readonly string TableName = "DataChannel";

    public static DataChannelEntity? FromSdkDataChannel(DataChannel dataChannel, Header header)
    {
        var dataChannelId = dataChannel.DataChannelID;
        var property = dataChannel.Property;
        var dataChannelType = property.DataChannelType;
        var format = property.Format;
        var formatRestriction = property.Format.Restriction;
        var range = property.Range;
        var unit = property.Unit;

        if (!LocalIdBuilder.TryParse(dataChannelId.LocalID, out var localIdBuilder))
            return null;
        if (localIdBuilder.IsEmpty || !localIdBuilder.IsValid)
            return null;

        var localId = localIdBuilder.Build();

        var internalId = NewId.NextGuid();

        var shipName =
            (header.AdditionalProperties?.TryGetValue("ShipName", out var shipNameObj) ?? false)
                ? (shipNameObj?.ToString())
                : null;

        static double? ParseDouble(string? value) =>
            double.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var v)
              ? v
              : null;
        static int? ParseInt(string? value) =>
            int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var v)
              ? v
              : null;

        return new DataChannelEntity(
            header.ShipID,
            shipName,
            internalId.ToString(),
            dataChannelId.LocalID,
            dataChannelId.ShortID,
            dataChannelId.NameObject?.NamingRule,
            dataChannelType.Type,
            ParseDouble(dataChannelType.CalculationPeriod),
            ParseDouble(dataChannelType.UpdateCycle),
            format.Type,
            formatRestriction?.Enumeration is null
              ? null
              : JsonSerializer.Serialize(formatRestriction.Enumeration),
            formatRestriction?.FractionDigits,
            ParseInt(formatRestriction?.Length),
            ParseDouble(formatRestriction?.MaxExclusive),
            ParseDouble(formatRestriction?.MaxInclusive),
            ParseInt(formatRestriction?.MaxLength),
            ParseDouble(formatRestriction?.MinExclusive),
            ParseDouble(formatRestriction?.MinInclusive),
            ParseInt(formatRestriction?.MinLength),
            ParseInt(formatRestriction?.Pattern),
            ParseInt(formatRestriction?.TotalDigits),
            formatRestriction?.WhiteSpace?.ToString(),
            ParseDouble(range?.High),
            ParseDouble(range?.Low),
            unit?.UnitSymbol,
            unit?.QuantityName,
            property.QualityCoding,
            property.AlertPriority,
            property.Name,
            property.Remarks,
            localId.VisVersion.ToString(),
            localId.PrimaryItem.ToFullPathString(),
            localId.SecondaryItem?.ToFullPathString(),
            localId.Position,
            localId.Quantity,
            localId.Calculation,
            localId.Content,
            localId.Command,
            localId.Type,
            localId.Detail,
            header.DataChannelListID.TimeStamp.DateTime
        );
    }
}
