import React from 'react';
import { Panel } from '../../../context/PanelContext';
import DataChannelCard from '../../explore/data-channel-card/DataChannelCard';
import { ButtonType } from '../../ui/button/Button';
import ButtonWithLink from '../../ui/button/ButtonWithLink';
import FlexScrollableField from '../../ui/scrollable-field/FlexScrollableField';
import './DataChannelSelection.scss';

interface Props {
  panel: Panel;
}

const DataChannelSelection: React.FC<Props> = ({ panel }) => {
  return (
    <>
      <p>Data channel selection</p>
      <FlexScrollableField className={'data-channel-selection'}>
        {panel.dataChannelIds.length > 0 ? (
          panel.dataChannelIds.map(d => (
            <span key={d.toString()} className={'data-channel-card-wrapper'}>
              <DataChannelCard universalId={d} key={d.toString()} />
            </span>
          ))
        ) : (
          <ButtonWithLink to="/explore" type={ButtonType.Subtle}>
            Explore
          </ButtonWithLink>
        )}
      </FlexScrollableField>
    </>
  );
};

export default DataChannelSelection;
