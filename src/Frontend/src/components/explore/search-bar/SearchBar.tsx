import React, { useEffect, useState } from 'react';
import { IconName } from '../../ui/icons/icons';
import Input from '../../ui/input/Input';
import './SearchBar.scss';

interface Props {
  text?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
}

const SearchBar: React.FC<Props> = ({ text, onSubmit, loading }) => {
  const [searchText, setSearchText] = useState<string>();

  useEffect(() => {
    setSearchText(text);
  }, [text]);

  return (
    <div className={'search-bar'}>
      <form
        className={'input-form'}
        onSubmit={e => {
          e.preventDefault();
          onSubmit(searchText!);
        }}
      >
        <Input
          icon={IconName.Search}
          placeholder="Search"
          value={searchText}
          onChange={e => {
            if (e === undefined) {
              onSubmit('');
              setSearchText(e);
              return;
            }
            setSearchText(e.currentTarget.value);
          }}
          loadingResult={loading}
        />
      </form>
    </div>
  );
};

export default SearchBar;
