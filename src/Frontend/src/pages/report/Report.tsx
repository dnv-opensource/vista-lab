import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSearchContext } from '../../context/SearchContext';
import './Report.scss';

const Report: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useSearchContext();

  useEffect(() => {
    fetchFilteredDataChannels('').then(res => {
      setDataChannelListPackages(res);
    });
  }, [setDataChannelListPackages, fetchFilteredDataChannels]);

  return (
    <div className={'vista-report'}>
      <Outlet />
    </div>
  );
};

export default Report;
