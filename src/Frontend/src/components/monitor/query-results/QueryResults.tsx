import { AnimatedGrid } from '@visx/xychart';
import React, { useEffect, useState } from 'react';
import { AggregatedQueryResult } from '../../../client';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import LineChart from '../../graph/LineChart';
import './QueryResults.scss';

interface Props {
  panel: Panel;
}

const QueryResults: React.FC<Props> = ({ panel }) => {
  const [data, setData] = useState<AggregatedQueryResult[]>();
  const { getTimeseriesDataForPanel } = usePanelContext();
  useEffect(() => {
    getTimeseriesDataForPanel(panel).then(setData);
  }, [panel, getTimeseriesDataForPanel, setData]);
  console.log(data);

  return (
    <>
      <LineChart
        className="query-result-graph"
        dataset={data ? data.map(d => ({ key: d.id, data: d.timeseries })) : []}
        accessors={{ xAccessor: d => d?.timestamp, yAccessor: d => d?.value }}
        tooltipComponent={({ tooltipData, accessors }) => <p></p>}
      >
        <AnimatedGrid columns={true} numTicks={4} />
      </LineChart>
    </>
  );
};

export default QueryResults;
