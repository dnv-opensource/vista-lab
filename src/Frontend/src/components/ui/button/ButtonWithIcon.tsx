import clsx from 'clsx';
import React from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import Button, { ButtonProps } from './Button';
import './Button.scss';

interface Props extends ButtonProps {
  icon: IconName;
  iconLast?: boolean;
}

const ButtonWithIcon = React.forwardRef<HTMLButtonElement, Props>(
  ({ icon, iconLast, children, className, ...restProps }, ref) => {
    const iconComp = <Icon icon={icon} className={'ui-button-icon'} />;
    return (
      <Button {...restProps} className={clsx('ui-button-with-icon', className)} ref={ref}>
        {!iconLast && iconComp}
        <span className={'ui-button-children-wrapper'}>{children}</span>
        {iconLast && iconComp}
      </Button>
    );
  }
);

export default ButtonWithIcon;
