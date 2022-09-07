import React from 'react';
import { Panel } from '../../../context/PanelContext';
import DataChannelCard, { CardMode } from '../../explore/data-channel-card/DataChannelCard';
import { ButtonType } from '../../ui/button/Button';
import ButtonWithLink from '../../ui/button/ButtonWithLink';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
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
            <span key={d.Property.UniversalID.toString()} className={'data-channel-card-wrapper'}>
              <DataChannelCard
                dataChannel={d}
                key={d.Property.UniversalID.toString()}
                mode={CardMode.LegacyNameCentric}
                extraNodes={<Icon icon={IconName.Eye} />} />
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
