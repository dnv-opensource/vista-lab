import { ControlOptions } from 'leaflet';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import CurrentPositionControl from './current-position-control/CurrentPositionControl';

const CustomControl: React.FC<React.PropsWithChildren<ControlOptions>> = ({ position = 'bottomleft', children }) => {
  const positionContainer = useMemo(() => {
    let controllClassName: string[] = [];
    switch (position) {
      case 'bottomleft':
        controllClassName = ['bottom', 'left'];
        break;
      case 'bottomright':
        controllClassName = ['bottom', 'right'];
        break;
      case 'topleft':
        controllClassName = ['top', 'left'];
        break;
      case 'topright':
        controllClassName = ['top', 'right'];
        break;
    }

    const clsnm = controllClassName.map(n => 'leaflet-' + n).join(' ');

    const container = document.getElementsByClassName(clsnm);

    if (!container || container.length === 0)
      throw new Error(CurrentPositionControl.name + ': No mounted container found for classname - ' + clsnm);
    if (container.length !== 1)
      throw new Error(CurrentPositionControl.name + ': Found multiple mounted containers with classname - ' + clsnm);

    return container.item(0);
  }, [position]);

  return (
    positionContainer &&
    ReactDOM.createPortal(<div className={'leaflet-control leaflet-bar '}>{children}</div>, positionContainer)
  );
};

export default CustomControl;
