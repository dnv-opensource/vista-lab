import React, { useCallback, useMemo } from 'react';
import { Experiment, useExperimentContext } from '../../../../context/ExperimentContext';
import RelativeTimeRangePicker from '../../../ui/time-pickers/relative-time-range-picker/RelativeTimeRangePicker';
import { RelativeTimeRange } from '../../../ui/time-pickers/relative-time-range-picker/types';
import './TimeRangePicker.scss';

interface Props {
  experiment?: Experiment;
}

const TimeRangePicker: React.FC<Props> = ({ experiment }) => {
  const { setTimeRange, timeRange, editExperiment } = useExperimentContext();

  const currentTimeRange = useMemo(
    () => (experiment?.timeRange ? experiment.timeRange : timeRange),
    [experiment, timeRange]
  );
  const currentTimeRangeSetter = useCallback(
    (range: RelativeTimeRange) => {
      if (!experiment) return setTimeRange(range);
      return editExperiment({ ...experiment!, timeRange: range });
    },
    [experiment, setTimeRange, editExperiment]
  );

  return (
    <div className={'time-picker-container'}>
      <RelativeTimeRangePicker onChange={currentTimeRangeSetter} timeRange={currentTimeRange} />
    </div>
  );
};

export default TimeRangePicker;
