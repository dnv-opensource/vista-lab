import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import MapContainer from '../../components/explore/map/MapContainer';
import SearchBar from '../../components/explore/search-bar/SearchBar';
import { useExploreContext } from '../../context/ExploreContext';
import { isNullOrWhitespace } from '../../util/string';
import './Explore.scss';

const Explore: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels, postImportAndSimulateDataChannelFile } =
    useExploreContext();
  const [searchParams, setSearchParam] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryParam = useMemo(() => searchParams.get('query') ?? undefined, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetchFilteredDataChannels(queryParam)
      .then(res => {
        setDataChannelListPackages(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParam, setLoading, setDataChannelListPackages, fetchFilteredDataChannels]);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      if (!isNullOrWhitespace(value)) {
        const current = new URLSearchParams(window.location.search);
        current.set('query', value);
        setSearchParam(current);
      }
    },
    [setSearchParam]
  );

  return (
    <div className={'vista-explore'}>
      <SearchBar
        text={queryParam}
        onSubmit={handleSearchSubmit}
        loading={loading}
        onChangeFile={postImportAndSimulateDataChannelFile}
      />
      <MapContainer />
      <Outlet />
    </div>
  );
};

export default Explore;
