import React from 'react';
import { Experiment, useExperimentContext } from '../../../../context/ExperimentContext';
import Button from '../../../ui/button/Button';
import Modal from '../../../ui/modal/Modal';

interface Props {
  experiment: Experiment;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteModal: React.FC<Props> = ({ experiment, open, setOpen }) => {
  const { deleteExperiment } = useExperimentContext();
  return (
    <Modal open={open} setOpen={setOpen} title={'Remove experiment'}>
      <div className={'modal-content-wrapper'}>Are you sure you want to remove this experiment?</div>
      <div className={'modal-submit-button-wrapper'}>
        <Button className={'modal-submit-button cancel'} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className={'modal-submit-button submit'}
          onClick={() => {
            deleteExperiment(experiment.id);
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
