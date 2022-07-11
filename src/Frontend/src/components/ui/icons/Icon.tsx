import clsx from 'clsx';
import React, { useRef } from 'react';
import { IconName, IconVariant } from './icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Icon.scss';

interface Props {
  icon: IconName;
  variant?: IconVariant;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

const Icon: React.FC<Props> = ({ icon, variant = IconVariant.Solid, className, onClick }) => {
  const iconRef = useRef<SVGSVGElement>(null);
  return (
    <FontAwesomeIcon
      id="ui-icon-component"
      ref={iconRef}
      className={clsx('ui-icon', onClick && 'clickable', className)}
      //@ts-ignore
      icon={`fa-${variant} fa-${icon}`}
      onClick={e => {
        onClick?.(e);
      }}
      tabIndex={onClick && 0}
      onKeyUp={e => {
        switch (e.code) {
          case 'Space':
          case 'Enter':
            // @ts-ignore
            onClick?.(e);
            break;
        }
      }}
    />
  );
};

export default Icon;
