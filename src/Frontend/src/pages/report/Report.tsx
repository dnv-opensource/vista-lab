import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useExploreContext } from '../../context/ExploreContext';
import './Report.scss';

const Report: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useExploreContext();

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
