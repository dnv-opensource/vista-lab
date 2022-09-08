import { LocalIdBuilder } from 'dnv-vista-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { DataChannelWithShipData } from '../../../../context/ExploreContext';
import { isDataChannelQueryItem, Panel, Query, usePanelContext } from '../../../../context/PanelContext';
import { useVISContext } from '../../../../context/VISContext';
import useToast, { ToastType } from '../../../../hooks/use-toast';
import { isNullOrWhitespace } from '../../../../util/string';
import DataChannelCard, { CardMode } from '../../../explore/data-channel-card/DataChannelCard';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import Typeahead, { TypeaheadOption } from '../../../ui/typeahead/Typeahead';
import OperatorSelection, { Operator } from '../operator-selection/OperatorSelection';
import './QueryCard.scss';

interface Props {
  query: Query;
  panel: Panel;
}

const QueryCard: React.FC<Props> = ({ query, panel }) => {
  const { addToast } = useToast();
  const { removeQueryFromPanel, editQuery, selectQueryItem, selectQueryOperator, toggleQueryItemInPanel } =
    usePanelContext();
  const { gmod, codebooks } = useVISContext();

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

  const formatOption = useCallback(
    (option: Query | DataChannelWithShipData): TypeaheadOption<Query | DataChannelWithShipData> => {
      if (isDataChannelQueryItem(option)) {
        return { name: 'DataChannel', value: `${option.Property.UniversalID.toString()}`, option };
      }
      return { name: 'Query', value: option.name, option };
    },
    []
  );

  const onSelectedOption = useCallback(
    (option: Query | DataChannelWithShipData) => {
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

  const deleteSelectedItem = useCallback(
    (item: Query | DataChannelWithShipData) => {
      const newQuery = { ...query };
      const items = [...newQuery.items];
      const itemIndex = items.findIndex(i => item.toString() === i.toString());
      if (itemIndex === -1) return;
      newQuery.items.splice(itemIndex, 1);
      editQuery(panel.id, newQuery);
    },
    [editQuery, panel, query]
  );

  const availableOptions: (Query | DataChannelWithShipData)[] = useMemo(() => {
    return [
      ...panel.queries
        .filter(q => q.id !== query.id)
        .filter(
          q =>
            !query.items.find(item => {
              if ('items' in item) return q.id === item.id;
              return false;
            })
        ),
      ...panel.dataChannels.filter(
        dc =>
          !query.items.find(item => {
            if (isDataChannelQueryItem(item)) return item.Property.UniversalID.equals(dc.Property.UniversalID);
            return false;
          })
      ),
    ];
  }, [panel.dataChannels, panel.queries, query]);

  const isQueryExcludedFromGraph = panel.queryItemsExcludedFromGraph.has(query.id);

  const saveQuery = useCallback(() => {
    if (!gmod || !codebooks || LocalIdBuilder.tryParse(query.name, gmod, codebooks) === undefined) {
      addToast(ToastType.Warning, 'Save error', <p>Name must be a valid LocalId</p>);
      return;
    }
  }, [query, gmod, codebooks, addToast]);

  return (
    <div className={'query-card'}>
      <div className={'query-card-header'}>
        <Icon
          icon={isCollapsed ? IconName.AngleRight : IconName.AngleDown}
          className={'query-card-collapser'}
          onClick={toggleCollapsed}
        />
        <Input className={'query-card-title'} value={query.name} onChange={onTitleChange} />

        <Icon
          role={'button'}
          icon={IconName.Eye}
          onClick={() => toggleQueryItemInPanel(panel.id, query)}
          className={`query-card-toggle-query ${isQueryExcludedFromGraph ? 'excluded' : ''}`}
        />
        <Icon
          role={'button'}
          icon={IconName.FloppyDisk}
          onClick={saveQuery}
          className={'query-card-action-button query-card-save-query'}
        />
        <Icon
          role={'button'}
          icon={IconName.Trash}
          onClick={() => removeQueryFromPanel(panel.id, query)}
          className={'query-card-delete-query'}
        />
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
              let item = undefined;
              let key = '';
              if (isDataChannelQueryItem(i)) {
                key = i.Property.UniversalID.toString();
                item = <DataChannelCard dataChannel={i} mode={CardMode.LegacyNameCentric} />;
              } else {
                key = i.id;
                item = <QueryCardInner key={key} query={i} />;
              }
              return (
                <div key={key} className={'query-generation-selected-item'}>
                  {item}
                  <Icon icon={IconName.Minus} onClick={() => deleteSelectedItem(i)} />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

const QueryCardInner = ({ query }: { query: Query }) => {
  return (
    <div className={'query-card-inner'}>
      <p>{query.name}</p>
    </div>
  );
};

export default QueryCard;
