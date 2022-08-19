import { FeatureCollection, Point } from 'geojson';
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { FeatureProps } from '../../client';
import CurrentPositionControl from './custom-components/controls/current-position-control/CurrentPositionControl';
import VesselsControl from './custom-components/controls/vessels-control/VesselsControl';
import FitBounds from './custom-components/fit-bounds/FitBounds';
import CurrentPositionMarker from './custom-components/markers/current-position-marker/CurrentPositionMarker';
import VesselMarker from './custom-components/markers/vessel-marker/VesselMarker';
import './Map.scss';

interface Props {
  featureCollection: FeatureCollection<Point, FeatureProps>;
}

const Map: React.FC<Props> = ({ featureCollection }) => {
  return (
    <MapContainer className="map" center={[51.505, -0.09]} zoom={1} scrollWheelZoom={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CurrentPositionMarker />
      <CurrentPositionControl position="bottomright" />
      <VesselsControl featureCollection={featureCollection} />
      <FitBounds featureCollection={featureCollection} />
      {featureCollection.features.map((f, index) => (
        <VesselMarker key={index} feature={f} />
      ))}
    </MapContainer>
  );
};

export default Map;
