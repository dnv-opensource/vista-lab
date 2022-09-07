import React from 'react';
import { Panel } from '../../../context/PanelContext';
import DataChannelCard, { CardMode } from '../../explore/data-channel-card/DataChannelCard';
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
      <p>Selected data channels</p>
      <FlexScrollableField className={'data-channel-selection'}>
        {panel.dataChannels.length > 0 ? (
          panel.dataChannels.map(d => (
            <span key={d.toString()} className={'data-channel-card-wrapper'}>
              <DataChannelCard dataChannel={d} key={d.toString()} mode={CardMode.LegacyNameCentric} />
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
