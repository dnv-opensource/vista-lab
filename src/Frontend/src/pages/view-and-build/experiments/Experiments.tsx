import React, { useState } from 'react';
import ExperimentCard from '../../../components/view-and-build/experiment-card/ExperimentCard';
import CombinedTimePickers from '../../../components/view-and-build/experiment-pickers/combined-time-pickers/CombinedTimePickers';
import { IconName } from '../../../components/ui/icons/icons';
import Input from '../../../components/ui/input/Input';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import { useExperimentContext } from '../../../context/ExperimentContext';
import './Experiments.scss';

const Experiments: React.FC = () => {
  const { experiments, addExperiment } = useExperimentContext();
  const [newExperimentValue, setNewExperimentValue] = useState('');

  return (
    <>
      <div className={'experiments-header-wrapper'}>
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
            placeholder="Add new experiment"
            icon={IconName.Plus}
          />
        </form>
        <CombinedTimePickers className={'time-pickers'} />
      </div>
      <ScrollableField className={'experiments-container'}>
        {experiments.map(p => (
          <ExperimentCard key={p.id} experiment={p} />
        ))}
      </ScrollableField>
    </>
  );
};

export default Experiments;
