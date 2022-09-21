import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapContainer from '../../components/search/map/MapContainer';
import SearchBar from '../../components/search/search-bar/SearchBar';
import { useLabContext } from '../../context/LabContext';
import { useSearchContext } from '../../context/SearchContext';
import { isNullOrWhitespace } from '../../util/string';
import Vmod from '../shared/vmod/Vmod';
import './Search.scss';

const Search: React.FC = () => {
  const { fetchFilteredDataChannels } = useSearchContext();
  const { setDataChannelListPackages, fetchDataChannelListPackages } = useLabContext();
  const [searchParams, setSearchParam] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryParam = useMemo(() => searchParams.get('query') ?? undefined, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetchFilteredDataChannels(queryParam)
      .then(res => {
        res.forEach(dclp => {
          const channels = dclp.package.dataChannelList.dataChannel;
          const shipId = dclp.package.header.shipId;
          channels.forEach(dc => {
            dc.property.customProperties = {
              ...dc.property.customProperties,
              shipId: shipId,
            };
          });

          return channels;
        });

        setDataChannelListPackages(res);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      fetchDataChannelListPackages();
    };
  }, [queryParam, setLoading, setDataChannelListPackages, fetchFilteredDataChannels, fetchDataChannelListPackages]);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      if (!isNullOrWhitespace(value)) {
        const current = new URLSearchParams(window.location.search);
        current.set('query', value);
        setSearchParam(current);
      } else {
        const current = new URLSearchParams(window.location.search);
        current.delete('query');
        setSearchParam(current);
      }
    },
    [setSearchParam]
  );

  return (
    <div className={'vista-search'}>
      <SearchBar text={queryParam} onSubmit={handleSearchSubmit} loading={loading} />
      <MapContainer />
      <Vmod />
    </div>
  );
};

export default Search;
