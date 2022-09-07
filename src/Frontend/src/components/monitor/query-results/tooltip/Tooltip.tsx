import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import React from 'react';
import { AggregatedTimeseries } from '../../../../client';
import { Accessors } from '../../../graph/LineChart';
import './Tooltip.scss';

interface Props {
  params: RenderTooltipParams<AggregatedTimeseries> & { accessors: Accessors<AggregatedTimeseries> };
}

const Tooltip: React.FC<Props> = ({ params }) => {
  const { tooltipData } = params;
  return (
    <div className={'chart-tooltip'}>
      <p>{tooltipData?.nearestDatum?.key}</p>
      <p>{tooltipData?.nearestDatum?.datum.value.toFixed(2)}</p>
    </div>
  );
};

export default Tooltip;
