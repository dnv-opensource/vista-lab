import React from 'react';
import { useLabContext } from '../../../context/LabContext';
import { Experiment, useExperimentContext } from '../../../context/ExperimentContext';
import { RoutePath } from '../../../pages/Routes';
import DataChannelCard, { CardMode } from '../../search/data-channel-card/DataChannelCard';
import VesselLink from '../../shared/link/VesselLink';
import Button, { ButtonType } from '../../ui/button/Button';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import FlexScrollableField from '../../ui/scrollable-field/FlexScrollableField';
import './DataChannelSelection.scss';

interface Props {
  experiment: Experiment;
}

const DataChannelSelection: React.FC<Props> = ({ experiment }) => {
  const { toggleQueryItemInExperiment } = useExperimentContext();
  const { hasDataChannel, isFleet } = useLabContext();

  return (
    <>
      <p>Selected data channels</p>
      <FlexScrollableField className={'data-channel-selection'}>
        {experiment.dataChannels.length > 0 ? (
          experiment.dataChannels.map(d => {
            const localIdStr = d.dataChannelId.localId.toString();
            const isExcludedFromGraph = experiment.queryItemsExcludedFromGraph.has(localIdStr);

            return (
              <span key={localIdStr} className={'data-channel-card-wrapper'}>
                <DataChannelCard
                  dataChannel={d}
                  mode={CardMode.LegacyNameCentric}
                  extraNodes={
                    <Icon
                      icon={IconName.Eye}
                      className={isExcludedFromGraph ? 'excluded' : ''}
                      onClick={() => toggleQueryItemInExperiment(experiment.id, d)}
                    />
                  }
                  disabled={!hasDataChannel(d)}
                  withoutData={isFleet}
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
