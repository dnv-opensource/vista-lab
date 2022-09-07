import React, { useRef, useState } from 'react';
import { Panel, usePanelContext } from '../../../../context/PanelContext';
import useToast, { ToastType } from '../../../../hooks/use-toast';
import Button, { ButtonType } from '../../../ui/button/Button';
import CollapseMenu, { CollapseMenuItem } from '../../../ui/collapse-menu/CollapseMenu';
import Dropdown from '../../../ui/dropdown/Dropdown';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import './ResultEllipsisMenu.scss';

interface Props {
  panel: Panel;
}

const ResultEllipsisMenu: React.FC<Props> = ({ panel }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToast } = useToast();
  const { editPanel } = usePanelContext();
  return (
    <>
      <div className={'menu-anchor'} ref={menuRef}>
        <Icon
          className={'panel-result-menu-icon'}
          icon={IconName.EllipsisVersical}
          onClick={() => setMenuOpen(prev => !prev)}
        />
      </div>
      {menuRef && (
        <Dropdown
          open={menuOpen}
          setOpen={setMenuOpen}
          anchorRef={menuRef}
          className={'result-ellipsis-menu-container'}
        >
          <CollapseMenu>
            <CollapseMenuItem title="Sea trial">
              <div className={'sea-trial'}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    console.log('submit');
                    //@ts-ignore
                    const [{ value }, { value: deviation }] = e.target;

                    if (!value) {
                      addToast(ToastType.Warning, 'Invalid threshold', <p>Missing values</p>);
                      return;
                    }

                    editPanel({ ...panel, threshold: { name: 'Sea trial', value: +value, deviation: +deviation } });
                  }}
                >
                  <span>
                    <label>Value</label>
                    <Input type={'number'} value={panel.threshold?.value} hideClearIcon />
                  </span>
                  <span>
                    <label>Deviation %</label>
                    <Input type={'number'} value={panel.threshold?.deviation} hideClearIcon />
                  </span>
                  <button style={{ display: 'none' }} />
                </form>
                <span className={'submit-buttons'}>
                  <Button
                    type={ButtonType.Danger}
                    onClick={e => {
                      e.preventDefault();
                      editPanel({ ...panel, threshold: undefined });
                    }}
                  >
                    Remove
                  </Button>
                </span>
              </div>
            </CollapseMenuItem>
          </CollapseMenu>
        </Dropdown>
      )}
    </>
  );
};

export default ResultEllipsisMenu;
