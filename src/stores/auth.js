import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    hasRole: (state) => (role) => state.user?.roles?.includes(role) || false,
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      try {
        const { data } = await api.post('/login', { email, password });
        this.token = data.token;
        localStorage.setItem('token', data.token);
        
        await this.fetchUser();
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao fazer login' 
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      try {
        const { data } = await api.get('/user/me');
        this.user = data[0];
        localStorage.setItem('user', JSON.stringify(data[0]));
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
