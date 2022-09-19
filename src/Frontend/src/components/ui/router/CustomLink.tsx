import React, { useMemo } from 'react';
import { NavLink, NavLinkProps, useLocation, useMatch } from 'react-router-dom';

export interface CustomLinkProps extends NavLinkProps {
  persistSearch?: boolean;
  /**@description Matches from a the param in the current context */
  persistRestOfUrl?: boolean;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  children,
  persistRestOfUrl = false,
  persistSearch = false,
  to,
  ...restProps
}) => {
  const { search } = useLocation();
  const match = useMatch(persistRestOfUrl ? ':match/*' : '');

  const toUrl = useMemo(() => {
    if (match) {
      const restOfPath = match.params['*'];
      return `${to}/${restOfPath}`;
    }
    return to;
  }, [to, match]);

  const finalUrl = persistSearch ? `${toUrl}${search}` : toUrl;

  return (
    <NavLink {...restProps} to={finalUrl}>
      {children}
    </NavLink>
  );
};

export default CustomLink;
