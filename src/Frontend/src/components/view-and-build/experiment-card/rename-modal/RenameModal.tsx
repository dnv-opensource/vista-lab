import React, { useState } from 'react';
import { Experiment, useExperimentContext } from '../../../../context/ExperimentContext';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import Modal from '../../../ui/modal/Modal';

interface Props {
  experiment: Experiment;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RenameModal: React.FC<Props> = ({ experiment, open, setOpen }) => {
  const [value, setValue] = useState(experiment.id);
  const { renameExperiment } = useExperimentContext();
  return (
    <Modal open={open} setOpen={setOpen} title={'Rename experiment'} closeOnOutsideClick>
      <Input className={'modal-experiment-card-input'} value={value} onChange={e => e && setValue(e.target.value)} />
      <div className={'modal-submit-button-wrapper'}>
        <Button className={'modal-submit-button cancel'} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className={'modal-submit-button submit'}
          onClick={() => {
            renameExperiment(experiment.id, value);
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
