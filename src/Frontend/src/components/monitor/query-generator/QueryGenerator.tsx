import React, { useMemo } from 'react';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import ButtonWithIcon from '../../ui/button/ButtonWithIcon';
import { IconName } from '../../ui/icons/icons';
import ScrollableField from '../../ui/scrollable-field/ScrollableField';
import QueryCard from './query-card/QueryCard';
import './QueryGenerator.scss';

interface Props {
  panel: Panel;
}

const QueryGenerator: React.FC<Props> = ({ panel }) => {
  const { addNewQueryToPanel } = usePanelContext();

  const queries = useMemo(() => panel.queries, [panel.queries]);

  return (
    <>
      <div className={'query-generator-header'}>
        <p className={'query-genrator-title'}>Query generator</p>
        <ButtonWithIcon
          icon={IconName.Plus}
          className={'query-generator-new-query'}
          onClick={() => addNewQueryToPanel(panel.id)}
        >
          New query
        </ButtonWithIcon>
      </div>
      <ScrollableField className={'query-generator-queries'}>
        {queries.map(q => (
          <QueryCard panel={panel} key={q.id} query={q} />
        ))}
      </ScrollableField>
    </>
  );
};

export default QueryGenerator;
