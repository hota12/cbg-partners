<template>
  <div class="pesquisa-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Pesquisar Parceiros</h1>
          <p>Encontre parceiros por normas, NACEs e localização</p>
        </div>
      </div>

      <div class="search-container">
        <div class="filters-card">
          <LoadingOverlay :show="loading" />
          
          <div class="filters-content">
            <h2>
              <i class="bi bi-funnel"></i>
              Filtros de Busca
            </h2>

          <!-- Histórico de Pesquisas -->
          <div v-if="historicoPesquisas.length > 0" class="filter-section historico-section">
            <div class="historico-header">
              <label>
                <i class="bi bi-clock-history"></i>
                Pesquisas Recentes
              </label>
              <button @click="limparHistorico" class="btn-limpar-historico" title="Limpar histórico">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div class="historico-list">
              <div 
                v-for="(pesquisa, index) in historicoPesquisas" 
                :key="index"
                @click="carregarPesquisa(pesquisa)"
                class="historico-item"
              >
                <div class="historico-content">
                  <div class="historico-tags">
                    <span v-if="pesquisa.normas?.length" class="historico-tag">
                      <i class="bi bi-file-earmark-text"></i>
                      {{ pesquisa.normas.length }} norma(s)
                    </span>
                    <span v-if="pesquisa.naces?.length" class="historico-tag">
                      <i class="bi bi-bookmark"></i>
                      {{ pesquisa.naces.length }} NACE(s)
                    </span>
                    <span v-if="pesquisa.pais" class="historico-tag">
                      <i class="bi bi-globe"></i>
                      {{ pesquisa.pais }}
                    </span>
                    <span v-if="pesquisa.estado" class="historico-tag">
                      <i class="bi bi-geo-alt"></i>
                      {{ pesquisa.estado }}
                    </span>
                    <span v-if="pesquisa.auditorStatus" class="historico-tag">
                      <i class="bi bi-person-check"></i>
                      {{ getStatusLabel(pesquisa.auditorStatus) }}
                    </span>
                    <span v-if="pesquisa.revisor" class="historico-tag">
                      <i class="bi bi-person-badge"></i>
                      Revisor
                    </span>
                  </div>
                  <small class="historico-data">{{ formatarData(pesquisa.data) }}</small>
                </div>
                <button 
                  @click.stop="removerPesquisa(index)" 
                  class="btn-remover-pesquisa"
                  title="Remover"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Normas -->
          <div class="filter-section">
            <label>
              <i class="bi bi-file-earmark-text"></i>
              Normas
            </label>
            <div class="checkbox-group">
              <label v-for="norma in normas" :key="norma.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="norma.id"
                  v-model="filtros.normas"
                />
                <span>{{ norma.norma }}</span>
              </label>
            </div>
          </div>

          <!-- NACEs -->
          <div class="filter-section">
            <label>
              <i class="bi bi-bookmark"></i>
              NACEs
            </label>
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input 
                type="text" 
                v-model="naceSearch"
                placeholder="Buscar NACE..."
              />
            </div>
            <div class="checkbox-group scrollable">
              <label 
                v-for="nace in nacesFiltered" 
                :key="nace.id" 
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="nace.id"
                  v-model="filtros.naces"
                />
                <span>
                  <strong>{{ nace.nace }}</strong> - {{ nace.descricao }}
                  <small class="iaf-badge">IAF {{ nace.iaf }}</small>
                </span>
              </label>
            </div>
          </div>

          <!-- Localização -->
          <div class="filter-section">
            <label>
              <i class="bi bi-geo-alt"></i>
              Localização
            </label>
            
            <div class="location-fields">
              <div class="form-group">
                <label>País</label>
                <div class="custom-select-wrapper">
                  <input 
                    type="text" 
                    v-model="paisSearch"
                    @focus="showPaisDropdown = true"
                    @blur="setTimeout(() => showPaisDropdown = false, 200)"
                    placeholder="Digite para pesquisar ou deixe vazio..."
                    class="custom-select-input"
                    autocomplete="off"
                  />
                  <div v-if="showPaisDropdown && paisesFiltered.length > 0" class="custom-dropdown">
                    <div 
                      @click="selectPais('')"
                      class="dropdown-item"
                      :class="{ 'active': filtros.pais === '' }"
                    >
                      <em>Todos os países</em>
                    </div>
                    <div 
                      v-for="pais in paisesFiltered" 
                      :key="pais" 
                      @click="selectPais(pais)"
                      class="dropdown-item"
                      :class="{ 'active': filtros.pais === pais }"
                    >
                      {{ pais }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Estado</label>
                <div v-if="estados.length > 0" class="custom-select-wrapper">
                  <input 
                    type="text" 
                    v-model="estadoSearch"
                    @focus="showEstadoDropdown = true"
                    @blur="setTimeout(() => showEstadoDropdown = false, 200)"
                    placeholder="Digite para pesquisar ou deixe vazio..."
                    class="custom-select-input"
                    :disabled="!filtros.pais"
                    autocomplete="off"
                  />
                  <div v-if="showEstadoDropdown && estadosFiltered.length > 0" class="custom-dropdown">
                    <div 
                      @click="selectEstado(null)"
                      class="dropdown-item"
                      :class="{ 'active': filtros.estado === '' }"
                    >
                      <em>Todos os estados</em>
                    </div>
                    <div 
                      v-for="estado in estadosFiltered" 
                      :key="estado.sigla" 
                      @click="selectEstado(estado)"
                      class="dropdown-item"
                      :class="{ 'active': filtros.estado === estado.nome }"
                    >
                      {{ estado.nome }}
                    </div>
                  </div>
                </div>
                <input 
                  v-else
                  type="text" 
                  v-model="filtros.estado" 
                  :disabled="!filtros.pais"
                  :placeholder="!filtros.pais ? 'Selecione um país primeiro' : 'Digite o estado ou deixe vazio'"
                />
              </div>

              <div class="form-group">
                <label>Cidade</label>
                <div v-if="cidades.length > 0" class="custom-select-wrapper">
                  <input 
                    type="text" 
                    v-model="cidadeSearch"
                    @focus="showCidadeDropdown = true"
                    @blur="setTimeout(() => showCidadeDropdown = false, 200)"
                    placeholder="Digite para pesquisar ou deixe vazio..."
                    class="custom-select-input"
                    :disabled="!filtros.estado || loadingCidades"
                    autocomplete="off"
                  />
                  <div v-if="showCidadeDropdown && cidadesFiltered.length > 0" class="custom-dropdown">
                    <div 
                      @click="selectCidade('')"
                      class="dropdown-item"
                      :class="{ 'active': filtros.cidade === '' }"
                    >
                      <em>Todas as cidades</em>
                    </div>
                    <div 
                      v-for="cidade in cidadesFiltered" 
                      :key="cidade" 
                      @click="selectCidade(cidade)"
                      class="dropdown-item"
                      :class="{ 'active': filtros.cidade === cidade }"
                    >
                      {{ cidade }}
                    </div>
                  </div>
                </div>
                <input 
                  v-else
                  type="text" 
                  v-model="filtros.cidade" 
                  :disabled="!filtros.estado || loadingCidades"
                  :placeholder="loadingCidades ? 'Carregando...' : (!filtros.estado ? 'Selecione um estado primeiro' : 'Digite a cidade ou deixe vazio')"
                />
              </div>
            </div>
          </div>

          <!-- Status do Auditor -->
          <div class="filter-section">
            <label>
              <i class="bi bi-person-check"></i>
              Status do Auditor
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  value=""
                  v-model="filtros.auditorStatus"
                />
                <span>Todos</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  value="aptoAuditoria"
                  v-model="filtros.auditorStatus"
                />
                <span>Apto Auditoria</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  value="emFormacao"
                  v-model="filtros.auditorStatus"
                />
                <span>Em Formação</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  value="primeiraAuditoria"
                  v-model="filtros.auditorStatus"
                />
                <span>Primeira Auditoria</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  value="auditorInativo"
                  v-model="filtros.auditorStatus"
                />
                <span>Auditor Inativo</span>
              </label>
            </div>
          </div>

          <!-- Revisor -->
          <div class="filter-section">
            <label>
              <i class="bi bi-person-badge"></i>
              Revisor
            </label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="filtros.revisor"
                />
                <span>Apenas Revisores</span>
              </label>
            </div>
          </div>
          </div>

          <!-- Ações -->
          <div class="filter-footer">
            <button @click="limparFiltros" class="btn btn-secondary">
              <i class="bi bi-x-circle"></i>
              Limpar
            </button>
            <ButtonLoader @click="buscar" :loading="searching">
              <i class="bi bi-search"></i>
              Buscar
            </ButtonLoader>
          </div>
        </div>

        <!-- Resultados -->
        <div class="results-card">
          <div class="results-header">
            <h2>
              <i class="bi bi-list-ul"></i>
              Resultados
              <span v-if="resultados.length > 0" class="count-badge">{{ resultados.length }}</span>
            </h2>
          </div>

          <div v-if="!searched" class="empty-state">
            <i class="bi bi-search"></i>
            <p>Configure os filtros e clique em "Buscar"</p>
          </div>

          <div v-else-if="resultados.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>Nenhum parceiro encontrado</p>
            <small>Tente ajustar os filtros de busca</small>
          </div>

          <div v-else class="results-list">
            <div 
              v-for="auditor in resultados" 
              :key="auditor.id"
              @click="$router.push(`/auditor/${auditor.id}`)"
              class="result-item"
            >
              <div class="result-info">
                <div class="result-header-item">
                  <h3>{{ auditor.nome }}</h3>
                  <div class="result-badges">
                    <span v-if="auditor.revisor" class="badge badge-info">Revisor</span>
                    <span :class="['badge', getStatusClass(auditor.auditorStatus)]">
                      {{ getStatusLabel(auditor.auditorStatus) }}
                    </span>
                  </div>
                </div>

                <div class="result-details">
                  <div class="detail-item">
                    <i class="bi bi-geo-alt"></i>
                    <span>{{ auditor.cidade }}, {{ auditor.estado }}, {{ auditor.pais }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-envelope"></i>
                    <span>{{ auditor.email }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-telephone"></i>
                    <span>{{ auditor.telefone }}</span>
                  </div>
                </div>

                <div v-if="auditor.Normas?.length > 0" class="result-tags">
                  <strong>Normas:</strong>
                  <span v-for="norma in auditor.Normas" :key="norma.id" class="tag">
                    {{ getNormaLabel(norma.normaId) }}
                  </span>
                </div>

                <div v-if="auditor.Nace?.length > 0" class="result-tags">
                  <strong>NACEs:</strong>
                  <span v-for="nace in auditor.Nace.slice(0, 3)" :key="nace.id" class="tag tag-nace">
                    {{ getNaceLabel(nace.naceId) }}
                  </span>
                  <span v-if="auditor.Nace.length > 3" class="tag tag-more">
                    +{{ auditor.Nace.length - 3 }} mais
                  </span>
                </div>
              </div>

              <div class="result-arrow">
                <i class="bi bi-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNormasStore } from '../stores/normas';
import { useNacesStore } from '../stores/naces';
import { useAuditoresStore } from '../stores/auditores';
import { useToast } from '../composables/useToast';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import ButtonLoader from '../components/ButtonLoader.vue';

const router = useRouter();
const normasStore = useNormasStore();
const nacesStore = useNacesStore();
const auditoresStore = useAuditoresStore();
const toast = useToast();

const loading = ref(false);
const searching = ref(false);
const searched = ref(false);
const naceSearch = ref('');
const resultados = ref([]);
const loadingEstados = ref(false);
const loadingCidades = ref(false);
const paisSearch = ref('');
const estadoSearch = ref('');
const cidadeSearch = ref('');
const showPaisDropdown = ref(false);
const showEstadoDropdown = ref(false);
const showCidadeDropdown = ref(false);
const historicoPesquisas = ref([]);

const filtros = ref({
  normas: [],
  naces: [],
  pais: '',
  estado: '',
  cidade: '',
  auditorStatus: '',
  revisor: false,
});

const paises = ref([]);
const estados = ref([]);
const cidades = ref([]);

const normas = computed(() => normasStore.normas);

const nacesFiltered = computed(() => {
  if (!naceSearch.value) return nacesStore.naces;
  const termo = naceSearch.value.toLowerCase();
  return nacesStore.naces.filter(n => 
    n.nace.toLowerCase().includes(termo) ||
    n.descricao.toLowerCase().includes(termo) ||
    n.iaf.includes(termo)
  );
});

const paisesFiltered = computed(() => {
  if (!paisSearch.value) return paises.value;
  const termo = paisSearch.value.toLowerCase();
  return paises.value.filter(p => p.toLowerCase().includes(termo));
});

const estadosFiltered = computed(() => {
  if (!estadoSearch.value) return estados.value;
  const termo = estadoSearch.value.toLowerCase();
  return estados.value.filter(e => 
    e.nome.toLowerCase().includes(termo) || 
    e.sigla.toLowerCase().includes(termo)
  );
});

const cidadesFiltered = computed(() => {
  if (!cidadeSearch.value) return cidades.value;
  const termo = cidadeSearch.value.toLowerCase();
  return cidades.value.filter(c => c.toLowerCase().includes(termo));
});

const fetchPaises = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations');
    const data = await response.json();
    paises.value = data
      .map(country => country.translations?.por?.common || country.name.common)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } catch (error) {
    console.error('Erro ao carregar países:', error);
    paises.value = ['Brasil', 'Portugal', 'Argentina', 'Chile', 'Estados Unidos', 'Espanha'];
  }
};

const fetchEstados = async (pais, limparCampos = true) => {
  estados.value = [];
  
  if (limparCampos) {
    filtros.value.estado = '';
    filtros.value.cidade = '';
    cidades.value = [];
  }

  if (!pais) return;

  loadingEstados.value = true;
  try {
    // Para o Brasil, usar API do IBGE
    if (pais === 'Brasil') {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      const data = await response.json();
      estados.value = data.map(estado => ({
        sigla: estado.sigla,
        nome: estado.nome
      }));
    } else {
      // Mapeamento de nomes em português para inglês (API usa nomes em inglês)
      const paisMap = {
        'Estados Unidos': 'United States',
        'Reino Unido': 'United Kingdom',
        'África do Sul': 'South Africa',
        'Arábia Saudita': 'Saudi Arabia',
        'Emirados Árabes Unidos': 'United Arab Emirates',
        'Nova Zelândia': 'New Zealand',
        'Países Baixos': 'Netherlands',
        'República Tcheca': 'Czech Republic',
        'Coreia do Sul': 'South Korea',
        'Coreia do Norte': 'North Korea'
      };

      const paisParaAPI = paisMap[pais] || pais;
      
      console.log(`Buscando estados para: ${paisParaAPI}`);
      
      // Para outros países, usar API universal de estados
      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: paisParaAPI })
      });
      const data = await response.json();
      
      console.log(`Resposta estados:`, data);
      
      if (data.error === false && data.data.states && data.data.states.length > 0) {
        estados.value = data.data.states.map(state => ({
          sigla: state.state_code || state.name.substring(0, 2).toUpperCase(),
          nome: state.name
        })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        console.log(`${estados.value.length} estados carregados`);
      } else {
        console.log(`Nenhum estado encontrado para ${pais}. Permitindo entrada manual.`);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar estados:', error);
  } finally {
    loadingEstados.value = false;
  }
};

const fetchCidades = async (pais, estadoNome, limparCampo = true) => {
  if (!pais || !estadoNome) return;
  loadingCidades.value = true;
  
  if (limparCampo) {
    cidades.value = [];
  }
  
  try {
    // Para o Brasil, usar API do IBGE (precisa da sigla)
    if (pais === 'Brasil') {
      const estadoObj = estados.value.find(e => e.nome === estadoNome);
      const estadoSigla = estadoObj?.sigla || estadoNome;
      
      console.log(`Buscando cidades para Brasil - ${estadoNome} (${estadoSigla})`);
      
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`);
      const data = await response.json();
      cidades.value = data.map(cidade => cidade.nome);
      console.log(`${cidades.value.length} cidades carregadas`);
    } else {
      // Mapeamento de nomes para a API
      const paisMap = {
        'Estados Unidos': 'United States',
        'Reino Unido': 'United Kingdom',
        'África do Sul': 'South Africa',
        'Arábia Saudita': 'Saudi Arabia',
        'Emirados Árabes Unidos': 'United Arab Emirates',
        'Nova Zelândia': 'New Zealand',
        'Países Baixos': 'Netherlands',
        'República Tcheca': 'Czech Republic',
        'Coreia do Sul': 'South Korea',
        'Coreia do Norte': 'North Korea'
      };

      const paisParaAPI = paisMap[pais] || pais;
      
      console.log(`Buscando cidades para: ${paisParaAPI} - ${estadoNome}`);
      
      // Para outros países, usar API universal de cidades
      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          country: paisParaAPI,
          state: estadoNome
        })
      });
      const data = await response.json();
      
      console.log(`Resposta cidades:`, data);
      
      if (data.error === false && data.data) {
        cidades.value = data.data.sort((a, b) => a.localeCompare(b, 'pt-BR'));
        console.log(`${cidades.value.length} cidades carregadas`);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
    cidades.value = [];
  } finally {
    loadingCidades.value = false;
  }
};

const selectPais = (pais) => {
  filtros.value.pais = pais;
  paisSearch.value = pais;
  showPaisDropdown.value = false;
  if (pais) {
    fetchEstados(pais);
  } else {
    estados.value = [];
    filtros.value.estado = '';
    filtros.value.cidade = '';
    estadoSearch.value = '';
    cidadeSearch.value = '';
    cidades.value = [];
  }
};

const selectEstado = (estado) => {
  if (!estado) {
    filtros.value.estado = '';
    estadoSearch.value = '';
  } else {
    filtros.value.estado = estado.nome;
    estadoSearch.value = estado.nome;
    if (estado.sigla) {
      fetchCidades(filtros.value.pais, estado.nome);
    }
  }
  showEstadoDropdown.value = false;
  filtros.value.cidade = '';
  cidadeSearch.value = '';
  cidades.value = [];
};

const selectCidade = (cidade) => {
  filtros.value.cidade = cidade;
  cidadeSearch.value = cidade;
  showCidadeDropdown.value = false;
};

const onPaisChange = () => {
  fetchEstados(filtros.value.pais);
};

const onEstadoChange = () => {
  filtros.value.cidade = '';
  cidades.value = [];
  if (filtros.value.estado) {
    fetchCidades(filtros.value.pais, filtros.value.estado);
  }
};

const carregarHistorico = () => {
  try {
    const historico = localStorage.getItem('historicoPesquisas');
    if (historico) {
      historicoPesquisas.value = JSON.parse(historico);
    }
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  }
};

const salvarHistorico = () => {
  try {
    localStorage.setItem('historicoPesquisas', JSON.stringify(historicoPesquisas.value));
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
  }
};

const adicionarAoHistorico = (searchParams) => {
  const novaPesquisa = {
    ...searchParams,
    data: new Date().toISOString()
  };
  
  // Remove pesquisa duplicada se existir
  historicoPesquisas.value = historicoPesquisas.value.filter(p => 
    JSON.stringify({ normas: p.normas, naces: p.naces, pais: p.pais, estado: p.estado, cidade: p.cidade, auditorStatus: p.auditorStatus, revisor: p.revisor }) !==
    JSON.stringify({ normas: searchParams.normas, naces: searchParams.naces, pais: searchParams.pais, estado: searchParams.estado, cidade: searchParams.cidade, auditorStatus: searchParams.auditorStatus, revisor: searchParams.revisor })
  );
  
  // Adiciona no início
  historicoPesquisas.value.unshift(novaPesquisa);
  
  // Mantém apenas as últimas 5 pesquisas
  if (historicoPesquisas.value.length > 5) {
    historicoPesquisas.value = historicoPesquisas.value.slice(0, 5);
  }
  
  salvarHistorico();
};

const carregarPesquisa = async (pesquisa) => {
  // Restaura os filtros básicos
  filtros.value = {
    normas: pesquisa.normas || [],
    naces: pesquisa.naces || [],
    pais: pesquisa.pais || '',
    estado: pesquisa.estado || '',
    cidade: pesquisa.cidade || '',
    auditorStatus: pesquisa.auditorStatus || '',
    revisor: pesquisa.revisor || false,
  };
  
  // Restaura os campos de busca de localização
  paisSearch.value = pesquisa.pais || '';
  estadoSearch.value = pesquisa.estado || '';
  cidadeSearch.value = pesquisa.cidade || '';
  
  // Carrega estados e cidades se necessário (sem limpar os campos)
  if (pesquisa.pais) {
    await fetchEstados(pesquisa.pais, false);
    
    if (pesquisa.estado) {
      await fetchCidades(pesquisa.pais, pesquisa.estado, false);
    }
  }
  
  toast.success('Pesquisa carregada do histórico');
};

const removerPesquisa = (index) => {
  historicoPesquisas.value.splice(index, 1);
  salvarHistorico();
};

const limparHistorico = () => {
  if (confirm('Deseja realmente limpar todo o histórico de pesquisas?')) {
    historicoPesquisas.value = [];
    localStorage.removeItem('historicoPesquisas');
    toast.success('Histórico limpo');
  }
};

const formatarData = (dataISO) => {
  const data = new Date(dataISO);
  const agora = new Date();
  const diffMs = agora - data;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      normasStore.fetchNormas(),
      nacesStore.fetchNaces(),
      fetchPaises(),
    ]);
    carregarHistorico();
  } catch (error) {
    toast.error('Erro ao carregar dados');
  } finally {
    loading.value = false;
  }
});

const buscar = async () => {
  searching.value = true;
  searched.value = true;

  try {
    const searchParams = {};

    // Adiciona apenas os filtros preenchidos
    if (filtros.value.normas.length > 0) {
      searchParams.normas = filtros.value.normas.map(String);
    }
    if (filtros.value.naces.length > 0) {
      searchParams.naces = filtros.value.naces.map(String);
    }
    if (filtros.value.pais) {
      searchParams.pais = filtros.value.pais;
    }
    if (filtros.value.estado) {
      searchParams.estado = filtros.value.estado;
    }
    if (filtros.value.cidade) {
      searchParams.cidade = filtros.value.cidade;
    }
    if (filtros.value.auditorStatus) {
      searchParams.auditorStatus = filtros.value.auditorStatus;
    }
    if (filtros.value.revisor) {
      searchParams.revisor = true;
    }

    console.log('Enviando busca:', searchParams);

    const data = await auditoresStore.searchAuditores(searchParams);
    resultados.value = data;

    console.log('Resultados:', data);

    // Adiciona ao histórico se houver algum filtro
    if (Object.keys(searchParams).length > 0) {
      adicionarAoHistorico(searchParams);
    }

    if (data.length === 0) {
      toast.info('Nenhum parceiro encontrado com esses critérios');
    } else {
      toast.success(`${data.length} parceiro(s) encontrado(s)`);
    }
  } catch (error) {
    console.error('Erro ao buscar:', error);
    toast.error('Erro ao realizar busca');
    resultados.value = [];
  } finally {
    searching.value = false;
  }
};

const limparFiltros = () => {
  filtros.value = {
    normas: [],
    naces: [],
    pais: '',
    estado: '',
    cidade: '',
    auditorStatus: '',
    revisor: false,
  };
  resultados.value = [];
  searched.value = false;
  naceSearch.value = '';
  paisSearch.value = '';
  estadoSearch.value = '';
  cidadeSearch.value = '';
  estados.value = [];
  cidades.value = [];
};

const getNormaLabel = (normaId) => {
  const norma = normasStore.normas.find(n => String(n.id) === String(normaId));
  return norma?.norma || normaId;
};

const getNaceLabel = (naceId) => {
  const nace = nacesStore.naces.find(n => String(n.id) === String(naceId));
  return nace?.nace || naceId;
};

const getStatusLabel = (status) => {
  if (!status) return 'Sem Status';
  const labels = {
    aptoAuditoria: 'Apto Auditoria',
    emFormacao: 'Em Formação',
    primeiraAuditoria: 'Primeira Auditoria',
    auditorInativo: 'Auditor Inativo',
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    aptoAuditoria: 'badge-success',
    emFormacao: 'badge-warning',
    primeiraAuditoria: 'badge-info',
    auditorInativo: 'badge-danger',
  };
  return classes[status] || 'badge-secondary';
};
</script>

<style scoped>
.pesquisa-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.search-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}

/* Filters Card */
.filters-card {
  position: sticky;
  top: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filters-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  padding-bottom: 0;
}

.filters-card h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.filter-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-section:last-of-type {
  border-bottom: none;
}

/* Histórico de Pesquisas */
.historico-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: none;
}

.historico-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.btn-limpar-historico {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-limpar-historico:hover {
  background: #e0e0e0;
  color: #e70d0c;
}

.historico-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.historico-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.historico-item:hover {
  border-color: #e70d0c;
  background: #fff5f5;
}

.historico-content {
  flex: 1;
  min-width: 0;
}

.historico-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.historico-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.historico-tag i {
  font-size: 10px;
}

.historico-data {
  display: block;
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.btn-remover-pesquisa {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.btn-remover-pesquisa:hover {
  background: #fee;
  color: #e70d0c;
}

.filter-section > label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-group.scrollable {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f8f9fa;
  border-color: #e70d0c;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #e70d0c;
}

.checkbox-label span {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:hover {
  background: #f8f9fa;
  border-color: #e70d0c;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #e70d0c;
}

.radio-label span {
  font-size: 14px;
  color: #333;
}

.iaf-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
}

.search-box input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.location-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.form-group select,
.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.form-group select:disabled,
.form-group input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.filter-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 0 0 12px 12px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Results Card */
.results-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.results-header {
  margin-bottom: 24px;
}

.results-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  background: #e70d0c;
  color: white;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.empty-state small {
  font-size: 14px;
  color: #bbb;
  margin-top: 8px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #e70d0c;
  background: #fff5f5;
  transform: translateX(4px);
}

.result-info {
  flex: 1;
}

.result-header-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.result-header-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #001e66;
  margin: 0;
}

.result-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-info {
  background: #cfe2ff;
  color: #084298;
}

.badge-success {
  background: #d1e7dd;
  color: #0f5132;
}

.badge-warning {
  background: #fff3cd;
  color: #664d03;
}

.badge-secondary {
  background: #e2e3e5;
  color: #41464b;
}

.result-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.detail-item i {
  color: #999;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.result-tags strong {
  font-size: 13px;
  color: #666;
}

.tag {
  padding: 4px 10px;
  background: #f0f0f0;
  color: #333;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag-nace {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-more {
  background: #e0e0e0;
  color: #666;
  font-weight: 600;
}

.result-arrow {
  color: #e70d0c;
  font-size: 24px;
}

/* Custom Dropdown Styles */
.custom-select-wrapper {
  position: relative;
}

.custom-select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
}

.custom-select-input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.custom-select-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.custom-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.dropdown-item {
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #e70d0c;
}

.dropdown-item.active {
  background: #e70d0c;
  color: white;
  font-weight: 600;
}

.dropdown-item em {
  color: #666;
  font-style: italic;
}

.custom-dropdown::-webkit-scrollbar {
  width: 8px;
}

.custom-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.custom-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

.custom-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 1024px) {
  .search-container {
    grid-template-columns: 1fr;
  }

  .filters-card {
    position: relative;
    top: 0;
    max-height: none;
  }
}
</style>
