import React from 'react';
import { Panel, usePanelContext } from '../../../../context/PanelContext';
import Button from '../../../ui/button/Button';
import Modal from '../../../ui/modal/Modal';

interface Props {
  panel: Panel;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteModal: React.FC<Props> = ({ panel, open, setOpen }) => {
  const { deletePanel } = usePanelContext();
  return (
    <Modal open={open} setOpen={setOpen} title={'Remove panel'}>
      <div className={'modal-content-wrapper'}>Are you sure you want to remove this panel?</div>
      <div className={'modal-submit-button-wrapper'}>
        <Button className={'modal-submit-button cancel'} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className={'modal-submit-button submit'}
          onClick={() => {
            deletePanel(panel.id);
            setOpen(false);
          }}
        >
          Yes
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
