import React from 'react';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import CustomLink from '../../../components/ui/router/CustomLink';
import { RoutePath } from '../../Routes';
import './VesselHome.scss';

const VesselHome: React.FC = () => {
  return (
    <section className={'vista-vessel-home'}>
      <ResultBar>
        <CustomLink className={'back-to-fleet'} to={RoutePath.Fleet} persistRestOfUrl persistSearch>
          <Icon icon={IconName.LeftArrow} />
          <p>Show fleet</p>
        </CustomLink>
      </ResultBar>
      <p>Vessel home</p>
    </section>
  );
};

export default VesselHome;
