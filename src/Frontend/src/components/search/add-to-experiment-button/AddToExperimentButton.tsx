import { DataChannelList } from 'dnv-vista-sdk';
import React, { useRef, useState } from 'react';
import { useExperimentContext } from '../../../context/ExperimentContext';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Input from '../../ui/input/Input';
import './AddToExperimentButton.scss';

interface Props {
  dataChannel: DataChannelList.DataChannel;
}

const AddToExperimentButton: React.FC<Props> = ({ dataChannel }) => {
  const { addDataChannelToExperiment, experiments, addExperiment } = useExperimentContext();
  const [open, setOpen] = useState(false);
  const [newExperimentValue, setNewExperimentValue] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className={'add-to-experiment-wrapper'}>
      <Icon className={'add-to-experiment-icon'} icon={IconName.Plus} onClick={() => setOpen(prev => !prev)} />
      {wrapperRef.current && (
        <Dropdown className={'add-experiment-dropdown'} setOpen={setOpen} open={open} anchorRef={wrapperRef}>
          <p className={'add-experiment-title'}>Select experiment</p>
          <form
            onSubmit={e => {
              e.preventDefault();

              addExperiment(newExperimentValue);
              setNewExperimentValue('');
            }}
          >
            <Input
              value={newExperimentValue}
              onChange={e => e && setNewExperimentValue(e.currentTarget.value)}
              placeholder="Add new"
              icon={IconName.Plus}
            />
          </form>
          {experiments.length === 0 ? (
            <p className={'empty-experiments'}>No experiments</p>
          ) : (
            experiments.map(p => (
              <div
                key={p.id}
                className={'experiment-list-item'}
                onClick={() => {
                  addDataChannelToExperiment(p.id, dataChannel);
                  setOpen(false);
                }}
              >
                <p className={'experiment-list-item-id'}>{p.id}</p>
                <p className={'experiment-list-item-count'}>{p.dataChannels.length}</p>
              </div>
            ))
          )}
        </Dropdown>
      )}
    </div>
  );
};

export default AddToExperimentButton;
