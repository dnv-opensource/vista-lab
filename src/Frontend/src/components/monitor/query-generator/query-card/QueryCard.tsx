import { UniversalId } from 'dnv-vista-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { Panel, Query, usePanelContext } from '../../../../context/PanelContext';
import useToast, { ToastType } from '../../../../hooks/use-toast';
import { isNullOrWhitespace } from '../../../../util/string';
import Button from '../../../ui/button/Button';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import RelativeTimeRangePicker from '../../../ui/time-pickers/relative-time-range-picker/RelativeTimeRangePicker';
import Typeahead, { TypeaheadOption } from '../../../ui/typeahead/Typeahead';
import OperatorSelection, { Operator } from '../operator-selection/OperatorSelection';
import './QueryCard.scss';

interface Props {
  query: Query;
  panel: Panel;
}

const QueryCard: React.FC<Props> = ({ query, panel }) => {
  const { addToast } = useToast();
  const { removeQueryFromPanel, editQuery, selectQueryItem, selectQueryOperator } = usePanelContext();

  const [isCollapsed, setCollapsed] = useState(
    !(panel.queries.length === 1 || panel.queries.findIndex(q => q.id === query.id) === 0)
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, [setCollapsed]);

  const onTitleChange = useCallback(
    (e?: React.ChangeEvent<HTMLInputElement>) => {
      if (!e) return;
      const value = e.currentTarget.value;

      if (isNullOrWhitespace(value)) {
        addToast(ToastType.Warning, 'Save error', <p>Empty value</p>);
        return;
      }

      if (panel.queries.some(q => q.name === value)) {
        addToast(ToastType.Warning, 'Save error', <p>Duplicate query name {value}</p>);
        return;
      }

      const newQuery = { ...query, name: value };
      editQuery(panel.id, newQuery);
    },
    [editQuery, query, panel, addToast]
  );

  const formatOption = useCallback((option: Query | UniversalId): TypeaheadOption<Query | UniversalId> => {
    if ('localId' in option) {
      return { name: 'DataChannel', value: `${option.toString()}`, option };
    }
    return { name: 'Query', value: option.name, option };
  }, []);

  const onSelectedOption = useCallback(
    (option: Query | UniversalId) => {
      selectQueryItem(panel.id, query.id, option);
    },
    [selectQueryItem, panel.id, query.id]
  );

  const onOperatorSelect = useCallback(
    (operator: Operator) => {
      selectQueryOperator(panel.id, query.id, operator);
    },
    [selectQueryOperator, panel.id, query.id]
  );

  const availableOptions: (Query | UniversalId)[] = useMemo(() => {
    return [
      ...panel.queries
        .filter(q => q.id !== query.id)
        .filter(
          q =>
            !query.items.find(item => {
              if ('operator' in item) return q.id === item.id;
              return false;
            })
        ),
      ...panel.dataChannelIds.filter(
        dc =>
          !query.items.find(item => {
            if ('localId' in item) return item.equals(dc);
            return false;
          })
      ),
    ];
  }, [panel.dataChannelIds, panel.queries, query]);

  return (
    <div className={'query-card'}>
      <div className={'query-card-header'}>
        <Icon
          icon={isCollapsed ? IconName.AngleRight : IconName.AngleDown}
          className={'query-card-collapser'}
          onClick={toggleCollapsed}
        />
        <Input className={'query-card-title'} value={query.name} onChange={onTitleChange} />

        <RelativeTimeRangePicker
          onChange={range => editQuery(panel.id, { ...query, range })}
          timeRange={query.range}
        />
        <div className={'query-card-action-buttons'}>
          <Icon
            role={'button'}
            icon={IconName.Trash}
            onClick={() => removeQueryFromPanel(panel.id, query)}
            className={'query-card-delete-query'}
          />
        </div>
      </div>
      {!isCollapsed && (
        <div className={'query-generation-container'}>
          <div className={'query-generation-selector'}>
            <Typeahead
              className={'query-generation-param'}
              formatter={formatOption}
              options={availableOptions}
              onSelectedOption={onSelectedOption}
              placeholder="Add DataChannel or Query"
              icon={IconName.AngleDown}
              hideClearIcon
              iconLast
            />
            <OperatorSelection
              operator={query.operator}
              onSelect={onOperatorSelect}
              className={'query-generation-operator'}
            />
          </div>
          {query.items.length > 0 &&
            query.items.map(i => {
              if ('localId' in i) {
                return <p key={i.toString()}>{i.toString()}</p>;
              }
              return <p key={i.id}>{i.name}</p>;
            })}
          <div className={'query-generation-submit'}>
            <Button disabled={(query.items.length > 1 && !query.operator) || query.items.length === 0}>
              Generate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryCard;
