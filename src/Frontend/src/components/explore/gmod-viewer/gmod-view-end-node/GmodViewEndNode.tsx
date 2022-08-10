import { GmodPath } from 'dnv-vista-sdk';
import React, { useMemo, useState } from 'react';
import { useExploreContext } from '../../../../context/ExploreContext';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import DataChannelCard from '../../data-channel-card/DataChannelCard';
import './GmodViewEndNode.scss';

interface Props {
  path: GmodPath;
}

const GmodViewEndNode: React.FC<Props> = ({ path }) => {
  const [expanded, setExpanded] = useState(false);
  const { getLocalIdsFromGmodPath } = useExploreContext();

  const localIds = useMemo(() => {
    return getLocalIdsFromGmodPath(path);
  }, [path, getLocalIdsFromGmodPath]);

  return (
    <div className={'gmod-view-end-node'}>
      {localIds.length > 0 && (
        <Icon
          className={'expand-data-channel-icon'}
          icon={expanded ? IconName.Stream : IconName.Bars}
          onClick={() => setExpanded(prev => (prev ? false : true))}
        />
      )}
      {expanded && (
        <div className={'data-channels'}>
          {localIds.map((localId, index) => (
            <DataChannelCard key={localId.toString() + index} localId={localId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(GmodViewEndNode);
