import { LatLng } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import CustomMarker from '../CustomMarker';
import './CurrentPositionMarker.scss';

const CurrentPositionMarker: React.FC = () => {
  const [position, setPosition] = useState<LatLng>();

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === undefined ? null : (
    <CustomMarker
      position={position}
      icon={
        <div className={'current-position-marker outer'}>
          <div className={'inner'} />
        </div>
      }
    />
  );
};

export default CurrentPositionMarker;
