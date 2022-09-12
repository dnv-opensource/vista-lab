import clsx from 'clsx';
import React from 'react';
import './Button.scss';

export enum ButtonType {
  Primary = 'primary',
  Subtle = 'subtle',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Plain = 'plain',
}

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ type, children, className, ...restProps }, ref) => {
  return (
    <button {...restProps} className={clsx('ui-button', className, type)} ref={ref}>
      {children}
    </button>
  );
});

export default Button;
