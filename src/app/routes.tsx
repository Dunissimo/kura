import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Processes from './pages/Processes';
import Planning from './pages/Planning';
import Load from './pages/Load';
import References from './pages/References';
import Users from './pages/Users';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'orders', Component: Orders },
      { path: 'processes', Component: Processes },
      { path: 'planning', Component: Planning },
      { path: 'load', Component: Load },
      { path: 'references', Component: References },
      { path: 'users', Component: Users },
    ],
  },
]);
