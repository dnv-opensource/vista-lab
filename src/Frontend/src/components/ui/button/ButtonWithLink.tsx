import React from 'react';
import CustomLink, { CustomLinkProps } from '../router/CustomLink';
import Button, { ButtonProps } from './Button';

interface Props extends ButtonProps {
  linkProps: CustomLinkProps;
}

const ButtonWithLink: React.FC<Props> = ({ linkProps, children, ...rest }) => {
  return (
    <CustomLink {...linkProps}>
      <Button {...rest}>{children}</Button>
    </CustomLink>
  );
};

export default ButtonWithLink;
