import clsx from 'clsx';
import React from 'react';
import { IconName, IconVariant } from './icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: IconName;
  variant?: IconVariant;
  className?: string;
}

const Icon: React.FC<Props> = ({ icon, variant = IconVariant.Solid, className }) => {
  //@ts-ignore
  return <FontAwesomeIcon className={clsx('ui-icon', className)} icon={`fa-${variant} fa-${icon}`} />;
};

export default Icon;
