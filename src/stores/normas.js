import { defineStore } from 'pinia';
import api from '../services/api';

export const useNormasStore = defineStore('normas', {
  state: () => ({
    normas: [],
    loaded: false,
  }),

  actions: {
    async fetchNormas() {
      if (this.loaded) return; // Evita chamadas desnecessárias
      
      try {
        const { data } = await api.get('/normas');
        this.normas = data;
        this.loaded = true;
      } catch (error) {
        console.error('Erro ao buscar normas:', error);
        throw error;
      }
    },

    getNormaById(id) {
      return this.normas.find(n => n.id === parseInt(id));
    },
  },
});
