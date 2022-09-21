import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLabContext } from '../../context/LabContext';
import { RoutePath } from '../Routes';
import FleetGrid from '../shared/fleet/Fleet';

interface Props {}

const Home: React.FC<Props> = () => {
  const { isFleet } = useLabContext();
  return isFleet ? <FleetGrid /> : <Navigate to={RoutePath.Search} />;
};

export default Home;
