import { useState } from 'react';
import { dispatch } from 'use-bus';
import useBus from 'use-bus';
import { BusEvents } from '../../shared/events';
import ButtonWithIcon from '../../ui/button/ButtonWithIcon';
import { IconName } from '../../ui/icons/icons';
import './TreeButtons.scss';

interface Props {
}

type AllNodesStatus = 'expanded' | 'collapsed' | null;
type AllDataChannelsStatus = 'expanded' | 'collapsed' | null;

const TreeButtons: React.FC<Props> = () => {
    const [allNodesStatus, setAllNodesStatus] = useState<AllNodesStatus>(null);
    const [allChannelsStatus, setAllChannelsStatus] = useState<AllDataChannelsStatus>(null);

    useBus(
        BusEvents.TreeAllNodesStatus,
        e => setAllNodesStatus(e.action as AllNodesStatus),
        [setAllNodesStatus],
    );
    useBus(
        BusEvents.TreeAllDataChannelsStatus,
        e => setAllChannelsStatus(e.action as AllDataChannelsStatus),
        [setAllChannelsStatus],
    );

    const canExpandNodes = allNodesStatus === null || allNodesStatus === 'collapsed';
    const nextForNodes = canExpandNodes ? 'expanded' : 'collapsed';
    const canExpandChannels = allChannelsStatus === null || allChannelsStatus === 'collapsed';
    const nextForChannels = canExpandChannels ? 'expanded' : 'collapsed';
    return (
        <div className={'tree-buttons'}>
            <ButtonWithIcon
                onClick={() => dispatch({ type: BusEvents.TreeAllNodesStatus, action: nextForNodes })} icon={canExpandNodes ? IconName.AnglesDown : IconName.AnglesUp}>
                {canExpandNodes ? 'Expand' : 'Collapse'} nodes
            </ButtonWithIcon>
            <ButtonWithIcon
                onClick={() => dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: nextForChannels })} icon={canExpandChannels ? IconName.AnglesDown : IconName.AnglesUp}>
                {canExpandChannels ? 'Expand' : 'Collapse'} datachannels
            </ButtonWithIcon>
        </div>
    );
}

export default TreeButtons;
