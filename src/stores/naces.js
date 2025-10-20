import { defineStore } from 'pinia';
import api from '../services/api';

export const useNacesStore = defineStore('naces', {
  state: () => ({
    naces: [],
    loaded: false,
  }),

  getters: {
    getNaces: (state) => Array.isArray(state.naces) ? state.naces : [],
    nacesByIaf: (state) => (iaf) => {
      const naces = Array.isArray(state.naces) ? state.naces : [];
      return naces.filter(n => n.iaf === iaf);
    },
    iafsDisponiveis: (state) => {
      const naces = Array.isArray(state.naces) ? state.naces : [];
      const iafs = [...new Set(naces.map(n => n.iaf))];
      return iafs.sort((a, b) => parseInt(a) - parseInt(b));
    },
  },

  actions: {
    async fetchNaces() {
      if (this.loaded) return; // Evita chamadas desnecessárias
      
      // Verifica cache de sessão primeiro
      const cached = sessionStorage.getItem('naces_cache');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          this.naces = Array.isArray(data) ? data : [];
          this.loaded = true;
          console.log('NACEs carregados do cache de sessão');
          return;
        } catch (error) {
          console.warn('Erro ao ler cache de NACEs:', error);
          sessionStorage.removeItem('naces_cache');
        }
      }
      
      // Se não tem cache, busca da API
      try {
        const { data } = await api.get('/naces');
        this.naces = Array.isArray(data) ? data : [];
        this.loaded = true;
        
        // Salva no cache de sessão
        try {
          sessionStorage.setItem('naces_cache', JSON.stringify(this.naces));
          console.log('NACEs salvos no cache de sessão');
        } catch (error) {
          console.warn('Erro ao salvar cache de NACEs:', error);
        }
      } catch (error) {
        console.error('Erro ao buscar naces:', error);
        this.naces = [];
        throw error;
      }
    },

    getNaceById(id) {
      const naces = Array.isArray(this.naces) ? this.naces : [];
      return naces.find(n => n.id === parseInt(id));
    },

    clearCache() {
      sessionStorage.removeItem('naces_cache');
      this.loaded = false;
      this.naces = [];
    },
  },
});
