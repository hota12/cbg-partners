<template>
  <div class="dashboard-page">
    <AppHeader />
    
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Parceiros</h1>
          <p>Gerencie a base de parceiros da CBG</p>
        </div>
        <router-link to="/auditor/novo" v-if="hasRole('editAuditors')" class="btn btn-primary">
          <i class="bi bi-person-plus"></i>
          Novo Parceiro
        </router-link>
      </div>

      <!-- Alerta Zeev -->
      <div v-if="hasRole('zeevAuditors') && auditoresNaoSincronizados > 0" class="zeev-alert">
        <div class="alert-icon">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div class="alert-content">
          <strong>Atenção!</strong>
          <span>
            {{ auditoresNaoSincronizados }} 
            {{ auditoresNaoSincronizados === 1 ? 'parceiro não está sincronizado' : 'parceiros não estão sincronizados' }} 
            com o Zeev
          </span>
        </div>
        <img src="/zeev.png" alt="Zeev" class="zeev-alert-logo" />
        
        <!-- Tooltip com lista de auditores -->
        <div class="zeev-tooltip">
          <div class="tooltip-header">
            <strong>Parceiros não sincronizados:</strong>
          </div>
          <div class="tooltip-list">
            <router-link 
              v-for="auditor in auditoresNaoSincDetalhes" 
              :key="auditor.id"
              :to="`/auditor/${auditor.id}`"
              class="tooltip-item"
            >
              <i class="bi bi-person-circle"></i>
              <div class="tooltip-info">
                <span class="tooltip-nome">{{ auditor.nome }}</span>
                <span class="tooltip-email">{{ auditor.email }}</span>
              </div>
              <i class="bi bi-chevron-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <div class="filters-header">
          <h3>
            <i class="bi bi-funnel"></i>
            Filtros
          </h3>
          <button @click="clearFilters" class="btn-clear">
            <i class="bi bi-x-circle"></i>
            Limpar
          </button>
        </div>

        <div class="filters-grid">
          <div class="filter-group">
            <label>Pesquisa</label>
            <input
              type="text"
              v-model="filters.pesquisa"
              placeholder="Nome, email ou CPF..."
              @input="handleFilterChange"
            />
          </div>

          <div class="filter-group">
            <label>Cidade</label>
            <input
              type="text"
              v-model="filters.cidade"
              placeholder="Filtrar por cidade"
              @input="handleFilterChange"
            />
          </div>

          <div class="filter-group">
            <label>Estado</label>
            <input
              type="text"
              v-model="filters.estado"
              placeholder="Filtrar por estado"
              @input="handleFilterChange"
            />
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.auditorStatus" @change="handleFilterChange">
              <option value="">Todos</option>
              <option value="null">Sem Status</option>
              <option value="aptoAuditoria">Apto para Auditoria</option>
              <option value="emFormacao">Em Formação</option>
              <option value="primeiraAuditoria">Primeira Auditoria</option>
              <option value="auditorInativo">Auditor Inativo</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Norma</label>
            <select v-model="filters.normaId" @change="handleFilterChange">
              <option value="">Todas</option>
              <option v-for="norma in normas" :key="norma.id" :value="String(norma.id)">
                {{ norma.norma }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>NACE</label>
            <select v-model="filters.naceId" @change="handleFilterChange">
              <option value="">Todos</option>
              <option v-for="nace in naces" :key="nace.id" :value="String(nace.id)">
                {{ nace.nace }} - {{ nace.descricao }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Revisor</label>
            <select v-model="filters.revisor" @change="handleFilterChange">
              <option :value="null">Todos</option>
              <option :value="true">Apenas Revisores</option>
              <option :value="false">Não Revisores</option>
            </select>
          </div>

          <div class="filter-group">
            <label>IAF</label>
            <select v-model="filters.iaf" @change="handleFilterChange">
              <option value="">Todos</option>
              <option value="1">IAF 1</option>
              <option value="2">IAF 2</option>
              <option value="3">IAF 3</option>
              <option value="4">IAF 4</option>
              <option value="5">IAF 5</option>
              <option value="6">IAF 6</option>
              <option value="7">IAF 7</option>
              <option value="8">IAF 8</option>
              <option value="9">IAF 9</option>
              <option value="10">IAF 10</option>
              <option value="11">IAF 11</option>
              <option value="12">IAF 12</option>
              <option value="13">IAF 13</option>
              <option value="14">IAF 14</option>
              <option value="15">IAF 15</option>
              <option value="16">IAF 16</option>
              <option value="17">IAF 17</option>
              <option value="18">IAF 18</option>
              <option value="19">IAF 19</option>
              <option value="20">IAF 20</option>
              <option value="21">IAF 21</option>
              <option value="22">IAF 22</option>
              <option value="23">IAF 23</option>
              <option value="24">IAF 24</option>
              <option value="25">IAF 25</option>
              <option value="26">IAF 26</option>
              <option value="27">IAF 27</option>
              <option value="28">IAF 28</option>
              <option value="29">IAF 29</option>
              <option value="30">IAF 30</option>
              <option value="31">IAF 31</option>
              <option value="32">IAF 32</option>
              <option value="33">IAF 33</option>
              <option value="34">IAF 34</option>
              <option value="35">IAF 35</option>
              <option value="36">IAF 36</option>
              <option value="37">IAF 37</option>
              <option value="38">IAF 38</option>
              <option value="39">IAF 39</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Desqualificado</label>
            <select v-model="filters.desqualificado" @change="handleFilterChange">
              <option :value="null">Todos</option>
              <option :value="true">Apenas Desqualificados</option>
              <option :value="false">Não Desqualificados</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-card">
        <LoadingOverlay :show="loading" />

        <div class="table-header">
          <h3>
            {{ auditoresFiltrados.length }} 
            {{ auditoresFiltrados.length === 1 ? 'parceiro encontrado' : 'parceiros encontrados' }}
          </h3>
        </div>

        <div class="table-responsive">
          <table class="auditores-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cidade/Estado</th>
                <th>Normas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="auditoresFiltrados.length === 0">
                <td colspan="4" class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>Nenhum parceiro encontrado</p>
                </td>
              </tr>
              <tr v-for="auditor in auditoresFiltrados" :key="auditor.id">
                <td>
                  <div class="auditor-name">
                    <span class="name">{{ auditor.nome }}</span>
                    <div class="badges">
                      <span :class="['badge', getStatusClass(auditor.auditorStatus)]">
                        {{ getStatusLabel(auditor.auditorStatus) }}
                      </span>
                      <span v-if="auditor.revisor" class="badge badge-info">Revisor</span>
                      <span v-if="auditor.desqualificado" class="badge badge-danger">Desqualificado</span>
                      <span v-if="auditor.inativo" class="badge badge-secondary">Inativo</span>
                    </div>
                  </div>
                </td>
                <td>{{ auditor.cidade }}, {{ auditor.estado }}</td>
                <td>
                  <div class="normas-selos">
                    <img 
                      v-for="norma in auditor.Normas?.slice(0, 3)" 
                      :key="norma.id"
                      :src="getNormaSelo(norma.normaId)"
                      :alt="getNormaLabel(norma.normaId)"
                      :title="getNormaLabel(norma.normaId)"
                      class="norma-selo"
                    />
                    <span v-if="auditor.Normas?.length > 3" class="badge badge-light more-normas">
                      +{{ auditor.Normas.length - 3 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="actions">
                    <router-link :to="`/auditor/${auditor.id}`" class="btn-action btn-view" title="Ver detalhes">
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <button
                      v-if="hasRole('editAuditors')"
                      @click="confirmDelete(auditor)"
                      class="btn-action btn-delete"
                      title="Deletar"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button @click="showDeleteModal = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o parceiro <strong>{{ auditorToDelete?.nome }}</strong>?</p>
            <p class="warning-text">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <ButtonLoader
              @click="handleDelete"
              variant="danger"
              :loading="deleting"
            >
              <i class="bi bi-trash"></i>
              Excluir
            </ButtonLoader>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuditoresStore } from '../stores/auditores';
import { useNormasStore } from '../stores/normas';
import { useNacesStore } from '../stores/naces';
import { useAuthStore } from '../stores/auth';
import { useZeevStore } from '../stores/zeev';
import { useToast } from '../composables/useToast';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import ButtonLoader from '../components/ButtonLoader.vue';

const auditoresStore = useAuditoresStore();
const normasStore = useNormasStore();
const nacesStore = useNacesStore();
const authStore = useAuthStore();
const zeevStore = useZeevStore();
const toast = useToast();

const loading = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const auditorToDelete = ref(null);

const filters = ref({
  pesquisa: '',
  cidade: '',
  estado: '',
  auditorStatus: '',
  normaId: '',
  naceId: '',
  revisor: null,
  iaf: '',
  desqualificado: null,
});

const auditoresFiltrados = computed(() => auditoresStore.auditoresFiltrados);
const normas = computed(() => normasStore.normas);
const naces = computed(() => nacesStore.naces);
const hasRole = (role) => authStore.hasRole(role);

const auditoresNaoSincronizados = computed(() => {
  if (!hasRole('zeevAuditors')) return 0;
  
  const sincronizacoes = zeevStore.getSincronizacoes;
  
  // Conta apenas sincronizações com statusSinc false
  // (não conta auditores que nunca foram sincronizados)
  return sincronizacoes.filter(s => s.statusSinc === false).length;
});

const auditoresNaoSincDetalhes = computed(() => {
  if (!hasRole('zeevAuditors')) return [];
  
  const sincronizacoes = zeevStore.getSincronizacoes;
  const auditores = auditoresStore.auditores;
  
  // Retorna detalhes dos auditores não sincronizados
  return sincronizacoes
    .filter(s => s.statusSinc === false)
    .map(sinc => {
      const auditor = auditores.find(a => String(a.id) === sinc.auditorId);
      return {
        id: sinc.auditorId,
        nome: auditor?.nome || 'Auditor não encontrado',
        email: sinc.email
      };
    });
});

onMounted(async () => {
  loading.value = true;
  try {
    const promises = [
      auditoresStore.fetchAuditores(),
      normasStore.fetchNormas(),
      nacesStore.fetchNaces(),
    ];
    
    // Se tem permissão Zeev, carrega sincronizações
    if (hasRole('zeevAuditors')) {
      promises.push(zeevStore.fetchAllSincronizacoes());
    }
    
    await Promise.all(promises);
  } catch (error) {
    toast.error('Erro ao carregar dados');
  } finally {
    loading.value = false;
  }
});

const handleFilterChange = () => {
  auditoresStore.setFilter('pesquisa', filters.value.pesquisa);
  auditoresStore.setFilter('cidade', filters.value.cidade);
  auditoresStore.setFilter('estado', filters.value.estado);
  auditoresStore.setFilter('auditorStatus', filters.value.auditorStatus);
  auditoresStore.setFilter('normaId', filters.value.normaId);
  auditoresStore.setFilter('naceId', filters.value.naceId);
  auditoresStore.setFilter('revisor', filters.value.revisor);
  auditoresStore.setFilter('iaf', filters.value.iaf);
  auditoresStore.setFilter('desqualificado', filters.value.desqualificado);
};

const clearFilters = () => {
  filters.value = {
    pesquisa: '',
    cidade: '',
    estado: '',
    auditorStatus: '',
    normaId: '',
    naceId: '',
    revisor: null,
    iaf: '',
    desqualificado: null,
  };
  auditoresStore.clearFilters();
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
  if (!status) return 'status-secondary';
  const classes = {
    aptoAuditoria: 'status-success',
    emFormacao: 'status-warning',
    primeiraAuditoria: 'status-secondary',
    auditorInativo: 'status-danger',
  };
  return classes[status] || 'status-secondary';
};

const getNormaLabel = (normaId) => {
  const norma = normasStore.getNormaById(normaId);
  return norma?.norma || normaId;
};

const getNormaSelo = (normaId) => {
  return `/selos/${normaId}.png`;
};

const confirmDelete = (auditor) => {
  auditorToDelete.value = auditor;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  deleting.value = true;
  try {
    await auditoresStore.deleteAuditor(auditorToDelete.value.id);
    toast.success('Auditor excluído com sucesso');
    showDeleteModal.value = false;
  } catch (error) {
    toast.error('Erro ao excluir auditor');
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 4px 0;
}

.dashboard-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
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
  text-decoration: none;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-primary {
  background: #e70d0c;
  color: white;
}

.btn-primary:hover {
  background: #c00b0a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 13, 12, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.filters-card,
.table-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.btn-clear:hover {
  border-color: #e70d0c;
  color: #e70d0c;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.table-card {
  position: relative;
}

.table-header {
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin: 0;
}

.table-responsive {
  overflow-x: auto;
}

.auditores-table {
  width: 100%;
  border-collapse: collapse;
}

.auditores-table thead {
  background: #f8f9fa;
}

.auditores-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auditores-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

.auditores-table tbody tr:hover {
  background: #f8f9fa;
}

.auditor-name {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auditor-name .name {
  font-weight: 600;
}

.badges,
.normas-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-info {
  background: #17a2b8;
  color: white;
}

.badge-danger {
  background: #dc3545;
  color: white;
}

.badge-secondary {
  background: #6c757d;
  color: white;
}

.badge-light {
  background: #f0f0f0;
  color: #555;
}

.normas-selos {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.norma-selo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  background: white;
  padding: 2px;
  border: 1px solid #e0e0e0;
  transition: transform 0.2s;
  cursor: pointer;
}

.norma-selo:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.more-normas {
  font-size: 11px;
  padding: 4px 8px;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge.status-success {
  background: #d4edda;
  color: #155724;
}

.badge.status-info {
  background: #d1ecf1;
  color: #0c5460;
}

.badge.status-primary {
  background: #cce5ff;
  color: #004085;
}

.badge.status-warning {
  background: #fff3cd;
  color: #856404;
}

.badge.status-secondary {
  background: #e2e3e5;
  color: #383d41;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 16px;
}

.btn-view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-view:hover {
  background: #1976d2;
  color: white;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #c62828;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px !important;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f5f5f5;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.warning-text {
  color: #dc3545;
  font-size: 13px !important;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
}

/* Zeev Alert */
.zeev-alert {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.1);
  position: relative;
  cursor: pointer;
}

.zeev-alert .alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
}

.zeev-alert .alert-icon i {
  color: #856404;
  font-size: 20px;
}

.zeev-alert .alert-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.zeev-alert .alert-content strong {
  color: #856404;
  font-weight: 600;
}

.zeev-alert .alert-content span {
  color: #856404;
  font-size: 14px;
}

.zeev-alert-logo {
  height: 28px;
  opacity: 0.8;
  flex-shrink: 0;
}

/* Tooltip */
.zeev-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ffc107;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.zeev-alert:hover .zeev-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.tooltip-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.tooltip-header strong {
  color: #333;
  font-size: 13px;
}

.tooltip-list {
  max-height: 240px;
  overflow-y: auto;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.tooltip-item:last-child {
  border-bottom: none;
}

.tooltip-item:hover {
  background: #f8f9fa;
}

.tooltip-item > i:first-child {
  font-size: 24px;
  color: #666;
  flex-shrink: 0;
}

.tooltip-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-nome {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.tooltip-email {
  font-size: 12px;
  color: #666;
}

.tooltip-item > i:last-child {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}

.tooltip-item:hover > i:last-child {
  color: #e70d0c;
  transform: translateX(2px);
}

.tooltip-list::-webkit-scrollbar {
  width: 6px;
}

.tooltip-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tooltip-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.tooltip-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .auditores-table {
    font-size: 13px;
  }

  .auditores-table th,
  .auditores-table td {
    padding: 10px 12px;
  }
  
  .zeev-alert {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .zeev-alert-logo {
    align-self: flex-end;
  }
}
</style>
