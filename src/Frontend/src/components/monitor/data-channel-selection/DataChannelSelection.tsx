import React from 'react';
import { Panel } from '../../../context/PanelContext';
import DataChannelCard from '../../explore/data-channel-card/DataChannelCard';
import ScrollableField from '../../ui/scrollable-field/ScrollableField';
import './DataChannelSelection.scss';

interface Props {
  panel: Panel;
}

const DataChannelSelection: React.FC<Props> = ({ panel }) => {
  return (
    <>
      <p>Data channel selection</p>
      <ScrollableField className={'data-channel-selection'}>
        {panel.dataChannelIds.map(d => (
          <span key={d.toString()} className={'data-channel-card-wrapper'}>
            <DataChannelCard universalId={d} key={d.toString()} />
          </span>
        ))}
      </ScrollableField>
    </>
  );
};

export default DataChannelSelection;
