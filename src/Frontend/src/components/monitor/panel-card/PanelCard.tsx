import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import Dropdown from '../../ui/dropdown/Dropdown';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Modal from '../../ui/modal/Modal';
import TextWithIcon from '../../ui/text/TextWithIcon';
import './PanelCard.scss';

interface Props {
  panel: Panel;
}

const PanelCard: React.FC<Props> = ({ panel }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [verifyingDelete, setVerifying] = useState(false);
  const { deletePanel } = usePanelContext();

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
          closeOnOutsideClick={!verifyingDelete}
        >
          <Link to={`${panel.id}`}>
            <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Eye}>
              View
            </TextWithIcon>
          </Link>
          <TextWithIcon className={'panel-dropdown-item'} icon={IconName.Trash} onClick={() => setVerifying(true)}>
            Delete
          </TextWithIcon>
          <Modal open={verifyingDelete} setOpen={setVerifying} title={'Remove panel'}>
            <div className={'modal-content-wrapper'}>Are you sure you want to remove this panel?</div>
            <div className={'modal-submit-button-wrapper'}>
              <button className={'modal-submit-button cancel'} onClick={() => setVerifying(false)}>
                Cancel
              </button>
              <button
                className={'modal-submit-button submit'}
                onClick={() => {
                  deletePanel(panel.id);
                  setVerifying(false);
                }}
              >
                Yes
              </button>
            </div>
          </Modal>
        </Dropdown>
      )}
      <div className={'panel-content-wrapper'}>
        <div className={'panel-content'}>
          {panel.dataChannelIds.length === 0 ? (
            <>
              <p className={'empty-subtitle'}>No data channels</p>
              <Link to={'/explore'} className={'explore-link'} role={'button'}>
                Explore
              </Link>
            </>
          ) : (
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <iframe
              src="http://localhost:3000/d-solo/u7zyoFi4k/questdb?orgId=1&tab=transform&theme=light&panelId=2"
              frameBorder="0"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelCard;
