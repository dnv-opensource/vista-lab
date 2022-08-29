using Common;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using Vista.SDK.Transport.Json.TimeSeriesData;

namespace QueryApi.Repository;

partial class DataChannelRepository
{
    public sealed record FeatureProps(string VesselId, DateTimeOffset Timestamp);

    public sealed record AdditionalTimeSeriesProperties(
        string? UnitSymbol,
        string? QuantityName,
        float? RangeHigh,
        float? RangeLow,
        string? Name,
        string? VesselId
    );

    private IEnumerable<EventDataSet> ToTimeSeries(DbResponse response)
    {
        var timeSeriesData = new List<EventDataSet>();
        for (int i = 0; i < response.Count; i++)
        {
            var timeSeries = new EventDataSet(
                response.GetValue(i, nameof(TimeSeriesEntity.DataChannelId)).GetStringNonNull(),
                response.GetValue(i, nameof(TimeSeriesEntity.Quality)).GetString(),
                response.GetValue(i, nameof(TimeSeriesEntity.Timestamp)).GetDateTimeOffset(),
                response.GetValue(i, nameof(TimeSeriesEntity.Value)).GetString() ?? "N/A"
            );

            timeSeriesData.Add(timeSeries);
        }

        return timeSeriesData;
    }

    private IEnumerable<AdditionalTimeSeriesProperties> ToAdditionalTimeSeriesProps(
        DbResponse response
    )
    {
        var props = new List<AdditionalTimeSeriesProperties>();
        for (int i = 0; i < response.Count; i++)
        {
            var rangeHigh = response
                .GetValue(i, nameof(DataChannelEntity.Range_High))
                .GetDoubleOrNull();

            var rangeLow = response
                .GetValue(i, nameof(DataChannelEntity.Range_Low))
                .GetDoubleOrNull();

            var additionalProps = new AdditionalTimeSeriesProperties(
                response.GetValue(i, nameof(DataChannelEntity.Unit_UnitSymbol)).GetString(),
                response.GetValue(i, nameof(DataChannelEntity.Unit_QuantityName)).GetString(),
                (float?)rangeHigh,
                (float?)rangeLow,
                response.GetValue(i, nameof(DataChannelEntity.Name)).GetString(),
                response.GetValue(i, nameof(DataChannelEntity.VesselId)).GetString()
            );

            props.Add(additionalProps);
        }

        return props;
    }

    private IEnumerable<Feature<Point, FeatureProps>> ToGeoJsonFeatures(DbResponse response)
    {
        var features = new List<Feature<Point, FeatureProps>>();

        for (var i = 0; i < response.Count; i++)
        {
            var vesselId = response
                .GetValue(i, nameof(TimeSeriesEntity.VesselId))
                .GetStringNonNull();
            var timestamp = response
                .GetValue(i, nameof(TimeSeriesEntity.Timestamp))
                .GetDateTimeOffset();

            var lat = response.GetValue(i, "latitude").GetString();
            var lng = response.GetValue(i, "longitude").GetString();

            if (lat is null || lng is null)
                throw new Exception("Failed to get position for vessel: " + vesselId);

            var pos = new Position(lat, lng);
            var point = new Point(pos);

            var feature = new Feature<Point, FeatureProps>(
                point,
                new FeatureProps(vesselId!, timestamp)
            );
            features.Add(feature);
        }
        ;

        return features;
    }
}