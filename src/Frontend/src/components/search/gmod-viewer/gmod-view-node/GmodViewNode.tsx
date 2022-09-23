import clsx from 'clsx';
import { GmodNode, GmodPath, ShipId } from 'dnv-vista-sdk';
import React, { useMemo } from 'react';
import { useLabContext } from '../../../../context/LabContext';
import { useSearchContext } from '../../../../context/SearchContext';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import AddToExperimentButton from '../../add-to-experiment-button/AddToExperimentButton';
import DataChannelCard, { CardMode } from '../../data-channel-card/DataChannelCard';
import { GmodViewerNodeExtra } from '../GmodViewer';
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
  extra: GmodViewerNodeExtra;
}

const GmodViewNode: React.FC<Props> = ({ node, mergedChild, skippedParent, parents, path: initPath, extra }) => {
  const { isFleet, vessel } = useLabContext();
  const path = useMemo(
    () => (mergedChild ? new GmodPath(parents.concat(node), mergedChild) : initPath),
    [initPath, mergedChild, parents, node]
  );

  const { getDataChannelsFromGmodPath } = useSearchContext();

  const dataChannels = useMemo(() => {
    return getDataChannelsFromGmodPath(path, isFleet ? undefined : vessel.id);
  }, [path, getDataChannelsFromGmodPath, vessel, isFleet]);

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

  const expanded = extra.isExpanded(node);

  return (
    <div className={'gmod-view-node-container'}>
      {dataChannels.length > 0 && (
        <Icon
          className={'expand-data-channel-icon'}
          icon={expanded ? IconName.Stream : IconName.Bars}
          onClick={() => extra.setExpanded(node)}
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

      <div className={`data-channels-container ${dataChannels.length === 0 ? 'empty' : ''}`}>
        {expanded && (
          <div className={`data-channels ${dataChannels.length === 0 ? 'empty' : ''}`}>
            {dataChannels.map((dc, index) => (
              <div key={index} className={'data-channel-card-wrapper'}>
                <DataChannelCard
                  dataChannel={dc}
                  shipId={dc.property.customProperties?.shipId as ShipId}
                  mode={CardMode.LegacyNameCentric}
                  extraNodes={<AddToExperimentButton dataChannel={dc} />}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(GmodViewNode);
