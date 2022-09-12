import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '../../../context/PanelContext';
import { RoutePath } from '../../../pages/Routes';
import { ButtonType } from '../../ui/button/Button';
import ButtonWithLink from '../../ui/button/ButtonWithLink';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import TextWithIcon from '../../ui/text/TextWithIcon';
import VerifyDeleteModal from './delete-modal/DeleteModal';
import RenameModal from './rename-modal/RenameModal';
import './PanelCard.scss';

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
          <Link to={`${panel.id}`}>
            <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Eye}>
              View
            </TextWithIcon>
          </Link>
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
              <ButtonWithLink
                linkProps={{ to: RoutePath.Search, persistRestOfUrl: true, persistSearch: true }}
                role={'button'}
                type={ButtonType.Subtle}
              >
                Search
              </ButtonWithLink>
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
