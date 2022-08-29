import clsx from 'clsx';
import React from 'react';
import './Button.scss';

export enum ButtonType {
  Primary = 'primary',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
}

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType;
}

const Button: React.FC<ButtonProps> = ({ type, children, className, ...restProps }) => {
  return (
    <button {...restProps} className={clsx('ui-button', className, type)}>
      {children}
    </button>
  );
};

export default Button;
