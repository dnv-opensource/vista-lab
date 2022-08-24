import clsx from 'clsx';
import { Feature as GeoJSONFeature, FeatureCollection, Geometry, Point } from 'geojson';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { VistaLabApi } from '../../../apiConfig';
import { FeatureProps } from '../../../client';
import { Feature } from '../../../client/models/Feature';
import { useExploreContext } from '../../../context/ExploreContext';
import Map from '../../map/Map';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import './MapContainer.scss';

const emptyFeatureCol: FeatureCollection<Point, FeatureProps> = { features: [], type: 'FeatureCollection' };

const MapContainer: React.FC = () => {
  const { dataChannelListPackages } = useExploreContext();
  const [features, setFeatures] = useState(emptyFeatureCol);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (!dataChannelListPackages || dataChannelListPackages.length === 0) return;

    const getVesselPositions = async () => {
      const features = await VistaLabApi.DataChannelApi.dataChannelGetVesselPositions();

      const toGeoJsonFeatures = (feat: Feature): GeoJSONFeature<Point, FeatureProps> => {
        if (
          !feat.type ||
          !feat.geometry ||
          !feat.geometry ||
          feat.geometry.coordinates?.latitude === undefined ||
          feat.geometry.coordinates?.longitude === undefined
        )
          throw new Error(`
          Invalid data from API:
          @type = ${feat.type}
          @vessel = ${feat.properties?.vesselId}
          @timestamp = ${feat.properties?.timestamp}
          `);

        const type = 'Feature';
        const geometry: Geometry = {
          type: 'Point',
          coordinates: [feat.geometry.coordinates?.latitude!, feat.geometry.coordinates?.longitude!],
        };
        const properties = feat.properties!;

        return { type, geometry, properties };
      };

      setFeatures({ features: features.map(toGeoJsonFeatures), type: 'FeatureCollection' });
    };

    getVesselPositions();
  }, [dataChannelListPackages, setFeatures]);

  return ReactDOM.createPortal(
    <div className={clsx('vista-map-wrapper', isVisible ? 'visible' : 'collapsed')}>
      {isVisible ? (
        <div className={'visible-map-container'}>
          <Icon className="collapse-map-icon" icon={IconName.XMark} onClick={() => setVisible(false)} />
          <Map featureCollection={features} />
        </div>
      ) : (
        <div className={'collapsed-map-container'} onClick={() => setVisible(true)}>
          {<Icon icon={IconName.Map} />}
        </div>
      )}
    </div>,
    document.body
  );
};

export default MapContainer;
