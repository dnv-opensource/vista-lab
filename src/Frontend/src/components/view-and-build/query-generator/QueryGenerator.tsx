import React, { useMemo } from 'react';
import { Experiment, useExperimentContext } from '../../../context/ExperimentContext';
import ButtonWithIcon from '../../ui/button/ButtonWithIcon';
import { IconName } from '../../ui/icons/icons';
import FlexScrollableField from '../../ui/scrollable-field/FlexScrollableField';
import QueryCard from './query-card/QueryCard';
import './QueryGenerator.scss';

interface Props {
  experiment: Experiment;
}

const QueryGenerator: React.FC<Props> = ({ experiment }) => {
  const { addNewQueryToExperiment } = useExperimentContext();

  const queries = useMemo(() => experiment.queries, [experiment.queries]);

  return (
    <>
      <div className={'query-generator-header'}>
        <p className={'query-genrator-title'}>Calculations</p>
        <ButtonWithIcon
          icon={IconName.Plus}
          className={'query-generator-new-query'}
          onClick={() => addNewQueryToExperiment(experiment.id)}
        >
          New calculation
        </ButtonWithIcon>
      </div>
      <FlexScrollableField className={'query-generator-queries'}>
        {queries.map(q => (
          <QueryCard experiment={experiment} key={q.id} query={q} />
        ))}
      </FlexScrollableField>
    </>
  );
};

export default QueryGenerator;
