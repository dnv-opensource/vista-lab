import { AnimatedGrid, AnimatedAxis } from '@visx/xychart';
import React from 'react';
import { Panel } from '../../../context/PanelContext';
import LineChart from '../../graph/LineChart';
import './QueryResults.scss';

interface Props {
  panel: Panel;
}

const QueryResults: React.FC<Props> = ({ panel }) => {
  return (
    <LineChart
      dataset={panel.queries.map(q => ({
        key: q.id,
        data: Array(10)
          .fill(0)
          .map((_, i) => ({ x: '2020-01-0' + (i + 1), y: 10 + Math.random() * 5 })),
      }))}
      accessors={{ xAccessor: d => d?.x, yAccessor: d => d?.y }}
      tooltipComponent={({ tooltipData, accessors }) => (
        <p>
          {accessors.xAccessor(tooltipData?.nearestDatum?.datum)},
          {accessors.yAccessor(tooltipData?.nearestDatum?.datum)}
        </p>
      )}
    >
      <AnimatedGrid columns={true} numTicks={4} />
      <AnimatedAxis orientation="bottom" />
    </LineChart>
  );
};

export default QueryResults;
