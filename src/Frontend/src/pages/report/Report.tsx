import React, { useEffect } from 'react';
import { useLabContext } from '../../context/LabContext';
import { useSearchContext } from '../../context/SearchContext';
import FleetGrid from '../shared/fleet/Fleet';
import './Report.scss';
import ResultsTable from './results-table/ResultsTable';

const Report: React.FC = () => {
  const { vessel } = useLabContext();
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useSearchContext();

  useEffect(() => {
    fetchFilteredDataChannels('').then(res => {
      setDataChannelListPackages(res);
    });
  }, [setDataChannelListPackages, fetchFilteredDataChannels]);

  return <div className={'vista-report'}>{vessel.id === 'fleet' ? <FleetGrid /> : <ResultsTable />}</div>;
};

export default Report;
