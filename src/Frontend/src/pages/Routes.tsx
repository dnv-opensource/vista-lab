import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes as BrowserRoutes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { IconName } from '../components/ui/icons/icons';
import { LabContextProvider } from '../context/LabContext';
import { PanelContextProvider } from '../context/PanelContext';
import { SearchContextProvider } from '../context/SearchContext';
import { VISContextProvider } from '../context/VISContext';
import Panel from './view-and-build/panel/Panel';
import Panels from './view-and-build/panels/Panels';

const Home = React.lazy(() => import('./home/Home'));
const Search = React.lazy(() => import('./search/Search'));
const ViewAndBuild = React.lazy(() => import('./view-and-build/ViewAndBuild'));
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
  Fleet = '/fleet',
  Import = 'import',
  Search = 'search',
  ViewAndBuild = 'view',
  Report = 'report',
  Home = '',
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
      <SearchContextProvider>
        <Search />
      </SearchContextProvider>
    ),
    title: 'Search',
    icon: IconName.Search,
  },
  {
    path: RoutePath.ViewAndBuild,
    element: <ViewAndBuild />,
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
      <SearchContextProvider>
        <Report />
      </SearchContextProvider>
    ),
    title: 'Report',
    icon: IconName.FileLines,
  },
];

const Routes: React.FC = () => {
  return (
    <VISContextProvider>
      <BrowserRouter>
        <PanelContextProvider>
          <Suspense fallback={<div>Loading page</div>}>
            <BrowserRoutes>
              <Route
                path={':vessel'}
                element={
                  <>
                    <LabContextProvider>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </LabContextProvider>
                  </>
                }
              >
                {routesList.map(route => (
                  <Route key={route.path} path={route.path} element={route.element}>
                    {route.routes}
                  </Route>
                ))}
                <Route path={''} element={<Home />} />
                <Route path={'*'} element={<Home />} />
              </Route>
              <Route path={'*'} element={<Navigate to={'fleet'} />} />
            </BrowserRoutes>
          </Suspense>
        </PanelContextProvider>
      </BrowserRouter>
    </VISContextProvider>
  );
};

export default Routes;
