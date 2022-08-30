import React from 'react';
import { Link } from 'react-router-dom';
import Button, { ButtonProps } from './Button';

interface Props extends ButtonProps {
  to: string;
}

const ButtonWithLink: React.FC<Props> = ({ to, children, ...rest }) => {
  return (
    <Link to={to}>
      <Button {...rest}>{children}</Button>
    </Link>
  );
};

export default ButtonWithLink;
