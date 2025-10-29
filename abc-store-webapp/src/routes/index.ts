import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { t } from 'i18next';

import asyncComponentLoader from '@/utils/loader';

import { Routes } from './types';

const routes: Routes = [
  {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: t('routes.welcome'),
    icon: HomeIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/ShoppingPage')),
    path: '/shopping',
    title: t('routes.shop'),
    icon: StorefrontIcon,
    show: true,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
];

export default routes;
