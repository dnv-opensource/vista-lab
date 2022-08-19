import L from 'leaflet';
import { useCallback } from 'react';
import { renderToString } from 'react-dom/server';

const useMapIcon = () => {
  const createByJsx = useCallback((icon: JSX.Element): L.DivIcon => {
    return L.divIcon({
      className: 'custom-icon',
      html: renderToString(icon),
    });
  }, []);

  return { createByJsx };
};

export default useMapIcon;
