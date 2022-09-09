import { useState } from 'react';
import { dispatch } from 'use-bus';
import useBus from 'use-bus';
import {
  BusEvents,
  TreeAllDataChannelsStatusEvent,
  TreeAllNodesStatus,
  TreeAllNodesStatusEvent,
} from '../../shared/events';
import ButtonWithIcon from '../../ui/button/ButtonWithIcon';
import { IconName } from '../../ui/icons/icons';
import './TreeButtons.scss';

interface Props {}

type AllDataChannelsStatus = 'expanded' | 'collapsed' | null;

const TreeButtons: React.FC<Props> = () => {
  const [allNodesStatus, setAllNodesStatus] = useState<TreeAllNodesStatus>(null);
  const [allChannelsStatus, setAllChannelsStatus] = useState<AllDataChannelsStatus>(null);

  useBus(
    BusEvents.TreeAllNodesStatus,
    e => {
      const event = e as TreeAllNodesStatusEvent;
      setAllNodesStatus(event.action);
    },
    [setAllNodesStatus]
  );
  useBus(
    BusEvents.TreeAllDataChannelsStatus,
    e => {
      const event = e as TreeAllDataChannelsStatusEvent;
      setAllChannelsStatus(event.action);
    },
    [setAllChannelsStatus]
  );

  const canExpandNodes = allNodesStatus === null || allNodesStatus === 'collapsed';
  const nextForNodes = canExpandNodes ? 'expanded' : 'collapsed';
  const canExpandChannels = allChannelsStatus === null || allChannelsStatus === 'collapsed';
  const nextForChannels = canExpandChannels ? 'expanded' : 'collapsed';
  return (
    <div className={'tree-buttons'}>
      <ButtonWithIcon
        onClick={() => dispatch({ type: BusEvents.TreeAllNodesStatus, action: nextForNodes })}
        icon={canExpandNodes ? IconName.AnglesDown : IconName.AnglesUp}
      >
        {canExpandNodes ? 'Expand' : 'Collapse'} nodes
      </ButtonWithIcon>
      <ButtonWithIcon
        onClick={() => {
          if (canExpandNodes) dispatch({ type: BusEvents.TreeAllNodesStatus, action: nextForNodes });
          setTimeout(() => dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: nextForChannels }), 0);
        }}
        icon={canExpandChannels ? IconName.AnglesDown : IconName.AnglesUp}
      >
        {canExpandChannels ? 'Expand' : 'Collapse'} datachannels
      </ButtonWithIcon>
    </div>
  );
};

export default TreeButtons;
