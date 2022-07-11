import React, { useCallback } from 'react';
import SearchBar from '../../components/explore/SearchBar/SearchBar';
import './Explore.scss';

const Explore: React.FC = () => {
  const handleSearchSubmit = useCallback(async (value?: string) => {
    await new Promise(res => {
      setTimeout(() => {
        console.log(value);
        res(undefined);
      }, 1000);
    });
  }, []);

  return (
    <div className={'vista-explore'}>
      <SearchBar onSubmit={handleSearchSubmit} />
    </div>
  );
};

export default Explore;
