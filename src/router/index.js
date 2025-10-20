import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: 'Login' },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors', title: 'Dashboard' },
  },
  {
    path: '/auditor/novo',
    name: 'NovoAuditor',
    component: () => import('../views/NovoAuditor.vue'),
    meta: { requiresAuth: true, requiredRole: 'editAuditors', title: 'Novo Parceiro' },
  },
  {
    path: '/auditor/:id',
    name: 'DetalhesAuditor',
    component: () => import('../views/DetalhesAuditor.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors', title: 'Detalhes do Parceiro' },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('../views/Produtos.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewProducts', title: 'Produtos' },
  },
  {
    path: '/pesquisa',
    name: 'Pesquisa',
    component: () => import('../views/Pesquisa.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors', title: 'Pesquisa Avançada' },
  },
  {
    path: '/estatisticas',
    name: 'Estatisticas',
    component: () => import('../views/Estatisticas.vue'),
    meta: { requiresAuth: true, requiredRole: 'viewAuditors', title: 'Estatísticas' },
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

  // Atualiza o título da página
  const pageTitle = to.meta.title || 'CBG Partners';
  document.title = `${pageTitle} | CBG Partners`;

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
