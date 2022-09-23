import { AnimatedLineSeries } from '@visx/xychart';
import React, { useEffect, useMemo, useState } from 'react';
import { AggregatedQueryResult, AggregatedTimeseries } from '../../../client';
import { useLabContext } from '../../../context/LabContext';
import { Experiment, useExperimentContext } from '../../../context/ExperimentContext';
import { removeDuplicateDates, toLocaleTimeRangeString } from '../../../util/date';
import { isNullOrWhitespace } from '../../../util/string';
import LineChart, { Accessors, AxisFormatter } from '../../graph/LineChart';
import './QueryResults.scss';
import Tooltip from './tooltip/Tooltip';

interface Props {
  experiment: Experiment;
}

const FALLBACK_DATA: AggregatedQueryResult[] = [
  { id: 'Nan', name: 'Nan', timeseries: [{ timestamp: new Date(), value: 0 }], vesselId: 'fleet' },
];

export type TimeSeries = AggregatedTimeseries & {
  name: string;
  vesselId?: string;
};

const QueryResults: React.FC<Props> = ({ experiment }) => {
  const [data, setData] = useState<AggregatedQueryResult[]>([]);
  const { getTimeseriesDataForExperiment, timeRange } = useExperimentContext();
  const { isFleet } = useLabContext();
  useEffect(() => {
    getTimeseriesDataForExperiment(experiment).then(setData);
  }, [experiment, getTimeseriesDataForExperiment, setData]);

  const dataChannels = experiment.dataChannels;
  const queries = experiment.queries;

  const activeTimerange = useMemo(() => experiment.timeRange ?? timeRange, [experiment.timeRange, timeRange]);

  const thresholdTimestamps = useMemo(() => {
    if (!experiment.threshold || data.length === 0) return [];
    const timestamps = data.flatMap(d => d.timeseries.map(t => new Date(t.timestamp)));
    if (timestamps.length === 0) return [];
    return removeDuplicateDates(timestamps);
  }, [experiment.threshold, data]);

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
          experiment.threshold &&
          (!isNullOrWhitespace(experiment.threshold.deviation) ? (
            <>
              <AnimatedLineSeries
                key={'Upper limit ' + experiment.threshold.name}
                dataKey={'Upper limit ' + experiment.threshold.name}
                data={thresholdTimestamps.map(t => ({
                  ...experiment.threshold!,
                  value:
                    experiment.threshold!.value! +
                    experiment.threshold!.value * (experiment.threshold!.deviation! / 100),
                  timestamp: t,
                }))}
                xAccessor={t => t.timestamp}
                yAccessor={t => t.value}
                strokeDasharray={'10'}
              />
              <AnimatedLineSeries
                key={'Lower limit ' + experiment.threshold.name}
                dataKey={'Lower limit ' + experiment.threshold.name}
                data={thresholdTimestamps.map(t => ({
                  ...experiment.threshold!,
                  value:
                    experiment.threshold!.value! -
                    experiment.threshold!.value * (experiment.threshold!.deviation! / 100),
                  timestamp: t,
                }))}
                xAccessor={t => t.timestamp}
                yAccessor={t => t.value}
                strokeDasharray={'10'}
              />
            </>
          ) : (
            <AnimatedLineSeries
              key={experiment.threshold.name}
              dataKey={experiment.threshold.name}
              data={thresholdTimestamps.map(t => ({ ...experiment.threshold!, timestamp: t }))}
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
