import React from 'react';
import { Outlet } from 'react-router-dom';
import './ViewAndBuild.scss';

const ViewAndBuild: React.FC = () => {
  return (
    <div className={'vista-view-and-build'}>
      <Outlet />
    </div>
  );
};

export default ViewAndBuild;
