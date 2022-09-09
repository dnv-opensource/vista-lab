import React, { useMemo } from 'react';
import { Panel, usePanelContext } from '../../../context/PanelContext';
import ButtonWithIcon from '../../ui/button/ButtonWithIcon';
import { IconName } from '../../ui/icons/icons';
import FlexScrollableField from '../../ui/scrollable-field/FlexScrollableField';
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
        <p className={'query-genrator-title'}>Calculations</p>
        <ButtonWithIcon
          icon={IconName.Plus}
          className={'query-generator-new-query'}
          onClick={() => addNewQueryToPanel(panel.id)}
        >
          New calculation
        </ButtonWithIcon>
      </div>
      <FlexScrollableField className={'query-generator-queries'}>
        {queries.map(q => (
          <QueryCard panel={panel} key={q.id} query={q} />
        ))}
      </FlexScrollableField>
    </>
  );
};

export default QueryGenerator;
