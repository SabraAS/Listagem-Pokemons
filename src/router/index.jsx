import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '@/app/Home';

export const routeConfig = [
  {
    path: '/',
    element: <Home />,
    exact: true /*, children: [], index: false */,
  },
];

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {routeConfig.map((route, index) => (
          <Route element={route.element} key={index} path={route.path} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
