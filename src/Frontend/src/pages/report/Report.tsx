import React from 'react';
import { Outlet } from 'react-router-dom';
import './Report.scss';

const Report: React.FC = () => {
  return (
    <div className={'vista-report'}>
      <Outlet />
    </div>
  );
};

export default Report;
