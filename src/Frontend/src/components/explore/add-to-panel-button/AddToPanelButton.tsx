import React, { useRef, useState } from 'react';
import { DataChannelWithShipData } from '../../../context/ExploreContext';
import { usePanelContext } from '../../../context/PanelContext';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Input from '../../ui/input/Input';
import './AddToPanelButton.scss';

interface Props {
  dataChannel: DataChannelWithShipData;
}

const AddToPanelButton: React.FC<Props> = ({ dataChannel }) => {
  const { addDataChannelToPanel, panels, addPanel } = usePanelContext();
  const [open, setOpen] = useState(false);
  const [newPanelValue, setNewPanelValue] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className={'add-to-panel-wrapper'}>
      <Icon className={'add-to-panel-icon'} icon={IconName.Plus} onClick={() => setOpen(prev => !prev)} />
      {wrapperRef.current && (
        <Dropdown className={'add-panel-dropdown'} setOpen={setOpen} open={open} anchorRef={wrapperRef}>
          <p className={'add-panel-title'}>Select or add a panel</p>
          <form
            onSubmit={e => {
              e.preventDefault();

              addPanel(newPanelValue);
              setNewPanelValue('');
            }}
          >
            <Input
              value={newPanelValue}
              onChange={e => e && setNewPanelValue(e.currentTarget.value)}
              placeholder="Add new panel"
              icon={IconName.Plus}
            />
          </form>
          {panels.length === 0 ? (
            <p className={'empty-panels'}>No panels</p>
          ) : (
            panels.map(p => (
              <div
                key={p.id}
                className={'panel-list-item'}
                onClick={() => {
                  addDataChannelToPanel(p.id, dataChannel);
                  setOpen(false);
                }}
              >
                <p className={'panel-list-item-id'}>{p.id}</p>
                <p className={'panel-list-item-count'}>{p.dataChannels.length}</p>
              </div>
            ))
          )}
        </Dropdown>
      )}
    </div>
  );
};

export default AddToPanelButton;
