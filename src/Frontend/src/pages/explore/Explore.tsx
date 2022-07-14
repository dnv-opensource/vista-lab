import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/explore/SearchBar/SearchBar';
import { ExploreContextProvider } from '../../context/ExploreContext';
import { isNullOrWhitespace } from '../../util/string';
import './Explore.scss';

const Explore: React.FC = () => {
  const [searchParams, setSearchParam] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryParam = useMemo(() => searchParams.get('query') ?? undefined, [searchParams]);

  useEffect(() => {
    if (!queryParam) return;
    setLoading(true);
    // Typically where you would fetch filter from DB
    // Mabye store in context / localstorage
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [queryParam, setLoading]);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      setSearchParam(!isNullOrWhitespace(value) ? [['query', value]] : []);
    },
    [setSearchParam]
  );

  return (
    <ExploreContextProvider>
      <div className={'vista-explore'}>
        <SearchBar text={queryParam} onSubmit={handleSearchSubmit} loading={loading} />
        <Outlet />
      </div>
    </ExploreContextProvider>
  );
};

export default Explore;
