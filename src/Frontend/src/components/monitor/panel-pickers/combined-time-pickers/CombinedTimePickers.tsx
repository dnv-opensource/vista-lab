import clsx from 'clsx';
import React from 'react';
import { Panel } from '../../../../context/PanelContext';
import IntervalPicker from '../interval-picker/IntervalPicker';
import TimeRangePicker from '../time-range-picker/TimeRangePicker';
import './CombinedTimePickers.scss';

interface Props {
  panel?: Panel;
  className?: string;
}

const CombinedTimePickers: React.FC<Props> = ({ panel, className }) => {
  return (
    <div className={clsx('combined-time-pickers', className)}>
      <IntervalPicker panel={panel} />
      <TimeRangePicker panel={panel} />
    </div>
  );
};

export default CombinedTimePickers;
