import React, { useState } from 'react';
import PanelCard from '../../../components/view-and-build/panel-card/PanelCard';
import CombinedTimePickers from '../../../components/view-and-build/panel-pickers/combined-time-pickers/CombinedTimePickers';
import { IconName } from '../../../components/ui/icons/icons';
import Input from '../../../components/ui/input/Input';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import { usePanelContext } from '../../../context/PanelContext';
import './Panels.scss';

const Panels: React.FC = () => {
  const { panels, addPanel } = usePanelContext();
  const [newPanelValue, setNewPanelValue] = useState('');

  return (
    <>
      <div className={'panels-header-wrapper'}>
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
        <CombinedTimePickers className={'time-pickers'} />
      </div>
      <ScrollableField className={'panels-container'}>
        {panels.map(p => (
          <PanelCard key={p.id} panel={p} />
        ))}
      </ScrollableField>
    </>
  );
};

export default Panels;
