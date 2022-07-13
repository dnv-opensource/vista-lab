import React, { useMemo } from 'react';
import { Vessel } from '../../../client/models/Vessel';
import { VesselStatus } from '../../../client/models/VesselStatus';
import ResultBar from '../../shared/result-bar/ResultBar';
import VesselCard from '../VesselCard/VesselCard';
import './FleetGrid.scss';

const FleetGrid: React.FC = () => {
  const vessels = useMemo<Vessel[]>(
    () => [
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
      { numDataChannels: 120, vesselId: 'IMO1234567', status: VesselStatus.NUMBER_0 },
    ],
    []
  );

  return (
    <>
      <ResultBar className={'fleet-grid-result'}>Result: {vessels.length}</ResultBar>
      <div className={'fleet-grid'}>
        {vessels.map((vessel, i) => (
          <VesselCard key={i} vessel={vessel} />
        ))}
      </div>
    </>
  );
};

export default FleetGrid;
