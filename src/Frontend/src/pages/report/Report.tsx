import { UniversalId } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { VistaLabApi } from '../../apiConfig';
import { PanelQueryDto, QueryOperator, TimeRange } from '../../client';
import { useExploreContext } from '../../context/ExploreContext';
import './Report.scss';
import ResultsTable from './results-table/ResultsTable';

const Report: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useExploreContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFilteredDataChannels('')
      .then(res => {
        setDataChannelListPackages(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setLoading, setDataChannelListPackages, fetchFilteredDataChannels]);

  return (
    <div className={'vista-report'}>
      <Outlet />
    </div>
  );
};

export default Report;
