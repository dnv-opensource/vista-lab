import React from 'react';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import VesselCard from '../../../components/shared/vessel-card/VesselCard';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import { useLabContext } from '../../../context/LabContext';
import './Fleet.scss';

const FleetGrid: React.FC = () => {
  const { fleet } = useLabContext();

  return (
    <>
      <ResultBar className={'fleet-grid-result'}>Result: {fleet.vessels.length}</ResultBar>
      <ScrollableField className={'fleet-grid'}>
        {fleet.vessels.map((vessel, i) => (
          <VesselCard key={i} vessel={vessel} />
        ))}
      </ScrollableField>
    </>
  );
};

export default FleetGrid;
