import React, { useState } from 'react';
import { Panel, usePanelContext } from '../../../../context/PanelContext';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import Modal from '../../../ui/modal/Modal';

interface Props {
  panel: Panel;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RenameModal: React.FC<Props> = ({ panel, open, setOpen }) => {
  const [value, setValue] = useState(panel.id);
  const { renamePanel } = usePanelContext();
  return (
    <Modal open={open} setOpen={setOpen} title={'Rename panel'} closeOnOutsideClick>
      <Input className={'modal-panel-card-input'} value={value} onChange={e => e && setValue(e.target.value)} />
      <div className={'modal-submit-button-wrapper'}>
        <Button className={'modal-submit-button cancel'} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className={'modal-submit-button submit'}
          onClick={() => {
            renamePanel(panel.id, value);
            setOpen(false);
          }}
        >
          Ok
        </Button>
      </div>
    </Modal>
  );
};

export default RenameModal;
