import { CodebookName, GmodPath } from 'dnv-vista-sdk';
import React, { useMemo } from 'react';
import { useExploreContext } from '../../../../context/ExploreContext';
import { capitalize } from '../../../../util/string';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import StatusIcon, { StatusVariant } from '../../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../../ui/text/TextWithIcon';
import './GmodViewEndNode.scss';

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
        <div className={'gmod-view-end-node-card'}>
          <div className={'end-node-card-header'}>
            <Icon icon={IconName.RSS} />
            <StatusIcon variant={StatusVariant.Good} />
          </div>
          {localId.builder.metadataTags.map(meta => (
            <div className={'local-id-item'}>
              <TextWithIcon className={'codebook-name'} icon={IconName.Tag}>
                {CodebookName[meta.name]}
              </TextWithIcon>
              <span className={'codebook-value'}>{capitalize(meta.value)}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default React.memo(GmodViewEndNode);
