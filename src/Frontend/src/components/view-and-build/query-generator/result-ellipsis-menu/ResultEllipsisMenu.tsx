import React, { useRef, useState } from 'react';
import { Experiment, useExperimentContext } from '../../../../context/ExperimentContext';
import useToast, { ToastType } from '../../../../hooks/use-toast';
import Button, { ButtonType } from '../../../ui/button/Button';
import CollapseMenu, { CollapseMenuItem } from '../../../ui/collapse-menu/CollapseMenu';
import Dropdown from '../../../ui/dropdown/Dropdown';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import './ResultEllipsisMenu.scss';

interface Props {
  experiment: Experiment;
}

const ResultEllipsisMenu: React.FC<Props> = ({ experiment }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToast } = useToast();
  const { editExperiment } = useExperimentContext();

  const [value, setValue] = useState(experiment.threshold?.value);
  const [deviation, setDeviation] = useState(experiment.threshold?.deviation);

  return (
    <>
      <div className={'menu-anchor'} ref={menuRef}>
        <Icon
          className={'experiment-result-menu-icon'}
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

                    if (!value) {
                      addToast(ToastType.Warning, 'Invalid threshold', <p>Missing values</p>);
                      return;
                    }

                    editExperiment({
                      ...experiment,
                      threshold: { name: 'Sea trial', value: value, deviation: deviation && deviation },
                    });
                  }}
                >
                  <span>
                    <label>Value</label>
                    <Input
                      type={'number'}
                      value={value}
                      onChange={e => e && setValue(+e.currentTarget.value)}
                      hideClearIcon
                    />
                  </span>
                  <span>
                    <label>Deviation %</label>
                    <Input
                      type={'number'}
                      value={deviation}
                      onChange={e => e && setDeviation(+e.currentTarget.value)}
                      hideClearIcon
                    />
                  </span>
                  <button style={{ display: 'none' }} />
                </form>
                <span className={'submit-buttons'}>
                  <Button
                    type={ButtonType.Danger}
                    onClick={e => {
                      e.preventDefault();
                      editExperiment({ ...experiment, threshold: undefined });
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
