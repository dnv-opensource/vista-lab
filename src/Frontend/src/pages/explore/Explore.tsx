import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import MapContainer from '../../components/explore/map/MapContainer';
import SearchBar from '../../components/explore/search-bar/SearchBar';
import Button from '../../components/ui/button/Button';
import Input from '../../components/ui/input/Input';
import { useExploreContext } from '../../context/ExploreContext';
import { isNullOrWhitespace } from '../../util/string';
import './Explore.scss';

const Explore: React.FC = () => {
  const { setDataChannelListPackages, fetchFilteredDataChannels } = useExploreContext();
  const [searchParams, setSearchParam] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryParam = useMemo(() => searchParams.get('query') ?? undefined, [searchParams]);
  const dataChannelFile = useRef<HTMLInputElement>(null);

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

  const handleImportFileClick = () => {
    debugger;
    dataChannelFile.current?.click();
  };

  const handleChangeFile = (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.files) {
      debugger;
      event.stopPropagation();
      event.preventDefault();
      var file = event.target.files[0];
      console.log(file);
    }
  };

  return (
    <div className={'vista-explore'}>
      <SearchBar text={queryParam} onSubmit={handleSearchSubmit} loading={loading} />
      <Button onClick={handleImportFileClick}>+</Button>
      <Input type={'file'} id="file" ref={dataChannelFile} onChange={handleChangeFile}></Input>
      <MapContainer />
      <Outlet />
    </div>
  );
};

export default Explore;
