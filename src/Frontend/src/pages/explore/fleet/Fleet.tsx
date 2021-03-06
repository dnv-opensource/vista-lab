import React, { useMemo } from 'react';
import { useExploreContext } from '../../../context/ExploreContext';
import { Vessel } from '../vessel/Vessel';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import VesselCard from '../../../components/explore/vessel-card/VesselCard';
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
