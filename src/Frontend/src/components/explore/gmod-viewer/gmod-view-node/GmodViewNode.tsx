import clsx from 'clsx';
import { GmodNode, GmodPath, UniversalId } from 'dnv-vista-sdk';
import React, { useMemo, useState } from 'react';
import useBus from 'use-bus';
import { useExploreContext } from '../../../../context/ExploreContext';
import { BusEvents } from '../../../shared/events';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import AddToPanelButton from '../../add-to-panel-button/AddToPanelButton';
import DataChannelCard from '../../data-channel-card/DataChannelCard';
import './GmodViewNode.scss';

export const getBadgeClassNameByNode = (node: GmodNode) => {
  return `${node.metadata.category.toLowerCase().replace(/ /g, '-')}-${node.metadata.type.toLowerCase()}`;
};

interface Props {
  node: GmodNode;
  parents: GmodNode[];
  path: GmodPath;
  mergedChild?: GmodNode;
  skippedParent?: GmodNode;
}

type AllDataChannelsStatus = 'expanded' | 'collapsed' | null;

const GmodViewNode: React.FC<Props> = ({ node, mergedChild, skippedParent, parents, path: initPath }) => {
  const path = useMemo(
    () => (mergedChild ? new GmodPath(parents.concat(node), mergedChild) : initPath),
    [initPath, mergedChild, parents, node]
  );

  const [expanded, setExpanded] = useState(false);
  const { getUniversalIdsFromGmodPath: getLocalIdsFromGmodPath } = useExploreContext();

  useBus(
        BusEvents.TreeAllDataChannelsStatus,
        e => {
            const next = e.action as AllDataChannelsStatus;
            if (next === 'expanded' && !expanded) {
                setExpanded(true);
            }
            else if (next === 'collapsed' && expanded) {
                setExpanded(false);
            }
        },
        [expanded, setExpanded],
    );

  const universalIds = useMemo(() => {
    return getLocalIdsFromGmodPath(path);
  }, [path, getLocalIdsFromGmodPath]);

  const items = useMemo(() => {
    const items: { node: GmodNode; parents: GmodNode[] }[] = [];

    // Order matters here
    if (skippedParent) {
      items.push({ node: parents[parents.length - 2], parents: parents.slice(0, parents.length - 3) });
    }
    items.push({ node, parents });
    if (mergedChild) {
      items.push({ node: mergedChild, parents: parents.concat(node) });
    }

    return items;
  }, [node, parents, mergedChild, skippedParent]);

  return (
    <div className={'gmod-view-node-container'}>
      {universalIds.length > 0 && (
        <Icon
          className={'expand-data-channel-icon'}
          icon={expanded ? IconName.Stream : IconName.Bars}
          onClick={() => setExpanded(prev => (prev ? false : true))}
        />
      )}
      <span className={clsx('gmod-badge')}>
        {items.map(({ node, parents }) => {
          const cls = getBadgeClassNameByNode(node);

          let pathStr = node.code;

          return (
            <span key={node.code + parents[0].code} className={clsx('badge-item', cls)}>
              {pathStr}
            </span>
          );
        })}
        {node.location && (
          <span key={'location' + node.location + path.node.code} className={clsx('badge-item', 'location')}>
            {node.location}
          </span>
        )}
      </span>
      <span className={clsx('gmod-tree-view-name')}>{path.getCurrentCommonName()}</span>

      <div className={'data-channels-container'}>
        {expanded && (
          <div className={'data-channels'}>
            {universalIds.map((universalId, index) => (
              <div key={index} className={'data-channel-card-wrapper'}>
                <DataChannelCard universalId={universalId} />
                <AddToPanelButton universalId={universalId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(GmodViewNode);
