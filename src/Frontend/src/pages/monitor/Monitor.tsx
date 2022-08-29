import React from 'react';
import { Outlet } from 'react-router-dom';
import './Monitor.scss';

const Monitor: React.FC = () => {
  return (
    <div className={'vista-monitor'}>
      <Outlet />
    </div>
  );
};

export default Monitor;
