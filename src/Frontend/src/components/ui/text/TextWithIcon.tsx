import clsx from 'clsx';
import React, { useCallback } from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import Text from './Text';
import './Text.scss';

interface Props {
  className?: string;
  iconClassName?: string;
  iconLast?: boolean;
  icon: IconName;
}

const TextWithIcon: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  iconLast,
  icon,
  iconClassName,
  className,
}) => {
  const renderIcon = useCallback(() => {
    const childComp = <Text>{children}</Text>;
    switch (iconLast) {
      case true:
        return (
          <>
            {childComp}
            <Icon icon={icon} className={clsx('icon-right', iconClassName)} />
          </>
        );
      default:
        return (
          <>
            <Icon icon={icon} className={clsx('icon-left', iconClassName)} />
            {childComp}
          </>
        );
    }
  }, [iconLast, children, icon, iconClassName]);

  return <div className={clsx('ui-text-with-icon-wrapper', className)}>{renderIcon()}</div>;
};

export default TextWithIcon;
