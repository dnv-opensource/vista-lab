import React from 'react';
import { Marker, MarkerProps } from 'react-leaflet';
import useMapIcon from '../../../../hooks/use-map-icon';

interface Props extends Omit<MarkerProps, 'icon'> {
  icon: JSX.Element;
}

const CustomMarker: React.FC<Props> = ({ icon, children, ...restProps }) => {
  const { createByJsx } = useMapIcon();
  return (
    <Marker {...restProps} icon={createByJsx(icon)}>
      {children}
    </Marker>
  );
};

export default CustomMarker;
