import { GmodPath } from 'dnv-vista-sdk';
import React, { useMemo } from 'react';
import { useExploreContext } from '../../../../context/ExploreContext';
import DataChannelCard from '../../data-channel-card/DataChannelCard';

interface Props {
  path: GmodPath;
}

const GmodViewEndNode: React.FC<Props> = ({ path }) => {
  const { getLocalIdsFromGmodPath } = useExploreContext();

  const localIds = useMemo(() => {
    return getLocalIdsFromGmodPath(path);
  }, [path, getLocalIdsFromGmodPath]);

  return (
    <>
      {localIds.map(localId => (
        <DataChannelCard localId={localId} />
      ))}
    </>
  );
};

export default React.memo(GmodViewEndNode);
