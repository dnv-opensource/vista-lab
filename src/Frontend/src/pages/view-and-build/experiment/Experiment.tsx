import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VesselLink from '../../../components/shared/link/VesselLink';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Checkbox from '../../../components/ui/checkbox/Checkbox';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import DataChannelSelection from '../../../components/view-and-build/data-channel-selection/DataChannelSelection';
import CombinedTimePickers from '../../../components/view-and-build/experiment-pickers/combined-time-pickers/CombinedTimePickers';
import QueryGenerator from '../../../components/view-and-build/query-generator/QueryGenerator';
import ResultEllipsisMenu from '../../../components/view-and-build/query-generator/result-ellipsis-menu/ResultEllipsisMenu';
import { useExperimentContext } from '../../../context/ExperimentContext';
import { RoutePath } from '../../Routes';
import './Experiment.scss';
const QueryResults = React.lazy(() => import('../../../components/view-and-build/query-results/QueryResults'));

const Experiment: React.FC = () => {
  const navigate = useNavigate();
  const { experimentId } = useParams();
  const { getExperiment, editExperiment, timeRange, interval } = useExperimentContext();
  const initExperiment = useMemo(
    () => (experimentId ? getExperiment(experimentId) : undefined),
    [getExperiment, experimentId]
  );

  if (!initExperiment) navigate(RoutePath.ViewAndBuild);
  const experiment = initExperiment!;

  const isCustomTimeRange = !!experiment.timeRange || !!experiment.interval;

  return (
    <>
      <ResultBar className={'experiment-nav-bar'}>
        <VesselLink className={'back'} to={RoutePath.ViewAndBuild} persistSearch>
          <Icon icon={IconName.LeftArrow} />
          {experimentId}
        </VesselLink>
        <div className={'experiment-time-pickers'}>
          <Checkbox
            label="Custom"
            className={'custom-time-range-checkbox'}
            checked={isCustomTimeRange}
            onChange={checked => {
              if (checked) return editExperiment({ ...experiment, interval, timeRange });
              return editExperiment({ ...experiment, interval: undefined, timeRange: undefined });
            }}
          />
          <CombinedTimePickers experiment={isCustomTimeRange ? experiment : undefined} />
        </div>
      </ResultBar>
      <div className={'vista-experiment-container-grid'}>
        <div className={'experiment-result-graph-wrapper item'}>
          <ResultEllipsisMenu experiment={experiment} />
          <QueryResults experiment={experiment} />
        </div>
        <div className={'available-data-channels item'}>
          <DataChannelSelection experiment={experiment} />
        </div>
        <div className={'query-selection item'}>
          <QueryGenerator experiment={experiment} />
        </div>
      </div>
    </>
  );
};

export default Experiment;
