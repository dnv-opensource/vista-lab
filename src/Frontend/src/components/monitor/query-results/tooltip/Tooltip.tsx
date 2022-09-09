import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import React from 'react';
import { DataChannelWithShipData } from '../../../../context/SearchContext';
import { isDataChannelQueryItem, Query } from '../../../../context/PanelContext';
import { Accessors } from '../../../graph/LineChart';
import { TimeSeries } from '../QueryResults';
import './Tooltip.scss';

interface Props {
  params: RenderTooltipParams<TimeSeries> & { accessors: Accessors<TimeSeries> };
  dataChannels: DataChannelWithShipData[];
  queries: Query[];
}

const Tooltip: React.FC<Props> = ({ params, dataChannels, queries }) => {
  const { tooltipData } = params;
  const item = tooltipData?.nearestDatum;

  const resolveUnitSymbols = (item: Query | DataChannelWithShipData): string[] => {
    if (isDataChannelQueryItem(item)) {
      if (!item.Property?.Unit?.UnitSymbol || !item.Property?.Unit?.QuantityName) return [];
      return [`${item.Property.Unit.UnitSymbol} (${item.Property.Unit.QuantityName})`];
    }
    return item.items.flatMap(i => resolveUnitSymbols(i));
  };

  let unit: string | undefined = undefined;
  const dataChannel = dataChannels.find(dc => dc.Property.UniversalID.toString() === item?.key);
  if (dataChannel) {
    unit = resolveUnitSymbols(dataChannel)[0];
  } else {
    const query = queries.find(q => q.name === item?.key);
    if (query) {
      const units = resolveUnitSymbols(query);
      unit = units.length > 0 ? Array.from(new Set<string>(units)).join(' | ') : undefined;
    }
  }

  return (
    <div className={'chart-tooltip'}>
      <p>{item?.key}</p>
      <p>
        {item?.datum.value.toFixed(2)}
        {unit && <b> {unit}</b>}
      </p>
    </div>
  );
};

export default Tooltip;
