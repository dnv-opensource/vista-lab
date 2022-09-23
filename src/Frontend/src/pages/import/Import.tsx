import clsx from 'clsx';
import React, { useCallback, useRef, useState } from 'react';
import { VistaLabApi } from '../../apiConfig';
import Button, { ButtonType } from '../../components/ui/button/Button';
import ButtonWithLink from '../../components/ui/button/ButtonWithLink';
import useToast, { ToastType } from '../../hooks/use-toast';
import { RoutePath } from '../Routes';
import './Import.scss';

const Import: React.FC = () => {
  const dataChannelFileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File>();
  const [fileUploaded, setFileUploaded] = useState(false);

  const postImportAndSimulateDataChannelFile = useCallback(
    (file: File) => {
      VistaLabApi.dataChannelPostImportFileAndSimulate({ fileName: file.name, data: file }).then(() => {
        addToast(ToastType.Success, 'Successfully imported', <p>Imported vessel {file.name}</p>);
        setFileUploaded(true);
      });
    },
    [addToast]
  );

  const handleImportFileClick = useCallback(() => {
    dataChannelFileRef.current?.click();
  }, []);

  const handleChangeFile = useCallback((file?: File) => {
    if (file) {
      setFile(file);
    }
  }, []);

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
      {fileUploaded ? (
        <ButtonWithLink
          linkProps={{ to: RoutePath.Search, persistRestOfUrl: true, persistSearch: true }}
          type={ButtonType.Subtle}
        >
          View vessels
        </ButtonWithLink>
      ) : (
        <Button
          disabled={!file}
          type={ButtonType.Subtle}
          onClick={() => file && postImportAndSimulateDataChannelFile(file)}
        >
          Import
        </Button>
      )}
    </div>
  );
};

export default Import;
