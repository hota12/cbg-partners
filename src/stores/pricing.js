import { defineStore } from 'pinia';
import api from '../services/api';

export const usePricingStore = defineStore('pricing', {
  state: () => ({
    pricing: [],
    loading: false,
  }),

  actions: {
    async fetchPricing(auditorId) {
      this.loading = true;
      try {
        const { data } = await api.get(`/auditors/pricing?id=${auditorId}`);
        this.pricing = data;
      } catch (error) {
        console.error('Erro ao buscar pricing:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addPricing(auditorId, produtoId, preco) {
      this.loading = true;
      try {
        const payload = {
          auditorId: String(auditorId),
          produtoId: String(produtoId),
          pricing: parseFloat(preco),
        };
        console.log('addPricing - Enviando payload:', payload);
        const response = await api.post('/auditors/pricing', payload);
        console.log('addPricing - Resposta:', response.data);
        await this.fetchPricing(auditorId);
      } catch (error) {
        console.error('Erro ao adicionar pricing:', error);
        console.error('Erro detalhado:', error.response?.data);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePricing(auditorId, produtoId, preco) {
      this.loading = true;
      try {
        await api.post('/auditors/pricing', {
          auditorId: String(auditorId),
          produtoId: String(produtoId),
          pricing: parseFloat(preco),
        });
      } catch (error) {
        console.error('Erro ao atualizar pricing:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePricing(auditorId, produtoId) {
      this.loading = true;
      try {
        await api.delete('/auditors/pricing', {
          data: { 
            auditorId: String(auditorId),
            produtoId: String(produtoId)
          }
        });
        await this.fetchPricing(auditorId);
      } catch (error) {
        console.error('Erro ao deletar pricing:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearPricing() {
      this.pricing = [];
    },
  },
});
