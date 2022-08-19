/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Icon from '../../../../ui/icons/Icon';
import { IconName } from '../../../../ui/icons/icons';
import CustomControl from '../CustomControl';
import { FeatureCollection, Point } from 'geojson';
import { useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

interface Props {
  featureCollection: FeatureCollection<Point>;
}

const VesselsControl: React.FC<Props> = ({ featureCollection }) => {
  const map = useMap();
  return (
    <CustomControl position="bottomleft">
      <a
        href="#"
        role={'button'}
        onClick={() => map.flyToBounds(featureCollection.features.map(f => f.geometry.coordinates as LatLngTuple))}
      >
        <Icon icon={IconName.Ship} />
      </a>
    </CustomControl>
  );
};

export default VesselsControl;
