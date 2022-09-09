import { LocalIdBuilder, UniversalIdBuilder } from 'dnv-vista-sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import MapContainer from '../../components/search/map/MapContainer';
import SearchBar from '../../components/search/search-bar/SearchBar';
import { DataChannelWithShipData, useSearchContext } from '../../context/SearchContext';
import { useVISContext } from '../../context/VISContext';
import { isNullOrWhitespace, getImoNumberFromString } from '../../util/string';
import './Search.scss';

const Search: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useSearchContext();
  const [searchParams, setSearchParam] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryParam = useMemo(() => searchParams.get('query') ?? undefined, [searchParams]);

  const { visVersion, gmod, codebooks } = useVISContext();

  useEffect(() => {
    setLoading(true);
    if (!gmod || !codebooks) return;
    fetchFilteredDataChannels(queryParam)
      .then(res => {
        res.forEach(dclp => {
          const channels = dclp.Package.DataChannelList.DataChannel;
          const shipId = dclp.Package.Header.ShipID;
          channels.forEach(dc => {
            const channel = dc as DataChannelWithShipData;
            channel.Property.ShipID = shipId;
            channel.Property.UniversalID = UniversalIdBuilder.create(visVersion)
              .withLocalId(LocalIdBuilder.parse(dc.DataChannelID.LocalID, gmod, codebooks))
              .withImoNumber(getImoNumberFromString(shipId))
              .build();
          });
          return channels;
        });

        setDataChannelListPackages(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParam, setLoading, setDataChannelListPackages, fetchFilteredDataChannels, visVersion, gmod, codebooks]);

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
      <Outlet />
    </div>
  );
};

export default Search;
