import { defineStore } from 'pinia';
import api from '../services/api';

export const useNacesStore = defineStore('naces', {
  state: () => ({
    naces: [],
    loaded: false,
  }),

  getters: {
    nacesByIaf: (state) => (iaf) => {
      return state.naces.filter(n => n.iaf === iaf);
    },
    iafsDisponiveis: (state) => {
      const iafs = [...new Set(state.naces.map(n => n.iaf))];
      return iafs.sort((a, b) => parseInt(a) - parseInt(b));
    },
  },

  actions: {
    async fetchNaces() {
      if (this.loaded) return; // Evita chamadas desnecessárias
      
      try {
        const { data } = await api.get('/naces');
        this.naces = data;
        this.loaded = true;
      } catch (error) {
        console.error('Erro ao buscar naces:', error);
        throw error;
      }
    },

    getNaceById(id) {
      return this.naces.find(n => n.id === parseInt(id));
    },
  },
});
