import { useCallback } from 'react';
import { NavigateFunction, NavigateOptions, useLocation, useMatch, useNavigate } from 'react-router-dom';

type Props = {
  persistSearch?: boolean;
  persistRestOfUrl?: boolean;
};

export const useCustomNavigate = (props?: Props) => {
  const { persistSearch = false, persistRestOfUrl = false } = props ?? {};
  const routeNavigate = useNavigate();
  const { search } = useLocation();
  const match = useMatch(persistRestOfUrl ? ':match/*' : '');

  const navigate: NavigateFunction = useCallback(
    (to, opt = undefined) => {
      if (typeof to === 'number') {
        routeNavigate(to);
        return;
      }
      const options = (opt as NavigateOptions | undefined) ?? {};

      let url = to;
      if (match) {
        const restOfPath = match.params['*'];
        url += `/${restOfPath}`;
      }

      const finalUrl = persistSearch ? `${url}${search}` : url;

      routeNavigate(finalUrl, options);
    },
    [routeNavigate, match, persistSearch, search]
  );

  return navigate;
};
