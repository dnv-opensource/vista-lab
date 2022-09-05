import React, { useEffect, useRef, useState } from 'react';
import { IconName } from '../../ui/icons/icons';
import Input from '../../ui/input/Input';
import Button from '../../ui/button/Button';
import './SearchBar.scss';

interface Props {
  text?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onChangeFile: (file: File) => void;
}

const SearchBar: React.FC<Props> = ({ text, onSubmit, onChangeFile, loading }) => {
  const [searchText, setSearchText] = useState<string>();
  const dataChannelFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchText(text);
  }, [text]);

  const handleImportFileClick = () => {
    dataChannelFile.current?.click();
  };

  const handleChangeFile = (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.files) {
      event.stopPropagation();
      event.preventDefault();
      onChangeFile(event.target.files[0]);
    }
  };

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
        <Button onClick={handleImportFileClick}>+</Button>
        <input
            type={'file'}
            id="file"
            ref={dataChannelFile}
            onChange={handleChangeFile}
            style={{ display: 'none' }}
        ></input>
    </div>
  );
};

export default SearchBar;
