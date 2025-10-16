<template>
  <div class="produtos-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Gerenciar Produtos</h1>
          <p>Gerencie os produtos disponíveis no sistema</p>
        </div>
        <button 
          v-if="canEdit"
          @click="showAddModal = true" 
          class="btn btn-primary"
        >
          <i class="bi bi-plus-lg"></i>
          Novo Produto
        </button>
      </div>

      <div class="produtos-card">
        <LoadingOverlay :show="loading" />

        <div class="produtos-list">
          <div 
            v-for="produto in produtos" 
            :key="produto.id"
            class="produto-item"
          >
            <div class="produto-info">
              <i :class="produto.icon || 'bi bi-box'" class="produto-icon"></i>
              <div class="produto-details">
                <span class="produto-nome">{{ produto.nome }}</span>
                <span v-if="produto.unidade" class="produto-unidade">{{ produto.unidade }}</span>
              </div>
            </div>

            <div class="produto-actions" v-if="canEdit">
              <button 
                @click="editProduto(produto)" 
                class="btn-action btn-edit"
                title="Editar"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button 
                @click="confirmDelete(produto)" 
                class="btn-action btn-delete"
                title="Excluir"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <div v-if="produtos.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>Nenhum produto cadastrado</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar/Editar -->
    <teleport to="body">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Editar' : 'Adicionar' }} Produto</h3>
            <button @click="closeModals" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nome do Produto *</label>
              <input 
                type="text" 
                v-model="produtoForm.nome"
                placeholder="Ex: ISO 9001"
                ref="inputNome"
              />
            </div>
            
            <div class="form-group">
              <label>Unidade</label>
              <select v-model="produtoForm.unidade">
                <option value="">Selecione</option>
                <option value="HD">HD</option>
              </select>
            </div>

            <div class="form-group">
              <label>Ícone</label>
              <div class="icon-selector">
                <div class="icon-grid">
                  <div 
                    v-for="icon in availableIcons" 
                    :key="icon.class"
                    @click="produtoForm.icon = icon.class"
                    class="icon-option"
                    :class="{ 'active': produtoForm.icon === icon.class }"
                  >
                    <i :class="icon.class"></i>
                    <span>{{ icon.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModals" class="btn btn-secondary">
              Cancelar
            </button>
            <ButtonLoader 
              @click="showEditModal ? handleUpdate() : handleAdd()"
              :loading="saving"
            >
              {{ showEditModal ? 'Salvar' : 'Adicionar' }}
            </ButtonLoader>
          </div>
        </div>
      </div>

      <!-- Modal Confirmar Exclusão -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button @click="showDeleteModal = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o produto <strong>{{ produtoToDelete?.nome }}</strong>?</p>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useProdutosStore } from '../stores/produtos';
import { useAuthStore } from '../stores/auth';
import { useToast } from '../composables/useToast';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import ButtonLoader from '../components/ButtonLoader.vue';

const produtosStore = useProdutosStore();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const produtoToDelete = ref(null);
const inputNome = ref(null);

const produtoForm = ref({
  id: null,
  nome: '',
  unidade: '',
  icon: 'bi bi-box',
});

const availableIcons = ref([
  { class: 'bi bi-box', label: 'Caixa' },
  { class: 'bi bi-file-earmark-text', label: 'Documento' },
  { class: 'bi bi-shield-check', label: 'Escudo' },
  { class: 'bi bi-award', label: 'Prêmio' },
  { class: 'bi bi-star', label: 'Estrela' },
  { class: 'bi bi-clipboard-check', label: 'Checklist' },
  { class: 'bi bi-gear', label: 'Engrenagem' },
  { class: 'bi bi-briefcase', label: 'Maleta' },
  { class: 'bi bi-graph-up', label: 'Gráfico' },
  { class: 'bi bi-building', label: 'Prédio' },
  { class: 'bi bi-globe', label: 'Globo' },
  { class: 'bi bi-tag', label: 'Etiqueta' },
  { class: 'bi bi-bookmark', label: 'Marcador' },
  { class: 'bi bi-patch-check', label: 'Selo' },
  { class: 'bi bi-trophy', label: 'Troféu' },
  { class: 'bi bi-lightbulb', label: 'Lâmpada' },
  { class: 'bi bi-rocket', label: 'Foguete' },
  { class: 'bi bi-flag', label: 'Bandeira' },
  { class: 'bi bi-heart', label: 'Coração' },
  { class: 'bi bi-bookmark-star', label: 'Favorito' },
  { class: 'bi bi-calendar-check', label: 'Calendário' },
  { class: 'bi bi-clock', label: 'Relógio' },
  { class: 'bi bi-eye', label: 'Olho' },
  { class: 'bi bi-hand-thumbs-up', label: 'Curtir' },
  { class: 'bi bi-megaphone', label: 'Megafone' },
  { class: 'bi bi-person-check', label: 'Pessoa' },
  { class: 'bi bi-diamond', label: 'Diamante' },
  { class: 'bi bi-lock', label: 'Cadeado' },
  { class: 'bi bi-key', label: 'Chave' },
  { class: 'bi bi-pie-chart', label: 'Pizza' },
  { class: 'bi bi-bar-chart', label: 'Barras' },
  { class: 'bi bi-tools', label: 'Ferramentas' },
  { class: 'bi bi-cpu', label: 'CPU' },
  { class: 'bi bi-layers', label: 'Camadas' },
  { class: 'bi bi-puzzle', label: 'Quebra-cabeça' },
  { class: 'bi bi-reception-4', label: 'Sinal' },
]);

const produtos = computed(() => produtosStore.produtos);
const canEdit = computed(() => authStore.hasRole('editProducts'));

onMounted(async () => {
  loading.value = true;
  try {
    await produtosStore.fetchProdutos();
  } catch (error) {
    toast.error('Erro ao carregar produtos');
  } finally {
    loading.value = false;
  }
});

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  produtoForm.value = { id: null, nome: '', unidade: '', icon: 'bi bi-box' };
};

const editProduto = async (produto) => {
  produtoForm.value = { ...produto };
  showEditModal.value = true;
  await nextTick();
  inputNome.value?.focus();
};

const confirmDelete = (produto) => {
  produtoToDelete.value = produto;
  showDeleteModal.value = true;
};

const handleAdd = async () => {
  if (!produtoForm.value.nome.trim()) {
    toast.warning('Digite o nome do produto');
    return;
  }

  saving.value = true;
  try {
    await produtosStore.createProduto({
      nome: produtoForm.value.nome,
      unidade: produtoForm.value.unidade,
      icon: produtoForm.value.icon,
    });
    toast.success('Produto adicionado com sucesso');
    closeModals();
  } catch (error) {
    toast.error('Erro ao adicionar produto');
  } finally {
    saving.value = false;
  }
};

const handleUpdate = async () => {
  if (!produtoForm.value.nome.trim()) {
    toast.warning('Digite o nome do produto');
    return;
  }

  saving.value = true;
  try {
    await produtosStore.updateProduto(produtoForm.value.id, {
      nome: produtoForm.value.nome,
      unidade: produtoForm.value.unidade,
      icon: produtoForm.value.icon,
    });
    toast.success('Produto atualizado com sucesso');
    closeModals();
  } catch (error) {
    toast.error('Erro ao atualizar produto');
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  deleting.value = true;
  try {
    await produtosStore.deleteProduto(produtoToDelete.value.id);
    toast.success('Produto excluído com sucesso');
    showDeleteModal.value = false;
  } catch (error) {
    toast.error('Erro ao excluir produto');
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.produtos-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 4px 0;
}

.page-header p {
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

.produtos-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 300px;
}

.produtos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.produto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.produto-item:hover {
  border-color: #e70d0c;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.produto-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.produto-info i {
  font-size: 24px;
  color: #e70d0c;
}

.produto-info span {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.produto-actions {
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
  font-size: 16px;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
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
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.form-group input {
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

.form-group select {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
  background: white;
  cursor: pointer;
}

/* Icon Selector */
.icon-selector {
  margin-top: 8px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.icon-grid::-webkit-scrollbar {
  width: 8px;
}

.icon-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.icon-option:hover {
  border-color: #e70d0c;
  background: #fff5f5;
}

.icon-option.active {
  border-color: #e70d0c;
  background: #e70d0c;
  color: white;
}

.icon-option i {
  font-size: 24px;
}

.icon-option span {
  font-size: 11px;
  font-weight: 500;
  text-align: center;
}

/* Produto Item Styles */
.produto-icon {
  font-size: 20px;
  color: #e70d0c;
}

.produto-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.produto-nome {
  font-weight: 500;
  color: #333;
}

.produto-unidade {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .produtos-list {
    grid-template-columns: 1fr;
  }
}
</style>
