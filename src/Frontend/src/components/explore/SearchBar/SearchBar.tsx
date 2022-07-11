import React, { useState } from 'react';
import { ReactComponent as VistaBrandmark } from '../../../assets/Vista_Brandmark_COLOUR.svg';
import { IconName } from '../../ui/icons/icons';
import Input from '../../ui/input/Input';
import './SearchBar.scss';

interface Props {
  onSubmit: (value?: string) => Promise<void>;
}

const SearchBar: React.FC<Props> = ({ onSubmit }) => {
  const [searchText, setSearchText] = useState<string>();
  const [loading, setLoading] = useState(false);
  return (
    <div className={'search-bar'}>
      <VistaBrandmark className="vista-brandmark" />
      <form
        onSubmit={e => {
          e.preventDefault();
          setLoading(true);

          onSubmit(searchText).then(() => {
            setLoading(false);
          });
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
