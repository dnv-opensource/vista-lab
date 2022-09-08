import clsx from 'clsx';
import React, { useCallback, useRef, useState } from 'react';
import { ButtonType } from '../../components/ui/button/Button';
import ButtonWithLink from '../../components/ui/button/ButtonWithLink';
import useToast, { ToastType } from '../../hooks/use-toast';
import { RoutePath } from '../Routes';
import './Import.scss';

const Import: React.FC = () => {
  const dataChannelFileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File>();

  const postImportAndSimulateDataChannelFile = useCallback(
    (file: File) => {
      setFile(file);
      fetch('http://localhost:5054/api/data-channel/import-and-simulate', {
        method: 'POST',
        body: file,
      }).then(() => {
        addToast(ToastType.Success, 'Successfully imported', <p>Imported vessel {file.name}</p>);
      });
    },
    [addToast]
  );

  const handleImportFileClick = useCallback(() => {
    dataChannelFileRef.current?.click();
  }, []);

  const handleChangeFile = useCallback(
    (file?: File) => {
      if (file) {
        postImportAndSimulateDataChannelFile(file);
      }
    },
    [postImportAndSimulateDataChannelFile]
  );

  return (
    <div className={'vista-import'}>
      <div
        className={clsx('import-area', dragging && 'dragging', file && 'has-file')}
        onDragEnter={e => {
          e.stopPropagation();
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={e => {
          e.stopPropagation();
          e.preventDefault();

          setDragging(false);
        }}
        onDrop={e => {
          e.stopPropagation();
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleChangeFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
          }
          setDragging(false);
        }}
        onDragOver={e => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={handleImportFileClick}
      >
        <div className={'content'}>
          <p>Import DataChannelList</p>
          <p className={'value'}>{file ? file.name : 'Click here or drop a file'}</p>
        </div>
      </div>
      <input
        type={'file'}
        id="file"
        ref={dataChannelFileRef}
        onChange={e => {
          e.preventDefault();
          e.stopPropagation();
          handleChangeFile(e.target.files?.[0]);
        }}
      />
      {file && (
        <ButtonWithLink to={`${RoutePath.Search}`} type={ButtonType.Subtle}>
          View vessels
        </ButtonWithLink>
      )}
    </div>
  );
};

export default Import;
