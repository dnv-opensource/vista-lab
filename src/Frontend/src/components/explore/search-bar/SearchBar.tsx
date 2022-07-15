import React, { useEffect, useState } from 'react';
import { ReactComponent as VistaBrandmark } from '../../../assets/Vista_Brandmark_COLOUR.svg';
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
      <VistaBrandmark className="vista-brandmark" />
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
          onChange={e => setSearchText(e.currentTarget.value)}
          loadingResult={loading}
        />
      </form>
    </div>
  );
};

export default SearchBar;
