import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TaskMarketplacePage } from './pages/TaskMarketplacePage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'marketplace', Component: TaskMarketplacePage },
      { path: 'tasks/:id', Component: TaskDetailsPage },
      { path: 'portfolio', Component: PortfolioPage },
      { path: 'feed', Component: FeedPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
]);
