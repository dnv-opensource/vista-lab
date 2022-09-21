import React from 'react';
import { useLabContext } from '../../context/LabContext';
import FleetGrid from '../shared/fleet/Fleet';
import './Report.scss';
import ResultsTable from './results-table/ResultsTable';

const Report: React.FC = () => {
  const { vessel } = useLabContext();

  return <div className={'vista-report'}>{vessel.id === 'fleet' ? <FleetGrid /> : <ResultsTable />}</div>;
};

export default Report;
