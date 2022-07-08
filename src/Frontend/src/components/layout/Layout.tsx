import React from 'react';
import Header from '../header/Header';
import './Layout.scss';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className={'layout-background'} />
      <div className={'layout-container'}>
        <Header />
        <div className={'children-wrapper'}>{children}</div>
      </div>
    </>
  );
};

export default Layout;
