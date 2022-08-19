/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx';
import { ControlOptions, LatLng } from 'leaflet';
import React, { useCallback, useEffect, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import Icon from '../../../../ui/icons/Icon';
import { IconName } from '../../../../ui/icons/icons';
import CustomControl from '../CustomControl';
import './CurrentPositionControl.scss';

const CurrentPositionControl: React.FC<ControlOptions> = ({ position = 'bottomright' }) => {
  const [currentPosition, setCurrentPosition] = useState<LatLng>();
  const [flyToPosition, setFlying] = useState(false);
  const [isAtCurrentPosition, setAtCurrentPosition] = useState(false);

  const map = useMapEvents({
    locationfound: event => {
      if (flyToPosition) {
        map.flyTo(event.latlng);
        setFlying(false);
      }
      setCurrentPosition(event.latlng);
    },
    locationerror: () => {
      setCurrentPosition(undefined);
    },
    move: () => {
      if (currentPosition) {
        const zoom = map.getZoom();
        const center = map.getCenter();

        const distance = center.distanceTo(currentPosition);

        // Calculated from empirical values plotted in Excel
        const maxDistanceFromCenter = 176463 * Math.E ** (-0.821 * zoom);
        const marginAround = 2;

        setAtCurrentPosition(distance < Math.max(2, maxDistanceFromCenter * marginAround));
      }
    },
  });

  const locate = useCallback(() => {
    map.locate();
    setFlying(true);
  }, [map, setFlying]);

  // Locate on mount
  useEffect(() => {
    map.locate();
  }, [map]);

  return (
    <CustomControl position={position}>
      <div className={'current-position-control'}>
        <a className={'position-icon-anchor'} role="button" href="#" onClick={locate}>
          <Icon
            className={clsx('position-icon', isAtCurrentPosition ? 'active' : undefined)}
            icon={IconName.Crosshairs}
          />
        </a>
      </div>
    </CustomControl>
  );
};

export default CurrentPositionControl;
