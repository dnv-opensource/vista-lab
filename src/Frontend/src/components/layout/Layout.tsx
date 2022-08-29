import React from 'react';
import Header from '../header/Header';
import './Layout.scss';
import { ReactComponent as VistaBrandmark } from '../../assets/Vista_Brandmark_COLOUR.svg';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className={'layout-background'} />
      <div className={'layout-container'}>
        <Header />
        <div className={'children-wrapper'}>
          <div className={'children-container'}>
            <VistaBrandmark className={'vista-brandmark'} />
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
