import React, { useCallback } from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import Text from './Text';
import './Text.scss';

interface Props {
  iconLast?: boolean;
  icon: IconName;
}

const TextWithIcon: React.FC<React.PropsWithChildren<Props>> = ({ children, iconLast, icon }) => {
  const renderIcon = useCallback(() => {
    const childComp = <Text>{children}</Text>;
    switch (iconLast) {
      case true:
        return (
          <>
            {childComp}
            <Icon icon={icon} className={'icon-right'} />
          </>
        );
      default:
        return (
          <>
            <Icon icon={icon} className={'icon-left'} />
            {childComp}
          </>
        );
    }
  }, [iconLast, children, icon]);

  return <div className={'ui-text-with-icon-wrapper'}>{renderIcon()}</div>;
};

export default TextWithIcon;
