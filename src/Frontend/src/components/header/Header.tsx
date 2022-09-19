import clsx from 'clsx';
import React from 'react';
import { useLabContext } from '../../context/LabContext';
import { routesList } from '../../pages/Routes';
import CustomLink from '../ui/router/CustomLink';
import TextWithIcon from '../ui/text/TextWithIcon';
import VesselSelector from '../vessel-selector/VesselSelector';
import './Header.scss';

const Header: React.FC = () => {
  const { vessel } = useLabContext();
  return (
    <div className={'header-wrapper'}>
      <CustomLink persistSearch to={`/${vessel.id}`} className={'dnv-logo'} />
      <div className={'routes'}>
        {routesList.map(route => (
          <CustomLink
            persistSearch
            key={route.path}
            to={route.path}
            className={({ isActive }) => clsx('route', isActive && 'active-route')}
          >
            <TextWithIcon icon={route.icon} iconClassName="route-icon">
              {route.title}
            </TextWithIcon>
          </CustomLink>
        ))}
      </div>
      <div className={'vessel-selector-wrapper'}>
        <VesselSelector />
      </div>
      <div className={'vista-info'}>
        <p className={'vista-logo'}>VISTA</p>
        <a className={'vista-help'} href={'https://vista.dnv.com/docs'} target="_blank" rel="noreferrer">
          Help
        </a>
      </div>
    </div>
  );
};

export default Header;
