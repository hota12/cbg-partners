import { defineStore } from 'pinia';
import api from '../services/api';

export const useProdutosStore = defineStore('produtos', {
  state: () => ({
    produtos: [],
    loading: false,
  }),

  actions: {
    async fetchProdutos() {
      this.loading = true;
      try {
        const { data } = await api.get('/products');
        this.produtos = data;
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProduto(produtoData) {
      this.loading = true;
      try {
        // Se receber string, converte para objeto
        const payload = typeof produtoData === 'string' 
          ? { nome: produtoData } 
          : produtoData;
        
        await api.post('/products', payload);
        await this.fetchProdutos();
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProduto(produtoId, produtoData) {
      this.loading = true;
      try {
        // Se receber string, converte para objeto
        const payload = typeof produtoData === 'string' 
          ? { produtoId: String(produtoId), name: produtoData }
          : { produtoId: String(produtoId), ...produtoData };
        
        // Se tiver 'nome' mas não 'name', adiciona 'name'
        if (payload.nome && !payload.name) {
          payload.name = payload.nome;
          delete payload.nome;
        }
        
        await api.put('/products', payload);
        await this.fetchProdutos();
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduto(produtoId) {
      this.loading = true;
      try {
        await api.delete('/products', { data: { produtoId: String(produtoId) } });
        await this.fetchProdutos();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
