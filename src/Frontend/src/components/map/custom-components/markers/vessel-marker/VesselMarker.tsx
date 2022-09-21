import { Feature, Point } from 'geojson';
import { LatLngExpression } from 'leaflet';
import { Popup } from 'react-leaflet';
import React from 'react';
import { FeatureProps } from '../../../../../client';
import Icon from '../../../../ui/icons/Icon';
import { IconName } from '../../../../ui/icons/icons';
import CustomMarker from '../CustomMarker';
import './VesselMarker.scss';

interface Props {
  feature: Feature<Point, FeatureProps>;
}

const VesselMarker: React.FC<Props> = ({ feature }) => {
  return (
    <CustomMarker position={feature.geometry.coordinates as LatLngExpression} icon={<Icon icon={IconName.Ship} />}>
      <Popup>{feature.properties.vesselId}</Popup>
    </CustomMarker>
  );
};

export default VesselMarker;
