import React, { useEffect } from 'react';
import { FeatureCollection, Point } from 'geojson';
import { useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

interface Props {
  featureCollection: FeatureCollection<Point>;
}

const FitBounds: React.FC<Props> = ({ featureCollection }) => {
  const map = useMap();

  useEffect(() => {
    if (featureCollection.features.length === 0) return;
    map.flyToBounds(
      featureCollection.features.map(f => f.geometry.coordinates as LatLngTuple),
      { padding: [40, 40], maxZoom: 3 }
    );
  }, [map, featureCollection]);
  return null;
};

export default FitBounds;
