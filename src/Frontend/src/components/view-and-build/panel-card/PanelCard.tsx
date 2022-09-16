import React, { useRef, useState } from 'react';
import { Panel } from '../../../context/PanelContext';
import { RoutePath } from '../../../pages/Routes';
import VesselLink from '../../shared/link/VesselLink';
import Button, { ButtonType } from '../../ui/button/Button';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import CustomLink from '../../ui/router/CustomLink';
import TextWithIcon from '../../ui/text/TextWithIcon';
import VerifyDeleteModal from './delete-modal/DeleteModal';
import './PanelCard.scss';
import RenameModal from './rename-modal/RenameModal';

interface Props {
  panel: Panel;
}

export const QueryResults = React.lazy(() => import('../query-results/QueryResults'));

const PanelCard: React.FC<Props> = ({ panel }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [verifyingDelete, setVerifying] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  return (
    <div className={'panel-card'} id={panel.id}>
      <div ref={dropdownRef} className={'panel-header'} onClick={() => setMenuOpen(prev => !prev)}>
        <p>{panel.id}</p>
        <Icon icon={IconName.CaretDown} className={'panel-dropdown-icon'} />
      </div>
      {dropdownRef.current && (
        <Dropdown
          className={'panel-card-dropdown'}
          anchorRef={dropdownRef}
          open={menuOpen}
          setOpen={setMenuOpen}
          closeOnOutsideClick={!verifyingDelete && !renaming}
        >
          <CustomLink to={`${panel.id}`} persistSearch>
            <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Eye}>
              View
            </TextWithIcon>
          </CustomLink>
          <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Pencil} onClick={() => setRenaming(true)}>
            Rename
          </TextWithIcon>
          <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Trash} onClick={() => setVerifying(true)}>
            Delete
          </TextWithIcon>
          <VerifyDeleteModal panel={panel} open={verifyingDelete} setOpen={setVerifying} />
          <RenameModal panel={panel} open={renaming} setOpen={setRenaming} />
        </Dropdown>
      )}
      <div className={'panel-content-wrapper'}>
        <div className={'panel-content'}>
          {panel.dataChannels.length === 0 ? (
            <>
              <p className={'empty-subtitle'}>No data channels</p>
              <VesselLink to={RoutePath.Search} persistSearch>
                <Button type={ButtonType.Subtle}>Explore</Button>
              </VesselLink>
            </>
          ) : (
            <QueryResults panel={panel} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelCard;
