import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors' },
  },
  {
    path: '/auditor/novo',
    name: 'NovoAuditor',
    component: () => import('../views/NovoAuditor.vue'),
    meta: { requiresAuth: true, requiredRole: 'editAuditors' },
  },
  {
    path: '/auditor/:id',
    name: 'DetalhesAuditor',
    component: () => import('../views/DetalhesAuditor.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors' },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('../views/Produtos.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewProducts' },
  },
  {
    path: '/pesquisa',
    name: 'Pesquisa',
    component: () => import('../views/Pesquisa.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors' },
  },
  {
    path: '/estatisticas',
    name: 'Estatisticas',
    component: () => import('../views/Estatisticas.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.requiredRole;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else if (requiredRole && !authStore.hasRole(requiredRole)) {
    next('/');
  } else {
    next();
  }
});

export default router;
