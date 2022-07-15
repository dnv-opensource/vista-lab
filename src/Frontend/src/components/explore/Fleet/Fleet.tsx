import React, { useMemo } from 'react';
import { useExploreContext } from '../../../context/ExploreContext';
import { Vessel } from '../../../pages/explore/vessel/Vessel';
import ResultBar from '../../shared/result-bar/ResultBar';
import ScrollableField from '../../ui/scrollable-field/ScrollableField';
import VesselCard from '../VesselCard/VesselCard';
import './Fleet.scss';

const FleetGrid: React.FC = () => {
  const { dataChannelListPackages } = useExploreContext();
  const vessels = useMemo<Vessel[]>(
    () =>
      dataChannelListPackages?.map(d => {
        return {
          vesselId: d._package?.header?.shipID,
          numDataChannels: d._package?.dataChannelList?.dataChannel?.length,
          status: 0,
        };
      }) ?? [],
    [dataChannelListPackages]
  );

  return (
    <>
      <ResultBar className={'fleet-grid-result'}>Result: {vessels.length}</ResultBar>
      <ScrollableField className={'fleet-grid'}>
        {vessels.map((vessel, i) => (
          <VesselCard key={i} vessel={vessel} />
        ))}
      </ScrollableField>
    </>
  );
};

export default FleetGrid;
