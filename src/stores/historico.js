import { defineStore } from 'pinia';
import api from '../services/api';

export const useHistoricoStore = defineStore('historico', {
  state: () => ({
    historico: [],
    loading: false,
  }),

  getters: {
    historicoByAuditor: (state) => (auditorId) => {
      return state.historico.filter(h => h.auditorId === String(auditorId));
    },
  },

  actions: {
    async fetchHistorico(auditorId = null) {
      this.loading = true;
      try {
        const url = auditorId 
          ? `/auditors/history?id=${auditorId}` 
          : '/auditors/history';
        const { data } = await api.get(url);
        this.historico = data;
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    getActionLabel(action) {
      const labels = {
        'ADD_NACE_AUDITOR': 'Adicionou NACE',
        'REMOVE_NACE_AUDITOR': 'Removeu NACE',
        'ADD_NORMA_AUDITOR': 'Adicionou Norma',
        'REMOVE_NORMA_AUDITOR': 'Removeu Norma',
        'ADD_AUDITOR': 'Criou Parceiro',
        'UPDATE_AUDITOR': 'Atualizou Parceiro',
        'ADD_AUDITOR_PRICING': 'Adicionou Preço',
        'REMOVE_AUDITOR_PRICING': 'Removeu Preço',
        'ADD_PRODUCT': 'Adicionou Produto',
        'UPDATE_PRODUCT': 'Atualizou Produto',
        'REMOVE_PRODUCT': 'Removeu Produto',
      };
      return labels[action] || action;
    },
  },
});
