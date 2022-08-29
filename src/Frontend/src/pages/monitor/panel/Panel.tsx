import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataChannelSelection from '../../../components/monitor/data-channel-selection/DataChannelSelection';
import QueryGenerator from '../../../components/monitor/query-generator/QueryGenerator';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import { usePanelContext } from '../../../context/PanelContext';
import './Panel.scss';

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
      </ResultBar>
      <ScrollableField className={'vista-panel-container-grid'}>
        <div className={'panel-result-graph-wrapper item'}>
          {
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <iframe
              className={'panel-graph'}
              src="http://localhost:3000/d-solo/AixRzyZ4z/home?orgId=1&tab=transform&theme=light&panelId=2"
              frameBorder="0"
            ></iframe>
          }
        </div>
        <div className={'available-data-channels item'}>
          {panel!.dataChannelIds.length > 0 ? <DataChannelSelection panel={panel!} /> : <p>Explore</p>}
        </div>
        <div className={'query-selection item'}>
          <QueryGenerator panel={panel!} />
        </div>
      </ScrollableField>
    </>
  );
};

export default Panel;
