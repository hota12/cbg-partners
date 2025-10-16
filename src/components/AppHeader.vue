<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <img src="../../public/logo.svg" alt="CBG Certificadora" class="logo" />
        </router-link>

        <nav class="nav-menu" v-if="isAuthenticated">
          <router-link to="/" class="nav-link" v-if="hasRole('viewAuditors')">
            <i class="bi bi-house-door"></i>
            <span>Painel</span>
          </router-link>
          <router-link to="/estatisticas" class="nav-link" v-if="hasRole('viewAuditors')">
            <i class="bi bi-bar-chart"></i>
            <span>Estatísticas</span>
          </router-link>
          <router-link to="/pesquisa" class="nav-link" v-if="hasRole('viewAuditors')">
            <i class="bi bi-search"></i>
            <span>Pesquisar</span>
          </router-link>
          <router-link to="/auditor/novo" class="nav-link" v-if="hasRole('editAuditors')">
            <i class="bi bi-person-plus"></i>
            <span>Novo Parceiro</span>
          </router-link>
          <router-link to="/produtos" class="nav-link" v-if="hasRole('viewProducts')">
            <i class="bi bi-box"></i>
            <span>Produtos</span>
          </router-link>
        </nav>

        <div class="header-actions" v-if="isAuthenticated">
          <div class="user-info">
            <i class="bi bi-person-circle"></i>
            <span class="user-name">{{ userName }}</span>
          </div>
          <button @click="handleLogout" class="btn-logout">
            <i class="bi bi-box-arrow-right"></i>
            Sair
          </button>
        </div>

        <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="isAuthenticated">
          <i class="bi bi-list"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide">
      <div class="mobile-menu" v-if="showMobileMenu && isAuthenticated" @click="toggleMobileMenu">
        <div class="mobile-menu-content" @click.stop>
          <div class="mobile-user-info">
            <i class="bi bi-person-circle"></i>
            <span>{{ userName }}</span>
          </div>

          <nav class="mobile-nav">
            <router-link to="/" class="mobile-nav-link" @click="toggleMobileMenu" v-if="hasRole('viewAuditors')">
              <i class="bi bi-house-door"></i>
              <span>Painel</span>
            </router-link>
            <router-link to="/estatisticas" class="mobile-nav-link" @click="toggleMobileMenu" v-if="hasRole('viewAuditors')">
              <i class="bi bi-bar-chart"></i>
              <span>Estatísticas</span>
            </router-link>
            <router-link to="/pesquisa" class="mobile-nav-link" @click="toggleMobileMenu" v-if="hasRole('viewAuditors')">
              <i class="bi bi-search"></i>
              <span>Pesquisar</span>
            </router-link>
            <router-link to="/auditor/novo" class="mobile-nav-link" @click="toggleMobileMenu" v-if="hasRole('editAuditors')">
              <i class="bi bi-person-plus"></i>
              <span>Novo Parceiro</span>
            </router-link>
            <router-link to="/produtos" class="mobile-nav-link" @click="toggleMobileMenu" v-if="hasRole('viewProducts')">
              <i class="bi bi-box"></i>
              <span>Produtos</span>
            </router-link>
          </nav>

          <button @click="handleLogout" class="mobile-logout-btn">
            <i class="bi bi-box-arrow-right"></i>
            Sair
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const showMobileMenu = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.nome || '');
const hasRole = (role) => authStore.hasRole(role);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const handleLogout = () => {
  authStore.logout();
  showMobileMenu.value = false;
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  width: 100%;
  padding: 0 32px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo {
  height: 30px;
  width: auto;
}

.nav-menu {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #e70d0c;
}

.nav-link.router-link-active {
  color: #e70d0c;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.user-info i {
  font-size: 24px;
  color: #e70d0c;
}

.user-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-logout:hover {
  background: #f5f5f5;
  border-color: #e70d0c;
  color: #e70d0c;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 28px;
  color: #333;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-menu-content {
  background: white;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.mobile-user-info i {
  font-size: 32px;
  color: #e70d0c;
}

.mobile-user-info span {
  font-weight: 600;
  font-size: 16px;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.mobile-nav-link i {
  font-size: 20px;
}

.mobile-nav-link:hover {
  background: #f5f5f5;
}

.mobile-nav-link.router-link-active {
  background: #e70d0c;
  color: white;
}

.mobile-logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

@media (max-width: 968px) {
  .nav-menu,
  .header-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>
