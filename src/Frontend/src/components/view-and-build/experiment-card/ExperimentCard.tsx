import React, { useRef, useState } from 'react';
import { Experiment } from '../../../context/ExperimentContext';
import { RoutePath } from '../../../pages/Routes';
import VesselLink from '../../shared/link/VesselLink';
import Button, { ButtonType } from '../../ui/button/Button';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import CustomLink from '../../ui/router/CustomLink';
import TextWithIcon from '../../ui/text/TextWithIcon';
import VerifyDeleteModal from './delete-modal/DeleteModal';
import './ExperimentCard.scss';
import RenameModal from './rename-modal/RenameModal';

interface Props {
  experiment: Experiment;
}

export const QueryResults = React.lazy(() => import('../query-results/QueryResults'));

const ExperimentCard: React.FC<Props> = ({ experiment }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [verifyingDelete, setVerifying] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  return (
    <div className={'experiment-card'} id={experiment.id}>
      <div ref={dropdownRef} className={'experiment-header'} onClick={() => setMenuOpen(prev => !prev)}>
        <p>{experiment.id}</p>
        <Icon icon={IconName.CaretDown} className={'experiment-dropdown-icon'} />
      </div>
      {dropdownRef.current && (
        <Dropdown
          className={'experiment-card-dropdown'}
          anchorRef={dropdownRef}
          open={menuOpen}
          setOpen={setMenuOpen}
          closeOnOutsideClick={!verifyingDelete && !renaming}
        >
          <CustomLink to={`${experiment.id}`} persistSearch>
            <TextWithIcon className={'experiment-dropdown-item'} icon={IconName.Eye}>
              View
            </TextWithIcon>
          </CustomLink>
          <TextWithIcon
            className={'experiment-dropdown-item'}
            icon={IconName.Pencil}
            onClick={() => setRenaming(true)}
          >
            Rename
          </TextWithIcon>
          <TextWithIcon
            className={'experiment-dropdown-item'}
            icon={IconName.Trash}
            onClick={() => setVerifying(true)}
          >
            Delete
          </TextWithIcon>
          <VerifyDeleteModal experiment={experiment} open={verifyingDelete} setOpen={setVerifying} />
          <RenameModal experiment={experiment} open={renaming} setOpen={setRenaming} />
        </Dropdown>
      )}
      <div className={'experiment-content-wrapper'}>
        <div className={'experiment-content'}>
          {experiment.dataChannels.length === 0 ? (
            <>
              <p className={'empty-subtitle'}>No data channels</p>
              <VesselLink to={RoutePath.Search} persistSearch>
                <Button type={ButtonType.Subtle}>Explore</Button>
              </VesselLink>
            </>
          ) : (
            <QueryResults experiment={experiment} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentCard;
