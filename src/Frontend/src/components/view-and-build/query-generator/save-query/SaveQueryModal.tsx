import { LocalId, LocalIdBuilder, LocalIdParsingErrorBuilder } from 'dnv-vista-sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Query, usePanelContext } from '../../../../context/PanelContext';
import { assertTrue } from '../../../../util/general';
import { isNullOrWhitespace } from '../../../../util/string';
import Button, { ButtonType } from '../../../ui/button/Button';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import Modal from '../../../ui/modal/Modal';
import ScrollableField from '../../../ui/scrollable-field/ScrollableField';
import './SaveQueryModal.scss';

interface Props {
  panelId: string;
  query: Query;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SaveQueryModal: React.FC<Props> = ({ query, open, setOpen, panelId }) => {
  const { editQuery, saveDataChannelFromQuery } = usePanelContext();

  const [isCollapsed, setCollapsed] = useState(true);

  const [localIdStr, setLocalIdStr] = useState('');
  const [unitStr, setUnitStr] = useState('');
  const [unitNameStr, setUnitNameStr] = useState('');
  const [rangeLow, setRangeLow] = useState<number>();
  const [rangeHigh, setRangeHigh] = useState<number>();

  const [localIdErrorBuilder, setLocalIdErrorBuilder] = useState<LocalIdParsingErrorBuilder>();

  useEffect(() => {
    const errorBuilder = new LocalIdParsingErrorBuilder();

    LocalIdBuilder.tryParseAsync(localIdStr, errorBuilder).then(() => setLocalIdErrorBuilder(errorBuilder));
  }, [localIdStr, setLocalIdErrorBuilder]);

  const onTitleChange = useCallback(
    (e?: React.ChangeEvent<HTMLInputElement>) => {
      if (!e) return;
      const value = e.currentTarget.value;

      const newQuery = { ...query, name: value };
      editQuery(panelId, newQuery);
    },
    [editQuery, query, panelId]
  );

  const inputValidations = useMemo(() => {
    const hasRangeLow = !!rangeLow;
    const hasRangeHigh = !!rangeHigh;

    return {
      name: [isNullOrWhitespace(query.name) ? 'Name is empty' : undefined].filter(assertTrue) as string[],
      rangeHigh: [
        !hasRangeHigh && hasRangeLow ? 'Range high required' : undefined,
        hasRangeHigh && hasRangeLow && rangeHigh <= rangeLow ? 'Lower than Range low' : undefined,
      ].filter(assertTrue) as string[],
      rangeLow: [
        hasRangeHigh && !hasRangeLow ? 'Range low required' : undefined,
        hasRangeHigh && hasRangeLow && rangeHigh <= rangeLow ? 'Higher than Range high' : undefined,
      ].filter(assertTrue) as string[],
    };
  }, [rangeHigh, rangeLow, query.name]);

  const save = async () => {
    const errors = await localIdErrorBuilder;
    if (errors?.hasError) return;

    const localId = await LocalId.parseAsync(localIdStr);
    await saveDataChannelFromQuery(
      {
        dataChannelId: {
          localId,
          shortId: Date.now().toString(),
          nameObject: { namingRule: LocalIdBuilder.namingRule },
        },
        property: {
          dataChannelType: { type: 'Calculated' },
          format: {
            type: 'Decimal',
            restriction: {
              //TODO
            },
          },
          unit: {
            quantityName: unitNameStr,
            unitSymbol: unitStr,
          },
          name: query.name,
          range:
            rangeHigh !== undefined && rangeLow !== undefined
              ? {
                  high: rangeHigh.toString(),
                  low: rangeLow.toString(),
                }
              : undefined,
        },
      },
      query
    );
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} setOpen={setOpen} title={'Save as DataChannel'} className={'save-data-channel-modal'}>
        <div className={'save-datachannel-content'}>
          <div>
            <Input
              className={localIdErrorBuilder?.hasError ? 'has-error' : ''}
              name={'localid'}
              value={localIdStr}
              onChange={e => {
                if (!e) return setLocalIdStr('');
                setLocalIdStr(e.currentTarget.value);
              }}
              placeholder="Paste a LocalId"
            />
            {localIdErrorBuilder?.hasError && (
              <>
                {localIdErrorBuilder.errors.map(e => (
                  <p className={'error'} key={e.message}>
                    {e.message}
                  </p>
                ))}
              </>
            )}
          </div>
          <div>
            <label htmlFor="name">Name</label>
            <Input
              className={inputValidations.name.length > 0 ? 'has-error' : ''}
              name={'name'}
              value={query.name}
              onChange={onTitleChange}
              placeholder="DataChannel name"
              hideClearIcon
            />
            {inputValidations.name.length > 0 &&
              inputValidations.name.map(e => (
                <p className={'error'} key={e}>
                  {e}
                </p>
              ))}
          </div>
          <div className={'additional-properties-header'}>
            <Icon
              icon={isCollapsed ? IconName.AngleRight : IconName.AngleDown}
              className={'query-card-collapser'}
              onClick={() => setCollapsed(prev => !prev)}
            />
            <p>Additional properties</p>
          </div>
          {!isCollapsed && (
            <ScrollableField className={'additional-properties'}>
              <div>
                <label htmlFor="range">Range</label>
                <div className={'multi-selection'}>
                  <span>
                    <Input
                      className={inputValidations.rangeLow.length > 0 ? 'has-error' : ''}
                      value={rangeLow}
                      onChange={e =>
                        e && setRangeLow(+e.currentTarget.value === 0 ? undefined : +e.currentTarget.value)
                      }
                      type={'number'}
                      name={'range-low'}
                      placeholder="Set lower limit"
                      hideClearIcon
                      autoComplete="off"
                    />
                    {inputValidations.rangeLow.length > 0 &&
                      inputValidations.rangeLow.map(e => (
                        <p className={'error'} key={e}>
                          {e}
                        </p>
                      ))}
                  </span>
                  <span>
                    <Input
                      className={inputValidations.rangeHigh.length > 0 ? 'has-error' : ''}
                      value={rangeHigh}
                      onChange={e =>
                        e && setRangeHigh(+e.currentTarget.value === 0 ? undefined : +e.currentTarget.value)
                      }
                      type={'number'}
                      name={'range-high'}
                      placeholder="Set upper limit"
                      hideClearIcon
                      autoComplete="off"
                    />
                    {inputValidations.rangeHigh.length > 0 &&
                      inputValidations.rangeHigh.map(e => (
                        <p className={'error'} key={e}>
                          {e}
                        </p>
                      ))}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="unit">Unit</label>
                <div className={'multi-selection'}>
                  <Input
                    name={'unit-name'}
                    value={unitNameStr}
                    onChange={e => e && setUnitNameStr(e.currentTarget.value)}
                    placeholder="Set unit name"
                    hideClearIcon
                  />
                  <Input
                    name={'unit-symbol'}
                    value={unitStr}
                    onChange={e => e && setUnitStr(e.currentTarget.value)}
                    placeholder="Set unit symbol"
                    hideClearIcon
                  />
                </div>
              </div>
            </ScrollableField>
          )}
          <Button
            disabled={localIdErrorBuilder?.hasError || Object.values(inputValidations).some(v => v.length > 0)}
            type={ButtonType.Primary}
            className={'save-button'}
            onClick={() => save()}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SaveQueryModal;
