import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataChannelSelection from '../../../components/monitor/data-channel-selection/DataChannelSelection';
import IntervalPicker from '../../../components/monitor/panel-pickers/interval-picker/IntervalPicker';
import TimeRangePicker from '../../../components/monitor/panel-pickers/time-range-picker/TimeRangePicker';
import QueryGenerator from '../../../components/monitor/query-generator/QueryGenerator';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import { usePanelContext } from '../../../context/PanelContext';
import './Panel.scss';
const QueryResults = React.lazy(() => import('../../../components/monitor/query-results/QueryResults'));

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const { panelId } = useParams();
  const { getPanel } = usePanelContext();
  const panel = useMemo(() => (panelId ? getPanel(panelId) : undefined), [getPanel, panelId]);

  if (!panel) navigate('/monitor');

  return (
    <>
      <ResultBar className={'panel-nav-bar'}>
        <Link className={'back'} to={'/monitor'}>
          <Icon icon={IconName.LeftArrow} />
          {panelId}
        </Link>
        <div className={'panel-time-pickers'}>
          <IntervalPicker />
          <TimeRangePicker />
        </div>
      </ResultBar>
      <div className={'vista-panel-container-grid'}>
        <div className={'panel-result-graph-wrapper item'}>{panel && <QueryResults panel={panel} />}</div>
        <div className={'available-data-channels item'}>{panel && <DataChannelSelection panel={panel} />}</div>
        <div className={'query-selection item'}>{panel && <QueryGenerator panel={panel} />}</div>
      </div>
    </>
  );
};

export default Panel;
