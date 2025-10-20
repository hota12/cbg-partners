import { defineStore } from 'pinia';
import api from '../services/api';

export const useZeevStore = defineStore('zeev', {
  state: () => ({
    sincronizacoes: [],
    sincronizacaoAtual: null,
    loading: false,
  }),

  getters: {
    getSincByAuditor: (state) => (auditorId) => {
      const sincronizacoes = Array.isArray(state.sincronizacoes) ? state.sincronizacoes : [];
      return sincronizacoes.find(s => s.auditorId === String(auditorId));
    },
    getSincronizacoes: (state) => Array.isArray(state.sincronizacoes) ? state.sincronizacoes : [],
  },

  actions: {
    async fetchAllSincronizacoes() {
      this.loading = true;
      try {
        const { data } = await api.get('/parceiros/zeev');
        this.sincronizacoes = Array.isArray(data) ? data : [];
        return data;
      } catch (error) {
        console.error('Erro ao buscar sincronizações:', error);
        this.sincronizacoes = []; // Garante que sempre seja um array
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSincronizacao(auditorId) {
      this.loading = true;
      try {
        const { data } = await api.get(`/parceiros/zeev/user?id=${auditorId}`);
        this.sincronizacaoAtual = data;
        return data;
      } catch (error) {
        console.error('Erro ao buscar sincronização do auditor:', error);
        // Se não encontrou, retorna null ao invés de erro
        this.sincronizacaoAtual = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createSincronizacao(auditorId, email) {
      this.loading = true;
      try {
        const { data } = await api.post('/parceiros/zeev', {
          auditorId: String(auditorId),
          email: email
        });
        await this.fetchSincronizacao(auditorId);
        return data;
      } catch (error) {
        console.error('Erro ao criar sincronização:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSincronizacao() {
      this.sincronizacaoAtual = null;
    },
  },
});
