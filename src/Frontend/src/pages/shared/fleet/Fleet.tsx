import React, { useMemo } from 'react';
import { useExploreContext } from '../../../context/ExploreContext';
import { Vessel } from '../vessel/Vessel';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import VesselCard from '../../../components/shared/vessel-card/VesselCard';
import './Fleet.scss';

const FleetGrid: React.FC = () => {
  const { dataChannelListPackages } = useExploreContext();
  const vessels = useMemo<Vessel[]>(
    () =>
      dataChannelListPackages?.map(d => {
        return {
          vesselId: d.Package?.Header?.ShipID,
          name: 'ShipName' in d.Package.Header ? ((d.Package.Header as any).ShipName as string) : undefined,
          numDataChannels: d.Package?.DataChannelList?.DataChannel?.length,
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
