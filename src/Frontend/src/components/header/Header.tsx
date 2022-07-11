import React from 'react';
import './Header.scss';
import { Link, NavLink } from 'react-router-dom';
import { routesList } from '../../pages/Routes';
import clsx from 'clsx';
import TextWithIcon from '../ui/text/TextWithIcon';
import { IconName } from '../ui/icons/icons';

const Header: React.FC = () => {
  return (
    <div className={'header-wrapper'}>
      <Link to={'/'} className={'dnv-logo'} />
      <div className={'routes'}>
        {routesList.map(route => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => clsx('route', isActive && 'active-route')}
          >
            <TextWithIcon icon={IconName.Search}>{route.title}</TextWithIcon>
          </NavLink>
        ))}
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
