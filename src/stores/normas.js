import { defineStore } from 'pinia';
import api from '../services/api';

export const useNormasStore = defineStore('normas', {
  state: () => ({
    normas: [],
    loaded: false,
  }),

  getters: {
    getNormas: (state) => Array.isArray(state.normas) ? state.normas : [],
  },

  actions: {
    async fetchNormas() {
      if (this.loaded) return; // Evita chamadas desnecessárias
      
      // Verifica cache de sessão primeiro
      const cached = sessionStorage.getItem('normas_cache');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          this.normas = Array.isArray(data) ? data : [];
          this.loaded = true;
          console.log('Normas carregadas do cache de sessão');
          return;
        } catch (error) {
          console.warn('Erro ao ler cache de normas:', error);
          sessionStorage.removeItem('normas_cache');
        }
      }
      
      // Se não tem cache, busca da API
      try {
        const { data } = await api.get('/normas');
        this.normas = Array.isArray(data) ? data : [];
        this.loaded = true;
        
        // Salva no cache de sessão
        try {
          sessionStorage.setItem('normas_cache', JSON.stringify(this.normas));
          console.log('Normas salvas no cache de sessão');
        } catch (error) {
          console.warn('Erro ao salvar cache de normas:', error);
        }
      } catch (error) {
        console.error('Erro ao buscar normas:', error);
        this.normas = [];
        throw error;
      }
    },

    getNormaById(id) {
      const normas = Array.isArray(this.normas) ? this.normas : [];
      return normas.find(n => n.id === parseInt(id));
    },

    clearCache() {
      sessionStorage.removeItem('normas_cache');
      this.loaded = false;
      this.normas = [];
    },
  },
});
