import { DataChannelList } from 'dnv-vista-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { useLabContext } from '../../../../context/LabContext';
import {
  isDataChannelQueryItem,
  Experiment,
  Query,
  useExperimentContext,
} from '../../../../context/ExperimentContext';
import useToast, { ToastType } from '../../../../hooks/use-toast';
import { isNullOrWhitespace } from '../../../../util/string';
import DataChannelCard, { CardMode } from '../../../search/data-channel-card/DataChannelCard';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import Input from '../../../ui/input/Input';
import Typeahead, { TypeaheadOption } from '../../../ui/typeahead/Typeahead';
import OperatorSelection, { Operator } from '../operator-selection/OperatorSelection';
import SaveQueryModal from '../save-query/SaveQueryModal';
import './QueryCard.scss';

interface Props {
  query: Query;
  experiment: Experiment;
}

const QueryCard: React.FC<Props> = ({ query, experiment }) => {
  const { addToast } = useToast();
  const { removeQueryFromExperiment, editQuery, selectQueryItem, selectQueryOperator, toggleQueryItemInExperiment } =
    useExperimentContext();
  const { hasDataChannel } = useLabContext();

  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const [isCollapsed, setCollapsed] = useState(
    !(experiment.queries.length === 1 || experiment.queries.findIndex(q => q.id === query.id) === 0)
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

      if (experiment.queries.some(q => q.name === value)) {
        addToast(ToastType.Warning, 'Save error', <p>Duplicate query name {value}</p>);
        return;
      }

      const newQuery = { ...query, name: value };
      editQuery(experiment.id, newQuery);
    },
    [editQuery, query, experiment, addToast]
  );

  const formatOption = useCallback(
    (option: Query | DataChannelList.DataChannel): TypeaheadOption<Query | DataChannelList.DataChannel> => {
      if (isDataChannelQueryItem(option)) {
        return { name: 'DataChannel', value: `${option.dataChannelId.localId.toString()}`, option };
      }
      return { name: 'Query', value: option.name, option };
    },
    []
  );

  const onSelectedOption = useCallback(
    (option: Query | DataChannelList.DataChannel) => {
      selectQueryItem(experiment.id, query.id, option);
    },
    [selectQueryItem, experiment.id, query.id]
  );

  const onOperatorSelect = useCallback(
    (operator: Operator) => {
      selectQueryOperator(experiment.id, query.id, operator);
    },
    [selectQueryOperator, experiment.id, query.id]
  );

  const deleteSelectedItem = useCallback(
    (item: Query | DataChannelList.DataChannel) => {
      const newQuery = { ...query };
      const items = [...newQuery.items];
      const itemIndex = items.findIndex(i => item.toString() === i.toString());
      if (itemIndex === -1) return;
      newQuery.items.splice(itemIndex, 1);
      editQuery(experiment.id, newQuery);
    },
    [editQuery, experiment, query]
  );

  const availableOptions: (Query | DataChannelList.DataChannel)[] = useMemo(() => {
    return [
      ...experiment.queries
        .filter(q => q.id !== query.id)
        .filter(
          q =>
            !query.items.find(item => {
              if ('items' in item) return q.id === item.id;
              return false;
            })
        ),
      ...experiment.dataChannels.filter(hasDataChannel).filter(
        dc =>
          !query.items.find(item => {
            if (isDataChannelQueryItem(item)) return item.dataChannelId.localId.equals(dc.dataChannelId.localId);
            return false;
          })
      ),
    ];
  }, [experiment.dataChannels, experiment.queries, query, hasDataChannel]);

  const isQueryExcludedFromGraph = experiment.queryItemsExcludedFromGraph.has(query.id);

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
          onClick={() => toggleQueryItemInExperiment(experiment.id, query)}
          className={`query-card-action-button query-card-toggle-query ${isQueryExcludedFromGraph ? 'excluded' : ''}`}
        />
        <Icon role={'button'} icon={IconName.FloppyDisk} onClick={() => setSaveModalOpen(true)} />
        {saveModalOpen && (
          <SaveQueryModal query={query} experimentId={experiment.id} open={saveModalOpen} setOpen={setSaveModalOpen} />
        )}
        <Icon
          role={'button'}
          icon={IconName.Trash}
          onClick={() => removeQueryFromExperiment(experiment.id, query)}
          className={'query-card-action-button query-card-delete-query'}
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
                key = i.dataChannelId.localId.toString();
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
