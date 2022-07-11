import React from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import './Loader.scss';

const Loader: React.FC = () => {
  return <Icon className={'ui-spinner'} icon={IconName.Spinner} />;
};

export default Loader;
