import React from 'react';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import { RoutePath } from '../../../pages/Routes';
import DataChannelCard, { CardMode } from '../../search/data-channel-card/DataChannelCard';
import VesselLink from '../../shared/link/VesselLink';
import Button, { ButtonType } from '../../ui/button/Button';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import FlexScrollableField from '../../ui/scrollable-field/FlexScrollableField';
import './DataChannelSelection.scss';

interface Props {
  panel: Panel;
}

const DataChannelSelection: React.FC<Props> = ({ panel }) => {
  const { toggleQueryItemInPanel } = usePanelContext();

  return (
    <>
      <p>Selected data channels</p>
      <FlexScrollableField className={'data-channel-selection'}>
        {panel.dataChannels.length > 0 ? (
          panel.dataChannels.map(d => {
            const isExcludedFromGraph = panel.queryItemsExcludedFromGraph.has(d.Property.UniversalID.toString());

            return (
              <span key={d.Property.UniversalID.toString()} className={'data-channel-card-wrapper'}>
                <DataChannelCard
                  dataChannel={d}
                  key={d.Property.UniversalID.toString()}
                  mode={CardMode.LegacyNameCentric}
                  extraNodes={
                    <Icon
                      icon={IconName.Eye}
                      className={isExcludedFromGraph ? 'excluded' : ''}
                      onClick={() => toggleQueryItemInPanel(panel.id, d)}
                    />
                  }
                />
              </span>
            );
          })
        ) : (
          <VesselLink to={RoutePath.Search} persistSearch>
            <Button type={ButtonType.Subtle}>Explore</Button>
          </VesselLink>
        )}
      </FlexScrollableField>
    </>
  );
};

export default DataChannelSelection;
