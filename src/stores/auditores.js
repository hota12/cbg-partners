import { defineStore } from 'pinia';
import api from '../services/api';
import { useNacesStore } from './naces';

export const useAuditoresStore = defineStore('auditores', {
  state: () => ({
    auditores: [],
    auditorAtual: null,
    loading: false,
    filters: {
      cidade: '',
      estado: '',
      pesquisa: '',
      iaf: '',
      naceId: '',
      normaId: '',
      auditorStatus: '',
      inativo: null,
      revisor: null,
      desqualificado: null,
    },
  }),

  getters: {
    auditoresFiltrados: (state) => {
      let resultado = [...state.auditores];

      if (state.filters.cidade) {
        resultado = resultado.filter(a => 
          a.cidade?.toLowerCase().includes(state.filters.cidade.toLowerCase())
        );
      }

      if (state.filters.estado) {
        resultado = resultado.filter(a => 
          a.estado?.toLowerCase().includes(state.filters.estado.toLowerCase())
        );
      }

      if (state.filters.pesquisa) {
        const termo = state.filters.pesquisa.toLowerCase();
        resultado = resultado.filter(a => 
          a.nome?.toLowerCase().includes(termo) ||
          a.email?.toLowerCase().includes(termo) ||
          a.cpf?.includes(termo)
        );
      }

      if (state.filters.auditorStatus) {
        resultado = resultado.filter(a => a.auditorStatus === state.filters.auditorStatus);
      }

      if (state.filters.inativo !== null) {
        resultado = resultado.filter(a => a.inativo === state.filters.inativo);
      }

      if (state.filters.normaId) {
        resultado = resultado.filter(a => 
          a.Normas?.some(n => n.normaId === state.filters.normaId)
        );
      }

      if (state.filters.naceId) {
        resultado = resultado.filter(a => 
          a.Nace?.some(n => n.naceId === state.filters.naceId)
        );
      }

      if (state.filters.revisor !== null) {
        resultado = resultado.filter(a => a.revisor === state.filters.revisor);
      }

      if (state.filters.iaf) {
        const nacesStore = useNacesStore();
        resultado = resultado.filter(a => 
          a.Nace?.some(n => {
            const naceCompleto = nacesStore.getNaceById(n.naceId);
            return naceCompleto?.iaf === state.filters.iaf;
          })
        );
      }

      if (state.filters.desqualificado !== null) {
        resultado = resultado.filter(a => a.desqualificado === state.filters.desqualificado);
      }

      return resultado;
    },
  },

  actions: {
    async fetchAuditores() {
      this.loading = true;
      try {
        const { data } = await api.get('/auditores');
        this.auditores = data;
      } catch (error) {
        console.error('Erro ao buscar auditores:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchAuditores(searchParams) {
      this.loading = true;
      try {
        console.log('Buscando auditores com parâmetros:', searchParams);
        
        const { data } = await api.post('/auditors/search', searchParams);
        return data;
      } catch (error) {
        console.error('Erro ao buscar auditores:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAuditor(id) {
      this.loading = true;
      // Limpa o auditor atual antes de carregar o novo
      this.auditorAtual = null;
      
      try {
        const { data } = await api.get(`/auditor?id=${id}`);
        
        // Valida que recebeu dados válidos
        if (!data || !data.id) {
          throw new Error('Dados do auditor inválidos');
        }
        
        this.auditorAtual = data;
        return data;
      } catch (error) {
        console.error('Erro ao buscar auditor:', error);
        this.auditorAtual = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAuditor(auditorData) {
      this.loading = true;
      try {
        const { data } = await api.post('/auditor', auditorData);
        console.log('createAuditor - Resposta da API:', data);
        
        // A API retorna um objeto diretamente, não um array
        const auditor = Array.isArray(data) ? data[0] : data;
        console.log('createAuditor - Auditor criado:', auditor);
        
        await this.fetchAuditores();
        return auditor;
      } catch (error) {
        console.error('Erro ao criar auditor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAuditor(id, auditorData) {
      this.loading = true;
      try {
        await api.put(`/auditor?id=${id}`, auditorData);
        await this.fetchAuditores();
        if (this.auditorAtual?.id === id) {
          await this.fetchAuditor(id);
        }
      } catch (error) {
        console.error('Erro ao atualizar auditor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAuditor(id) {
      this.loading = true;
      try {
        await api.delete(`/auditor?id=${id}`);
        await this.fetchAuditores();
      } catch (error) {
        console.error('Erro ao deletar auditor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addNorma(auditorId, normaId) {
      try {
        const payload = { auditorId: String(auditorId), normaId: String(normaId) };
        console.log('addNorma - Enviando payload:', payload);
        const response = await api.post('/auditor/norma', payload);
        console.log('addNorma - Resposta:', response.data);
        await this.fetchAuditor(auditorId);
      } catch (error) {
        console.error('Erro ao adicionar norma:', error);
        console.error('Erro detalhado:', error.response?.data);
        throw error;
      }
    },

    async removeNorma(auditorId, normaId) {
      try {
        await api.delete('/auditor/norma', { 
          data: { auditorId: String(auditorId), normaId: String(normaId) } 
        });
        await this.fetchAuditor(auditorId);
      } catch (error) {
        console.error('Erro ao remover norma:', error);
        throw error;
      }
    },

    async addNace(auditorId, naceId) {
      try {
        const payload = { auditorId: String(auditorId), naceId: String(naceId) };
        console.log('addNace - Enviando payload:', payload);
        const response = await api.post('/auditor/nace', payload);
        console.log('addNace - Resposta:', response.data);
        await this.fetchAuditor(auditorId);
      } catch (error) {
        console.error('Erro ao adicionar nace:', error);
        console.error('Erro detalhado:', error.response?.data);
        throw error;
      }
    },

    async removeNace(auditorId, naceId) {
      try {
        await api.delete('/auditor/nace', { 
          data: { auditorId: String(auditorId), naceId: String(naceId) } 
        });
        await this.fetchAuditor(auditorId);
      } catch (error) {
        console.error('Erro ao remover nace:', error);
        throw error;
      }
    },

    setFilter(filterName, value) {
      this.filters[filterName] = value;
    },

    clearFilters() {
      this.filters = {
        cidade: '',
        estado: '',
        pesquisa: '',
        iaf: '',
        naceId: '',
        normaId: '',
        auditorStatus: '',
        inativo: null,
        revisor: null,
        desqualificado: null,
      };
    },
  },
});
