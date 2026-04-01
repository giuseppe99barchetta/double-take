import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const base = window.ingressUrl || window.publicPath || '';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/matches',
  },
  {
    path: '/matches',
    name: 'matches',
    component: () => import('@/pages/MatchesPage.vue'),
    meta: {
      title: 'Matches',
    },
  },
  {
    path: '/cameras',
    name: 'cameras',
    component: () => import('@/pages/CamerasPage.vue'),
    meta: {
      title: 'Cameras',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: {
      title: 'Settings',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/matches',
  },
];

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Double Take';
  document.title = `${title} / Double Take`;
});

export default router;