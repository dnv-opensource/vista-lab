import { AnimatedLineSeries } from '@visx/xychart';
import React, { useEffect, useMemo, useState } from 'react';
import { AggregatedQueryResult, AggregatedTimeseries } from '../../../client';
import { useLabContext } from '../../../context/LabContext';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import { removeDuplicateDates, toLocaleTimeRangeString } from '../../../util/date';
import { isNullOrWhitespace } from '../../../util/string';
import LineChart, { Accessors, AxisFormatter } from '../../graph/LineChart';
import './QueryResults.scss';
import Tooltip from './tooltip/Tooltip';

interface Props {
  panel: Panel;
}

const FALLBACK_DATA: AggregatedQueryResult[] = [
  { id: 'Nan', name: 'Nan', timeseries: [{ timestamp: new Date(), value: 0 }], vesselId: 'fleet' },
];

export type TimeSeries = AggregatedTimeseries & {
  name: string;
  vesselId?: string;
};

const QueryResults: React.FC<Props> = ({ panel }) => {
  const [data, setData] = useState<AggregatedQueryResult[]>([]);
  const { getTimeseriesDataForPanel, timeRange } = usePanelContext();
  const { isFleet } = useLabContext();
  useEffect(() => {
    getTimeseriesDataForPanel(panel).then(setData);
  }, [panel, getTimeseriesDataForPanel, setData]);

  const dataChannels = panel.dataChannels;
  const queries = panel.queries;

  const activeTimerange = useMemo(() => panel.timeRange ?? timeRange, [panel.timeRange, timeRange]);

  const thresholdTimestamps = useMemo(() => {
    if (!panel.threshold || data.length === 0) return [];
    const timestamps = data.flatMap(d => d.timeseries.map(t => new Date(t.timestamp)));
    if (timestamps.length === 0) return [];
    return removeDuplicateDates(timestamps);
  }, [panel.threshold, data]);

  const accessors: Accessors<TimeSeries> = useMemo(
    () => ({ xAccessor: d => new Date(d.timestamp), yAccessor: d => d.value }),
    []
  );

  const axisFormatter: AxisFormatter<TimeSeries> = useMemo(() => {
    return {
      xAxis: value => {
        const v = value as Date;
        return toLocaleTimeRangeString(v, activeTimerange, 'no-NB');
      },
    };
  }, [activeTimerange]);

  const dataSet: { key: string; data: TimeSeries[] }[] =
    data.length > 0 && data.some(d => d.timeseries.length > 0)
      ? data.map(d => ({
          key: d.id,
          data: d.timeseries.map(t => ({ ...t, name: d.name, vesselId: isFleet ? d.vesselId : undefined })),
        }))
      : FALLBACK_DATA.map(d => ({
          key: d.id,
          data: d.timeseries.map(t => ({ ...t, name: d.name })),
        }));

  const bounds = useMemo(() => {
    const nums = dataSet.flatMap(d => d.data.map(dp => dp.value));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const minDiff = Math.abs(min * 0.2);
    const maxDiff = Math.abs(max * 0.2);
    const bounds = [min - minDiff, max + maxDiff];
    return bounds;
  }, [dataSet]);

  return (
    <>
      <LineChart
        className="query-result-graph"
        dataset={dataSet}
        accessors={accessors}
        topOffset={bounds[1]}
        bottomOffset={bounds[0]}
        axisFormatter={axisFormatter}
        tooltipComponent={params => <Tooltip params={params} dataChannels={dataChannels} queries={queries} />}
      >
        {dataSet?.length > 0 &&
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
