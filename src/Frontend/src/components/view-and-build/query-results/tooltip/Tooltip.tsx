import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import React from 'react';
import { isDataChannelQueryItem, Query } from '../../../../context/ExperimentContext';
import { Accessors } from '../../../graph/LineChart';
import { TimeSeries } from '../QueryResults';
import './Tooltip.scss';
import { DataChannelList } from 'dnv-vista-sdk';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';

interface Props {
  params: RenderTooltipParams<TimeSeries> & { accessors: Accessors<TimeSeries> };
  dataChannels: DataChannelList.DataChannel[];
  queries: Query[];
}

const Tooltip: React.FC<Props> = ({ params, dataChannels, queries }) => {
  const { tooltipData } = params;
  const item = tooltipData?.nearestDatum;

  const resolveUnitSymbols = (item: Query | DataChannelList.DataChannel): string[] => {
    if (isDataChannelQueryItem(item)) {
      if (!item.property?.unit?.unitSymbol || !item.property?.unit?.quantityName) return [];
      return [`${item.property.unit.unitSymbol} (${item.property.unit.quantityName})`];
    }
    return item.items.flatMap(i => resolveUnitSymbols(i));
  };

  let unit: string | undefined = undefined;
  const dataChannel = dataChannels.find(dc => dc.dataChannelId.localId.toString() === item?.datum.name);

  if (dataChannel) {
    unit = resolveUnitSymbols(dataChannel)[0];
  } else {
    const query = queries.find(q => q.name === item?.datum.name);
    if (query) {
      const units = resolveUnitSymbols(query);
      unit = units.length > 0 ? Array.from(new Set<string>(units)).join(' | ') : undefined;
    }
  }

  return (
    <div className={'chart-tooltip'}>
      {item?.datum.vesselId && (
        <div className={'vessel-tooltip-info'}>
          <Icon icon={IconName.Ship} />
          <p>{item.datum.vesselId}</p>
        </div>
      )}
      <p>{item?.datum.name}</p>
      <p>
        {item?.datum.value.toFixed(2)}
        {unit && <b> {unit}</b>}
      </p>
    </div>
  );
};

export default Tooltip;
