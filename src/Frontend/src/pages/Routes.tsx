import React, { Suspense } from 'react';
import { BrowserRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import FleetGrid from './shared/fleet/Fleet';
import Layout from '../components/layout/Layout';
import { ExploreContextProvider } from '../context/ExploreContext';
import Vessel from './shared/vessel/Vessel';
import { VISContextProvider } from '../context/VISContext';
import { PanelContextProvider } from '../context/PanelContext';
import { IconName } from '../components/ui/icons/icons';
import Panel from './monitor/panel/Panel';
import Panels from './monitor/panels/Panels';
import ResultsTable from './report/results-table/ResultsTable';

const Home = React.lazy(() => import('./home/Home'));
const Explore = React.lazy(() => import('./explore/Explore'));
const Monitor = React.lazy(() => import('./monitor/Monitor'));
const Report = React.lazy(() => import('./report/Report'));
const Import = React.lazy(() => import('./import/Import'));

type RouteProp = {
  path: string;
  element: JSX.Element;
  routes?: JSX.Element;
  title: string;
  icon: IconName;
};

export enum RoutePath {
  Import = '/import',
  Search = '/search',
  ViewAndBuild = '/view',
  Report = '/report',
  Home = '*',
}

export const routesList: RouteProp[] = [
  {
    path: RoutePath.Import,
    element: <Import />,
    title: 'Import',
    icon: IconName.FileImport,
  },
  {
    path: RoutePath.Search,
    element: (
      <ExploreContextProvider>
        <Explore />
      </ExploreContextProvider>
    ),
    title: 'Search',
    routes: (
      <>
        <Route path={':vesselId'} element={<Vessel />} />
        <Route path="" element={<FleetGrid />} />
      </>
    ),
    icon: IconName.Search,
  },
  {
    path: RoutePath.ViewAndBuild,
    element: <Monitor />,
    title: 'View&Build',
    icon: IconName.ChartColumn,
    routes: (
      <>
        <Route path={':panelId'} element={<Panel />} />
        <Route path="" element={<Panels />} />
      </>
    ),
  },
  {
    path: RoutePath.Report,
    element: (
      <ExploreContextProvider>
        <Report />
      </ExploreContextProvider>
    ),
    title: 'Report',
    routes: (
      <>
        <Route path={':vesselId'} element={<ResultsTable />} />
        <Route path="" element={<FleetGrid />} />
      </>
    ),
    icon: IconName.FileLines,
  },
];

const Routes: React.FC = () => {
  return (
    <VISContextProvider>
        <BrowserRouter>
            <PanelContextProvider>
                <Layout>
                    <Suspense fallback={<div>Loading page</div>}>
                    <BrowserRoutes>
                        {routesList.map(route => (
                        <Route key={route.path} path={route.path} element={route.element}>
                            {route.routes}
                        </Route>
                        ))}
                        <Route path={RoutePath.Home} element={<Home />} />
                    </BrowserRoutes>
                    </Suspense>
                </Layout>
            </PanelContextProvider>
        </BrowserRouter>
    </VISContextProvider>
  );
};

export default Routes;
