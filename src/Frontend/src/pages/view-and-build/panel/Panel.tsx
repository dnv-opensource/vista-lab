import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VesselLink from '../../../components/shared/link/VesselLink';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Checkbox from '../../../components/ui/checkbox/Checkbox';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import DataChannelSelection from '../../../components/view-and-build/data-channel-selection/DataChannelSelection';
import CombinedTimePickers from '../../../components/view-and-build/panel-pickers/combined-time-pickers/CombinedTimePickers';
import QueryGenerator from '../../../components/view-and-build/query-generator/QueryGenerator';
import ResultEllipsisMenu from '../../../components/view-and-build/query-generator/result-ellipsis-menu/ResultEllipsisMenu';
import { usePanelContext } from '../../../context/PanelContext';
import { RoutePath } from '../../Routes';
import './Panel.scss';
const QueryResults = React.lazy(() => import('../../../components/view-and-build/query-results/QueryResults'));

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const { panelId } = useParams();
  const { getPanel, editPanel, timeRange, interval } = usePanelContext();
  const initPanel = useMemo(() => (panelId ? getPanel(panelId) : undefined), [getPanel, panelId]);

  if (!initPanel) navigate(RoutePath.ViewAndBuild);
  const panel = initPanel!;

  const isCustomTimeRange = !!panel.timeRange || !!panel.interval;

  return (
    <>
      <ResultBar className={'panel-nav-bar'}>
        <VesselLink className={'back'} to={RoutePath.ViewAndBuild} persistSearch>
          <Icon icon={IconName.LeftArrow} />
          {panelId}
        </VesselLink>
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
          <ResultEllipsisMenu panel={panel} />
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
