import { Feature as GeoJSONFeature, FeatureCollection, Geometry, Point } from 'geojson';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { VistaLabApi } from '../../../apiConfig';
import { FeatureProps } from '../../../client';
import { Feature } from '../../../client/models/Feature';
import { useExploreContext } from '../../../context/ExploreContext';
import Map from '../../map/Map';
import './MapContainer.scss';

const emptyFeatureCol: FeatureCollection<Point, FeatureProps> = { features: [], type: 'FeatureCollection' };

const MapContainer: React.FC = () => {
  const { dataChannelListPackages } = useExploreContext();
  const [features, setFeatures] = useState(emptyFeatureCol);

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
    <div className={'vista-map-container'}>
      <Map featureCollection={features} />
    </div>,
    document.body
  );
};

export default MapContainer;
