import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataChannelSelection from '../../../components/monitor/data-channel-selection/DataChannelSelection';
import CombinedTimePickers from '../../../components/monitor/panel-pickers/combined-time-pickers/CombinedTimePickers';
import QueryGenerator from '../../../components/monitor/query-generator/QueryGenerator';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Checkbox from '../../../components/ui/checkbox/Checkbox';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import { usePanelContext } from '../../../context/PanelContext';
import './Panel.scss';
const QueryResults = React.lazy(() => import('../../../components/monitor/query-results/QueryResults'));

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const { panelId } = useParams();
  const { getPanel, editPanel, timeRange, interval } = usePanelContext();
  const initPanel = useMemo(() => (panelId ? getPanel(panelId) : undefined), [getPanel, panelId]);

  if (!initPanel) navigate('/monitor');
  const panel = initPanel!;

  const isCustomTimeRange = !!panel.timeRange || !!panel.interval;

  return (
    <>
      <ResultBar className={'panel-nav-bar'}>
        <Link className={'back'} to={'/monitor'}>
          <Icon icon={IconName.LeftArrow} />
          {panelId}
        </Link>
        <div className={'panel-time-pickers'}>
          <Checkbox
            label="Custom"
            className={'custom-time-range-checkbox'}
            checked={isCustomTimeRange}
            onChange={checked => {
              if (checked) return editPanel({ ...panel, interval, timeRange });
              return editPanel({ ...panel, interval: undefined, timeRange: undefined });
            }}
          />
          <CombinedTimePickers panel={isCustomTimeRange ? panel : undefined} />
        </div>
      </ResultBar>
      <div className={'vista-panel-container-grid'}>
        <div className={'panel-result-graph-wrapper item'}>
          <QueryResults panel={panel} />
        </div>
        <div className={'available-data-channels item'}>
          <DataChannelSelection panel={panel} />
        </div>
        <div className={'query-selection item'}>
          <QueryGenerator panel={panel} />
        </div>
      </div>
    </>
  );
};

export default Panel;
