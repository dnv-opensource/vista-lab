import React, { useMemo } from 'react';
import { Link, LinkProps, useSearchParams } from 'react-router-dom';

type Props = LinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    queryKey: string | string[];
  };

const LinkWithQuery: React.FC<Props> = ({ to, queryKey, children, ...restProps }) => {
  const [searchParams] = useSearchParams();
  const queryParam = useMemo(
    () =>
      (Array.isArray(queryKey)
        ? queryKey.map(k => [k, searchParams.get(k)])
        : [[queryKey, searchParams.get(queryKey)]]
      )
        .filter(t => !!t[1])
        .map(t => [t[0] as string, t[1] as string]),
    [searchParams, queryKey]
  );

  const hasQueryParam = !!queryParam.find(q => !!q && !!q[1]);
  const newQueryParams = new URLSearchParams(queryParam);

  return (
    <Link {...restProps} to={`${to}${hasQueryParam ? `?${newQueryParams.toString()}` : ''}`}>
      {children}
    </Link>
  );
};

export default LinkWithQuery;
