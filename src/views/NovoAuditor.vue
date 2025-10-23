<template>
  <div class="novo-auditor-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <button @click="$router.back()" class="btn-back">
          <i class="bi bi-arrow-left"></i>
          Voltar
        </button>
        <h1>Cadastrar Novo Parceiro</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="auditor-form">
        <LoadingOverlay :show="loading" />

        <!-- Dados Pessoais -->
        <div class="form-section">
          <h2>
            <i class="bi bi-person"></i>
            Dados Pessoais
          </h2>
          
          <div class="form-grid">
            <div class="form-group col-2">
              <label>Nome Completo *</label>
              <input type="text" v-model="form.nome" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input type="email" v-model="form.email" required />
            </div>

            <div class="form-group">
              <label>CPF *</label>
              <input 
                type="text" 
                v-model="form.cpf" 
                @input="handleCPFInput"
                placeholder="000.000.000-00"
                maxlength="14"
                required 
              />
            </div>

            <div class="form-group">
              <label>Telefone *</label>
              <input type="tel" v-model="form.telefone" required />
            </div>

            <div class="form-group">
              <label>Estado Civil *</label>
              <select v-model="form.estado_civil" required>
                <option value="">Selecione</option>
                <option value="Solteiro">Solteiro</option>
                <option value="Casado">Casado</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viúvo">Viúvo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="form-section">
          <h2>
            <i class="bi bi-geo-alt"></i>
            Endereço
          </h2>
          
          <div class="form-grid">
            <div class="form-group col-2">
              <label>Endereço *</label>
              <input type="text" v-model="form.endereco" required />
            </div>

            <div class="form-group">
              <label>País *</label>
              <div class="custom-select-wrapper">
                <input 
                  type="text" 
                  v-model="paisSearch"
                  @focus="showPaisDropdown = true"
                  @blur="setTimeout(() => showPaisDropdown = false, 200)"
                  placeholder="Digite para pesquisar país..."
                  class="custom-select-input"
                  autocomplete="off"
                  required
                />
                <input type="hidden" v-model="form.pais" required />
                <div v-if="showPaisDropdown && paisesFiltered.length > 0" class="custom-dropdown">
                  <div 
                    v-for="pais in paisesFiltered" 
                    :key="pais" 
                    @click="selectPais(pais)"
                    class="dropdown-item"
                    :class="{ 'active': form.pais === pais }"
                  >
                    {{ pais }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Estado/Província *</label>
              <div v-if="estados.length > 0" class="custom-select-wrapper">
                <input 
                  type="text" 
                  v-model="estadoSearch"
                  @focus="showEstadoDropdown = true"
                  @blur="setTimeout(() => showEstadoDropdown = false, 200)"
                  placeholder="Digite para pesquisar estado..."
                  class="custom-select-input"
                  :disabled="!form.pais"
                  autocomplete="off"
                  required
                />
                <input type="hidden" v-model="form.estado" required />
                <div v-if="showEstadoDropdown && estadosFiltered.length > 0" class="custom-dropdown">
                  <div 
                    v-for="estado in estadosFiltered" 
                    :key="estado.sigla" 
                    @click="selectEstado(estado)"
                    class="dropdown-item"
                    :class="{ 'active': form.estado === estado.nome }"
                  >
                    {{ estado.nome }}
                  </div>
                </div>
              </div>
              <input 
                v-else
                type="text" 
                v-model="form.estado" 
                required 
                :disabled="!form.pais"
                :placeholder="!form.pais ? 'Selecione um país primeiro' : 'Digite o estado/província'"
                @input="handleEstadoChange"
              />
            </div>

            <div class="form-group">
              <label>Cidade *</label>
              <div v-if="cidades.length > 0" class="custom-select-wrapper">
                <input 
                  type="text" 
                  v-model="cidadeSearch"
                  @focus="showCidadeDropdown = true"
                  @blur="setTimeout(() => showCidadeDropdown = false, 200)"
                  placeholder="Digite para pesquisar cidade..."
                  class="custom-select-input"
                  :disabled="!form.estado || loadingCidades"
                  autocomplete="off"
                  required
                />
                <input type="hidden" v-model="form.cidade" required />
                <div v-if="showCidadeDropdown && cidadesFiltered.length > 0" class="custom-dropdown">
                  <div 
                    v-for="cidade in cidadesFiltered" 
                    :key="cidade" 
                    @click="selectCidade(cidade)"
                    class="dropdown-item"
                    :class="{ 'active': form.cidade === cidade }"
                  >
                    {{ cidade }}
                  </div>
                </div>
              </div>
              <input 
                v-else
                type="text" 
                v-model="form.cidade" 
                required 
                :disabled="!form.estado || loadingCidades"
                :placeholder="loadingCidades ? 'Carregando...' : (!form.estado ? 'Selecione um estado primeiro' : 'Digite a cidade')"
              />
            </div>
          </div>
        </div>

        <!-- Empresa -->
        <div class="form-section">
          <h2>
            <i class="bi bi-building"></i>
            Dados da Empresa
          </h2>
          
          <div class="form-grid">
            <div class="form-group col-2">
              <label>Empresa</label>
              <input type="text" v-model="form.empresa" />
            </div>

            <div class="form-group col-2">
              <label>CNPJ</label>
              <input 
                type="text" 
                v-model="form.cnpj" 
                @input="handleCNPJInput"
                placeholder="00.000.000/0000-00"
                maxlength="18"
              />
            </div>
          </div>
        </div>

        <!-- Status e Qualificações -->
        <div class="form-section">
          <h2>
            <i class="bi bi-shield-check"></i>
            Status e Qualificações
          </h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Status do Parceiro</label>
              <select v-model="form.auditorStatus">
                <option value="">Sem Status</option>
                <option value="aptoAuditoria">Apto para Auditoria</option>
                <option value="emFormacao">Em Formação</option>
                <option value="primeiraAuditoria">Primeira Auditoria</option>
                <option value="auditorInativo">Auditor Inativo</option>
              </select>
            </div>

            <div class="form-group">
              <label>Revisor</label>
              <select v-model="form.revisor">
                <option :value="true">Sim</option>
                <option :value="false">Não</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Normas -->
        <div class="form-section">
          <h2>
            <i class="bi bi-file-earmark-text"></i>
            Normas
          </h2>
          
          <div class="normas-selection">
            <div v-for="norma in normas" :key="norma.id" class="norma-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="norma.id"
                  v-model="selectedNormas"
                />
                <span>{{ norma.norma }}</span>
              </label>
              
              <div v-if="selectedNormas.includes(norma.id)" class="norma-qualificacoes">
                <div class="qualificacoes-header">
                  <span class="qualificacoes-required">* Selecione pelo menos uma qualificação:</span>
                </div>
                <label class="qualificacao-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="getNormaQualificacao(norma.id, 'auditorLider')"
                    @change="toggleNormaQualificacao(norma.id, 'auditorLider', $event.target.checked)"
                  />
                  <span class="qualificacao-label">
                    <i class="bi bi-star-fill"></i>
                    Auditor Líder
                  </span>
                </label>
                <label class="qualificacao-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="getNormaQualificacao(norma.id, 'especialista')"
                    @change="toggleNormaQualificacao(norma.id, 'especialista', $event.target.checked)"
                  />
                  <span class="qualificacao-label">
                    <i class="bi bi-award-fill"></i>
                    Especialista
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- NACE -->
        <div class="form-section">
          <h2>
            <i class="bi bi-bookmark"></i>
            NACE
          </h2>
          
          <div class="nace-selection">
            <div class="nace-filters">
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input 
                  type="text" 
                  v-model="naceSearch"
                  placeholder="Buscar NACE..."
                />
              </div>
              
              <select v-model="selectedIafFilter" class="iaf-filter-select">
                <option value="">Todos os IAFs</option>
                <option v-for="iaf in iafsDisponiveis" :key="iaf" :value="iaf">
                  IAF {{ iaf }}
                </option>
              </select>
              
              <button 
                v-if="selectedIafFilter" 
                @click="toggleAllNacesFromIaf"
                type="button"
                class="btn-toggle-iaf"
                :class="{ 'all-selected': areAllIafNacesSelected }"
              >
                <i :class="areAllIafNacesSelected ? 'bi bi-check-square-fill' : 'bi bi-square'"></i>
                {{ areAllIafNacesSelected ? 'Desmarcar' : 'Selecionar' }} todos IAF {{ selectedIafFilter }}
              </button>
            </div>

            <div class="nace-list">
              <label 
                v-for="nace in filteredNaces" 
                :key="nace.id" 
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="nace.id"
                  v-model="selectedNaces"
                />
                <span>
                  <strong>{{ nace.nace }}</strong> - {{ nace.descricao }}
                  <small class="iaf-badge">IAF {{ nace.iaf }}</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Preços -->
        <div class="form-section">
          <h2>
            <i class="bi bi-currency-dollar"></i>
            Tabela de Preços (Opcional)
          </h2>
          
          <div class="pricing-section">
            <div v-if="selectedPricing.length > 0" class="pricing-list">
              <div v-for="(item, index) in selectedPricing" :key="index" class="pricing-item">
                <div class="pricing-info">
                  <div class="produto-with-icon">
                    <i :class="getProdutoIcon(item.produtoId)" class="produto-icon-list"></i>
                    <div class="produto-details-list">
                      <span class="produto-name">{{ getProdutoNome(item.produtoId) }}</span>
                      <span v-if="getProdutoUnidade(item.produtoId)" class="produto-unidade-small">
                        {{ getProdutoUnidade(item.produtoId) }}
                      </span>
                    </div>
                  </div>
                  <span class="pricing-value">R$ {{ formatPrice(item.preco) }}</span>
                </div>
                <button 
                  type="button"
                  @click="removePricing(index)" 
                  class="btn-remove-pricing"
                  title="Remover"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div v-else class="empty-pricing-message">
              <i class="bi bi-info-circle"></i>
              <p>Nenhum preço adicionado. Você pode adicionar depois.</p>
            </div>

            <div class="add-pricing-form">
              <select v-model="newPricing.produtoId" class="pricing-select">
                <option value="">Selecione um produto</option>
                <option 
                  v-for="produto in produtosDisponiveis" 
                  :key="produto.id" 
                  :value="produto.id"
                >
                  {{ produto.nome }}{{ produto.unidade ? ` (${produto.unidade})` : '' }}
                </option>
              </select>
              <input 
                type="number" 
                step="0.01"
                v-model="newPricing.preco"
                placeholder="Preço (R$)"
                class="pricing-input"
              />
              <button 
                type="button"
                @click="addPricingToList" 
                class="btn btn-add-pricing-inline"
                :disabled="!newPricing.produtoId || !newPricing.preco"
              >
                <i class="bi bi-plus-lg"></i>
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-secondary">
            Cancelar
          </button>
          <ButtonLoader type="submit" :loading="saving">
            <i class="bi bi-check-lg"></i>
            Cadastrar Parceiro
          </ButtonLoader>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuditoresStore } from '../stores/auditores';
import { useNormasStore } from '../stores/normas';
import { useNacesStore } from '../stores/naces';
import { useProdutosStore } from '../stores/produtos';
import { usePricingStore } from '../stores/pricing';
import { useToast } from '../composables/useToast';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import ButtonLoader from '../components/ButtonLoader.vue';

const router = useRouter();
const auditoresStore = useAuditoresStore();
const normasStore = useNormasStore();
const nacesStore = useNacesStore();
const produtosStore = useProdutosStore();
const pricingStore = usePricingStore();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const naceSearch = ref('');
const selectedIafFilter = ref('');
const paisSearch = ref('');
const estadoSearch = ref('');
const cidadeSearch = ref('');
const showPaisDropdown = ref(false);
const showEstadoDropdown = ref(false);
const showCidadeDropdown = ref(false);

const form = ref({
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  estado_civil: '',
  endereco: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  empresa: '',
  cnpj: '',
  auditorStatus: '',
  inativo: false,
  desqualificado: false,
  revisor: false,
});

const selectedNormas = ref([]);
const normasQualificacoes = ref({});
const selectedNaces = ref([]);
const selectedPricing = ref([]);
const newPricing = ref({
  produtoId: '',
  preco: ''
});

const paises = ref([]);
const estados = ref([]);
const cidades = ref([]);
const loadingCidades = ref(false);

const normas = computed(() => normasStore.normas);

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

const produtosDisponiveis = computed(() => {
  const produtos = produtosStore.getProdutos;
  const produtosAdicionados = selectedPricing.value.map(p => String(p.produtoId));
  return produtos.filter(p => !produtosAdicionados.includes(String(p.id)));
});

const iafsDisponiveis = computed(() => {
  const iafs = [...new Set(nacesStore.naces.map(n => n.iaf))];
  return iafs.sort();
});

const filteredNaces = computed(() => {
  let resultado = nacesStore.naces;
  
  // Filtro por IAF
  if (selectedIafFilter.value) {
    resultado = resultado.filter(n => n.iaf === selectedIafFilter.value);
  }
  
  // Filtro por texto
  if (naceSearch.value) {
    const termo = naceSearch.value.toLowerCase();
    resultado = resultado.filter(n => 
      n.nace.toLowerCase().includes(termo) ||
      n.descricao.toLowerCase().includes(termo)
    );
  }
  
  return resultado;
});

const areAllIafNacesSelected = computed(() => {
  if (!selectedIafFilter.value) return false;
  const nacesDoIaf = filteredNaces.value.map(n => n.id);
  return nacesDoIaf.length > 0 && nacesDoIaf.every(id => selectedNaces.value.includes(id));
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

const fetchEstados = async (pais) => {
  estados.value = [];
  form.value.estado = '';
  form.value.cidade = '';
  cidades.value = [];

  if (!pais) return;

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
      console.log(`Buscando estados para: ${pais} (API: ${paisParaAPI})`);

      // Para outros países, usar API universal de estados/províncias
      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: paisParaAPI })
      });
      const data = await response.json();
      
      console.log(`Resposta da API para ${paisParaAPI}:`, data);
      
      if (data.error === false && data.data.states && data.data.states.length > 0) {
        estados.value = data.data.states.map(state => ({
          sigla: state.state_code || state.name.substring(0, 2).toUpperCase(),
          nome: state.name
        })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        console.log(`${estados.value.length} estados carregados`);
      } else {
        // Se não houver estados na API, deixar vazio para entrada manual
        console.log(`Nenhum estado encontrado para ${pais}. Permitindo entrada manual.`);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar estados:', error);
    // Não mostrar erro, apenas permitir entrada manual
  }
};

const fetchCidades = async (pais, estado) => {
  if (!pais || !estado) return;
  loadingCidades.value = true;
  cidades.value = [];
  
  try {
    // Para o Brasil, usar API do IBGE
    if (pais === 'Brasil') {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`);
      const data = await response.json();
      cidades.value = data.map(cidade => cidade.nome);
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
      const estadoNome = estados.value.find(e => e.sigla === estado)?.nome || estado;
      
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
  form.value.pais = pais;
  paisSearch.value = pais;
  showPaisDropdown.value = false;
  fetchEstados(pais);
};

const selectEstado = (estado) => {
  form.value.estado = estado.nome;
  estadoSearch.value = estado.nome;
  showEstadoDropdown.value = false;
  form.value.cidade = '';
  cidadeSearch.value = '';
  cidades.value = [];
  if (estado.sigla) {
    fetchCidades(form.value.pais, estado.sigla);
  }
};

const selectCidade = (cidade) => {
  form.value.cidade = cidade;
  cidadeSearch.value = cidade;
  showCidadeDropdown.value = false;
};

const handlePaisChange = () => {
  fetchEstados(form.value.pais);
};

const handleEstadoChange = () => {
  form.value.cidade = '';
  cidades.value = [];
  if (form.value.estado) {
    fetchCidades(form.value.pais, form.value.estado);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      normasStore.fetchNormas(),
      nacesStore.fetchNaces(),
      produtosStore.fetchProdutos(),
      fetchPaises(),
    ]);
    // Carregar estados do Brasil por padrão
    if (form.value.pais === 'Brasil') {
      await fetchEstados('Brasil');
    }
  } catch (error) {
    toast.error('Erro ao carregar dados');
  } finally {
    loading.value = false;
  }
});

const addPricingToList = () => {
  if (!newPricing.value.produtoId || !newPricing.value.preco) {
    toast.error('Selecione um produto e informe o preço');
    return;
  }

  selectedPricing.value.push({
    produtoId: newPricing.value.produtoId,
    preco: parseFloat(newPricing.value.preco)
  });

  newPricing.value = { produtoId: '', preco: '' };
};

const removePricing = (index) => {
  selectedPricing.value.splice(index, 1);
};

const getProdutoNome = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.nome || 'Produto não encontrado';
};

const getProdutoIcon = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.icon || 'bi bi-box';
};

const getProdutoUnidade = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.unidade;
};

const formatPrice = (value) => {
  return parseFloat(value).toFixed(2).replace('.', ',');
};

const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

const formatCNPJ = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 14) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

const handleCPFInput = (event) => {
  form.value.cpf = formatCPF(event.target.value);
};

const handleCNPJInput = (event) => {
  form.value.cnpj = formatCNPJ(event.target.value);
};

const getNormaQualificacao = (normaId, campo) => {
  return normasQualificacoes.value[normaId]?.[campo] || false;
};

const toggleNormaQualificacao = (normaId, campo, valor) => {
  if (!normasQualificacoes.value[normaId]) {
    normasQualificacoes.value[normaId] = {
      auditorLider: false,
      especialista: false
    };
  }
  normasQualificacoes.value[normaId][campo] = valor;
};

const toggleAllNacesFromIaf = () => {
  const nacesDoIaf = filteredNaces.value.map(n => n.id);
  
  if (areAllIafNacesSelected.value) {
    // Desmarcar todos
    selectedNaces.value = selectedNaces.value.filter(id => !nacesDoIaf.includes(id));
  } else {
    // Marcar todos (adiciona apenas os que ainda não estão selecionados)
    const novosNaces = nacesDoIaf.filter(id => !selectedNaces.value.includes(id));
    selectedNaces.value = [...selectedNaces.value, ...novosNaces];
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    // Criar auditor
    console.log('Criando parceiro com dados:', form.value);
    const auditor = await auditoresStore.createAuditor(form.value);
    
    if (!auditor || !auditor.id) {
      throw new Error('Auditor criado mas ID não retornado');
    }
    
    console.log('Parceiro criado com sucesso! ID:', auditor.id);
    console.log('Dados do auditor criado:', auditor);
    
    // Aguardar um pequeno delay para garantir que o auditor está no banco
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Adicionar normas
    if (selectedNormas.value.length > 0) {
      console.log('Adicionando normas:', selectedNormas.value);
      for (const normaId of selectedNormas.value) {
        try {
          const qualificacoes = normasQualificacoes.value[normaId] || {};
          
          // Validação: precisa ser pelo menos Líder OU Especialista
          if (!qualificacoes.auditorLider && !qualificacoes.especialista) {
            const normaNome = normasStore.normas.find(n => n.id === normaId)?.norma || 'Norma';
            toast.error(`${normaNome}: Selecione pelo menos uma qualificação (Auditor Líder ou Especialista)`);
            throw new Error('Qualificação não selecionada');
          }
          
          console.log(`Chamando addNorma(${auditor.id}, ${normaId}, ${qualificacoes.auditorLider}, ${qualificacoes.especialista})`);
          await auditoresStore.addNorma(
            auditor.id, 
            normaId,
            qualificacoes.auditorLider,
            qualificacoes.especialista
          );
          console.log(`✓ Norma ${normaId} adicionada com sucesso`);
        } catch (error) {
          console.error(`✗ Erro ao adicionar norma ${normaId}:`, error);
          console.error('Resposta do erro:', error.response?.data);
          // Para a execução se houver erro de validação
          throw error;
        }
      }
    }
    
    // Adicionar naces
    if (selectedNaces.value.length > 0) {
      console.log('Adicionando NACEs:', selectedNaces.value);
      for (const naceId of selectedNaces.value) {
        try {
          console.log(`Chamando addNace(${auditor.id}, ${naceId})`);
          await auditoresStore.addNace(auditor.id, naceId);
          console.log(`✓ NACE ${naceId} adicionado com sucesso`);
        } catch (error) {
          console.error(`✗ Erro ao adicionar NACE ${naceId}:`, error);
          console.error('Resposta do erro:', error.response?.data);
        }
      }
    }

    // Adicionar preços
    if (selectedPricing.value.length > 0) {
      console.log('Adicionando preços:', selectedPricing.value);
      for (const pricing of selectedPricing.value) {
        try {
          console.log(`Chamando addPricing(${auditor.id}, ${pricing.produtoId}, ${pricing.preco})`);
          await pricingStore.addPricing(auditor.id, pricing.produtoId, pricing.preco);
          console.log(`✓ Preço para produto ${pricing.produtoId} adicionado com sucesso`);
        } catch (error) {
          console.error(`✗ Erro ao adicionar preço:`, error);
          console.error('Resposta do erro:', error.response?.data);
        }
      }
    }
    
    console.log('Processo completo! Redirecionando para detalhes do parceiro...');
    toast.success('Parceiro cadastrado com sucesso');
    router.push(`/auditor/${auditor.id}`);
  } catch (error) {
    console.error('Erro ao cadastrar parceiro:', error);
    console.error('Detalhes do erro:', error.response?.data);
    toast.error('Erro ao cadastrar parceiro');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.novo-auditor-page {
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

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 15px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-back:hover {
  background: #f5f5f5;
  color: #e70d0c;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0;
}

.auditor-form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.col-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.normas-selection,
.nace-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.norma-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.norma-item:hover {
  border-color: #e70d0c;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f8f9fa;
  border-radius: 4px;
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
  font-weight: 500;
}

.norma-qualificacoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 28px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #e70d0c;
}

.qualificacoes-header {
  margin-bottom: 4px;
}

.qualificacoes-required {
  font-size: 12px;
  font-weight: 600;
  color: #dc3545;
  font-style: italic;
}

.qualificacao-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.qualificacao-checkbox:hover {
  border-color: #e70d0c;
  box-shadow: 0 2px 4px rgba(231, 13, 12, 0.1);
}

.qualificacao-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #e70d0c;
}

.qualificacao-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.qualificacao-label i {
  font-size: 14px;
  color: #e70d0c;
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

.nace-filters {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.iaf-filter-select {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
}

.iaf-filter-select:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.btn-toggle-iaf {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
  white-space: nowrap;
}

.btn-toggle-iaf:hover {
  border-color: #e70d0c;
  color: #e70d0c;
  background: #fff5f5;
}

.btn-toggle-iaf.all-selected {
  background: #e70d0c;
  border-color: #e70d0c;
  color: white;
}

.btn-toggle-iaf.all-selected:hover {
  background: #c00b0a;
  border-color: #c00b0a;
}

.btn-toggle-iaf i {
  font-size: 16px;
}

.search-box {
  position: relative;
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
  padding: 12px 14px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
}

.search-box input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.nace-list {
  max-height: 400px;
  overflow-y: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

/* Checkbox Container */
.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0;
}

.checkbox-container:hover {
  border-color: #e70d0c;
  background: #fff;
}

.checkbox-container input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #e70d0c;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-label-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-label-text i {
  font-size: 18px;
  color: #e70d0c;
  margin-right: 6px;
}

.checkbox-label-text strong {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #333;
}

.checkbox-label-text small {
  color: #666;
  font-size: 13px;
}

/* Pricing Section */
.pricing-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pricing-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pricing-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.pricing-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.produto-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.produto-icon-list {
  font-size: 20px;
  color: #e70d0c;
  flex-shrink: 0;
}

.produto-details-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.produto-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.produto-unidade-small {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  width: fit-content;
}

.pricing-value {
  color: #28a745;
  font-weight: 700;
  font-size: 16px;
  white-space: nowrap;
}

.btn-remove-pricing {
  background: transparent;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove-pricing:hover {
  background: rgba(220, 53, 69, 0.1);
}

.empty-pricing-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
}

.empty-pricing-message i {
  font-size: 20px;
  color: #6c757d;
}

.add-pricing-form {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px dashed #ddd;
  border-radius: 8px;
}

.pricing-select,
.pricing-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
  transition: all 0.2s;
}

.pricing-select:focus,
.pricing-input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.btn-add-pricing-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: #e70d0c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-add-pricing-inline:hover:not(:disabled) {
  background: #c00b0a;
  transform: translateY(-1px);
}

  .btn-add-pricing-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom Select with Floating Dropdown */
.custom-select-wrapper {
  position: relative;
}

.custom-select-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
  transition: all 0.2s;
  background: white;
}

.custom-select-input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.custom-select-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .add-pricing-form {
    grid-template-columns: 1fr;
  }
}@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-2 {
    grid-column: span 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
