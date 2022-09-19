import React from 'react';
import { useLabContext } from '../../context/LabContext';
import FleetGrid from '../shared/fleet/Fleet';
import VesselHome from '../shared/vessel/VesselHome';

interface Props {}

const Home: React.FC<Props> = () => {
  const { vessel } = useLabContext();
  return vessel.id === 'fleet' ? <FleetGrid /> : <VesselHome />;
};

export default Home;
