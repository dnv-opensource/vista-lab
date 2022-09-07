import { AnimatedLineSeries } from '@visx/xychart';
import React, { useEffect, useMemo, useState } from 'react';
import { AggregatedQueryResult } from '../../../client';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import { removeDuplicateDates } from '../../../util/date';
import { isNullOrWhitespace } from '../../../util/string';
import LineChart from '../../graph/LineChart';
import './QueryResults.scss';

interface Props {
  panel: Panel;
}

const QueryResults: React.FC<Props> = ({ panel }) => {
  const [data, setData] = useState<AggregatedQueryResult[]>([]);
  const { getTimeseriesDataForPanel, timeRange } = usePanelContext();
  useEffect(() => {
    getTimeseriesDataForPanel(panel).then(setData);
  }, [panel, getTimeseriesDataForPanel, setData]);

  const thresholdTimestamps = useMemo(() => {
    if (!panel.threshold || data.length === 0) return [];
    const timestamps = data.flatMap(d => d.timeseries.map(t => new Date(t.timestamp)));
    if (timestamps.length === 0) return [];
    return removeDuplicateDates(timestamps);
  }, [panel.threshold, data]);

  const size = useMemo(() => {
    const tr = panel.timeRange ?? timeRange;
    const maxDataPoints = Math.max(...data.map(d => d.timeseries.length), 0);
    if (maxDataPoints === 0) return undefined;

    return Math.floor(Math.abs(tr.to - tr.from) / maxDataPoints);
  }, [panel.timeRange, timeRange, data]);

  return (
    <>
      <LineChart
        className="query-result-graph"
        gridSize={size}
        dataset={data.map(d => ({ key: d.name, data: d.timeseries }))}
        accessors={{ xAccessor: d => d && new Date(d.timestamp), yAccessor: d => d?.value }}
        tooltipComponent={({ tooltipData, accessors }) => <p>{tooltipData?.nearestDatum?.datum.value}</p>}
      >
        {data?.length > 0 &&
          panel.threshold &&
          (!isNullOrWhitespace(panel.threshold.deviation) ? (
            <>
              <AnimatedLineSeries
                key={'Upper limit ' + panel.threshold.name}
                dataKey={'Upper limit ' + panel.threshold.name}
                data={thresholdTimestamps.map(t => ({
                  ...panel.threshold!,
                  value: panel.threshold!.value! + panel.threshold!.value * (panel.threshold!.deviation! / 100),
                  timestamp: t,
                }))}
                xAccessor={t => t.timestamp}
                yAccessor={t => t.value}
                strokeDasharray={'10'}
              />
              <AnimatedLineSeries
                key={'Lower limit ' + panel.threshold.name}
                dataKey={'Lower limit ' + panel.threshold.name}
                data={thresholdTimestamps.map(t => ({
                  ...panel.threshold!,
                  value: panel.threshold!.value! - panel.threshold!.value * (panel.threshold!.deviation! / 100),
                  timestamp: t,
                }))}
                xAccessor={t => t.timestamp}
                yAccessor={t => t.value}
                strokeDasharray={'10'}
              />
            </>
          ) : (
            <AnimatedLineSeries
              key={panel.threshold.name}
              dataKey={panel.threshold.name}
              data={thresholdTimestamps.map(t => ({ ...panel.threshold!, timestamp: t }))}
              xAccessor={t => t.timestamp}
              yAccessor={t => t.value}
              strokeDasharray={'10'}
            />
          ))}
      </LineChart>
    </>
  );
};

export default QueryResults;
