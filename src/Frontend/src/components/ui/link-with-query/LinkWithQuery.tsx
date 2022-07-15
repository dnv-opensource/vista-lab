import React, { useMemo } from 'react';
import { Link, LinkProps, useSearchParams } from 'react-router-dom';

type Props = LinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    queryKey: string;
  };

const LinkWithQuery: React.FC<Props> = ({ to, queryKey, children, ...restProps }) => {
  const [searchParams] = useSearchParams();
  const queryParam = useMemo(() => searchParams.get(queryKey), [searchParams, queryKey]);

  return (
    <Link {...restProps} to={`${to}${queryParam ? `?${queryKey}=${queryParam}` : ''}`}>
      {children}
    </Link>
  );
};

export default LinkWithQuery;
