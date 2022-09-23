import clsx from 'clsx';
import React from 'react';
import { Experiment } from '../../../../context/ExperimentContext';
import IntervalPicker from '../interval-picker/IntervalPicker';
import TimeRangePicker from '../time-range-picker/TimeRangePicker';
import './CombinedTimePickers.scss';

interface Props {
  experiment?: Experiment;
  className?: string;
}

const CombinedTimePickers: React.FC<Props> = ({ experiment, className }) => {
  return (
    <div className={clsx('combined-time-pickers', className)}>
      <IntervalPicker experiment={experiment} />
      <TimeRangePicker experiment={experiment} />
    </div>
  );
};

export default CombinedTimePickers;
