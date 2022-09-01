import React, { useCallback, useMemo } from 'react';
import { Panel, usePanelContext } from '../../../../context/PanelContext';
import RelativeTimeRangePicker from '../../../ui/time-pickers/relative-time-range-picker/RelativeTimeRangePicker';
import { RelativeTimeRange } from '../../../ui/time-pickers/relative-time-range-picker/types';
import './TimeRangePicker.scss';

interface Props {
  panel?: Panel;
}

const TimeRangePicker: React.FC<Props> = ({ panel }) => {
  const { setTimeRange, timeRange, editPanel } = usePanelContext();

  const currentTimeRange = useMemo(() => (panel?.timeRange ? panel.timeRange : timeRange), [panel, timeRange]);
  const currentTimeRangeSetter = useCallback(
    (range: RelativeTimeRange) => {
      if (!panel) return setTimeRange(range);
      return editPanel({ ...panel!, timeRange: range });
    },
    [panel, setTimeRange, editPanel]
  );

  return (
    <div className={'time-picker-container'}>
      <RelativeTimeRangePicker onChange={currentTimeRangeSetter} timeRange={currentTimeRange} />
    </div>
  );
};

export default TimeRangePicker;
