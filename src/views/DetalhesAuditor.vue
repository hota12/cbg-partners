<template>
  <div class="detalhes-auditor-page">
    <AppHeader />
    
    <!-- Loading overlay para toda a página -->
    <div v-if="loading && !auditor" class="page-loading">
      <div class="spinner"></div>
      <p>Carregando dados do parceiro...</p>
    </div>
    
    <div class="container" v-else-if="auditor">
      <div class="page-header">
        <button @click="$router.back()" class="btn-back">
          <i class="bi bi-arrow-left"></i>
          Voltar
        </button>
        <div class="header-info">
          <h1>{{ auditor.nome }}</h1>
          <div class="badges">
            <span v-if="auditor.revisor" class="badge badge-info">Revisor</span>
            <span v-if="auditor.desqualificado" class="badge badge-danger">Desqualificado</span>
            <span :class="['badge', getStatusClass(auditor.auditorStatus)]">
              {{ getStatusLabel(auditor.auditorStatus) }}
            </span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Informações do Auditor -->
        <div class="main-content">
          <div class="info-card">
            <LoadingOverlay :show="loading" />
            
            <div class="card-header">
              <h2>
                <i class="bi bi-person-circle"></i>
                Informações Pessoais
              </h2>
              <button v-if="canEdit" @click="editMode = !editMode" class="btn-edit">
                <i :class="editMode ? 'bi bi-x' : 'bi bi-pencil'"></i>
                {{ editMode ? 'Cancelar' : 'Editar' }}
              </button>
            </div>

            <form v-if="editMode" @submit.prevent="handleUpdate" class="edit-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nome</label>
                  <input type="text" v-model="editForm.nome" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" v-model="editForm.email" />
                </div>
                <div class="form-group">
                  <label>CPF</label>
                  <input type="text" v-model="editForm.cpf" />
                </div>
                <div class="form-group">
                  <label>Telefone</label>
                  <input type="tel" v-model="editForm.telefone" />
                </div>
                <div class="form-group">
                  <label>Estado Civil</label>
                  <select v-model="editForm.estado_civil">
                    <option value="Solteiro">Solteiro</option>
                    <option value="Casado">Casado</option>
                    <option value="Divorciado">Divorciado</option>
                    <option value="Viúvo">Viúvo</option>
                  </select>
                </div>
                <div class="form-group col-2">
                  <label>Endereço</label>
                  <input type="text" v-model="editForm.endereco" />
                </div>
                <div class="form-group">
                  <label>País</label>
                  <div class="custom-select-wrapper">
                    <input 
                      type="text" 
                      v-model="paisSearch"
                      @focus="showPaisDropdown = true"
                      @blur="setTimeout(() => showPaisDropdown = false, 200)"
                      placeholder="Digite para pesquisar país..."
                      class="custom-select-input"
                      autocomplete="off"
                    />
                    <div v-if="showPaisDropdown && paisesFiltered.length > 0" class="custom-dropdown">
                      <div 
                        v-for="pais in paisesFiltered" 
                        :key="pais" 
                        @click="selectPais(pais)"
                        class="dropdown-item"
                        :class="{ 'active': editForm.pais === pais }"
                      >
                        {{ pais }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Estado/Província</label>
                  <div v-if="estados.length > 0" class="custom-select-wrapper">
                    <input 
                      type="text" 
                      v-model="estadoSearch"
                      @focus="showEstadoDropdown = true"
                      @blur="setTimeout(() => showEstadoDropdown = false, 200)"
                      placeholder="Digite para pesquisar estado..."
                      class="custom-select-input"
                      :disabled="!editForm.pais"
                      autocomplete="off"
                    />
                    <div v-if="showEstadoDropdown && estadosFiltered.length > 0" class="custom-dropdown">
                      <div 
                        v-for="estado in estadosFiltered" 
                        :key="estado.sigla" 
                        @click="selectEstado(estado)"
                        class="dropdown-item"
                        :class="{ 'active': editForm.estado === estado.nome }"
                      >
                        {{ estado.nome }}
                      </div>
                    </div>
                  </div>
                  <input 
                    v-else
                    type="text" 
                    v-model="editForm.estado" 
                    :disabled="!editForm.pais"
                    :placeholder="!editForm.pais ? 'Selecione um país primeiro' : 'Digite o estado/província'"
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
                      placeholder="Digite para pesquisar cidade..."
                      class="custom-select-input"
                      :disabled="!editForm.estado || loadingCidades"
                      autocomplete="off"
                    />
                    <div v-if="showCidadeDropdown && cidadesFiltered.length > 0" class="custom-dropdown">
                      <div 
                        v-for="cidade in cidadesFiltered" 
                        :key="cidade" 
                        @click="selectCidade(cidade)"
                        class="dropdown-item"
                        :class="{ 'active': editForm.cidade === cidade }"
                      >
                        {{ cidade }}
                      </div>
                    </div>
                  </div>
                  <input 
                    v-else
                    type="text" 
                    v-model="editForm.cidade" 
                    :disabled="!editForm.estado || loadingCidades"
                    :placeholder="loadingCidades ? 'Carregando...' : (!editForm.estado ? 'Selecione um estado primeiro' : 'Digite a cidade')"
                  />
                </div>
                <div class="form-group">
                  <label>Empresa</label>
                  <input type="text" v-model="editForm.empresa" />
                </div>
                <div class="form-group">
                  <label>CNPJ</label>
                  <input type="text" v-model="editForm.cnpj" />
                </div>
                <div class="form-group">
                  <label>Status do Parceiro</label>
                  <select v-model="editForm.auditorStatus">
                    <option value="">Sem Status</option>
                    <option value="aptoAuditoria">Apto para Auditoria</option>
                    <option value="emFormacao">Em Formação</option>
                    <option value="primeiraAuditoria">Primeira Auditoria</option>
                    <option value="auditorInativo">Auditor Inativo</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <ButtonLoader type="submit" :loading="updating">
                  <i class="bi bi-check-lg"></i>
                  Salvar
                </ButtonLoader>
              </div>
            </form>

            <div v-else class="info-grid">
              <div class="info-item">
                <label>Email</label>
                <div class="info-with-action">
                  <span>{{ auditor.email }}</span>
                  <a :href="`mailto:${auditor.email}`" class="action-link" title="Enviar email">
                    <i class="bi bi-envelope"></i>
                  </a>
                </div>
              </div>
              <div class="info-item">
                <label>CPF</label>
                <span>{{ auditor.cpf }}</span>
              </div>
              <div class="info-item">
                <label>Telefone</label>
                <div class="info-with-action">
                  <span>{{ auditor.telefone }}</span>
                  <a :href="getWhatsAppLink(auditor.telefone)" target="_blank" class="action-link action-link-whatsapp" title="Abrir no WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
              <div class="info-item">
                <label>Estado Civil</label>
                <span>{{ auditor.estado_civil }}</span>
              </div>
              <div class="info-item">
                <label>Endereço</label>
                <span>{{ auditor.endereco }}</span>
              </div>
              <div class="info-item">
                <label>Cidade</label>
                <span>{{ auditor.cidade }}</span>
              </div>
              <div class="info-item">
                <label>Estado</label>
                <span>{{ auditor.estado }}</span>
              </div>
              <div class="info-item">
                <label>País</label>
                <span>{{ auditor.pais }}</span>
              </div>
              <div class="info-item">
                <label>Empresa</label>
                <span>{{ auditor.empresa }}</span>
              </div>
              <div class="info-item">
                <label>CNPJ</label>
                <span>{{ auditor.cnpj }}</span>
              </div>
            </div>
          </div>

          <!-- Sincronização Zeev -->
          <div class="info-card zeev-card">
            <div class="card-header">
              <h2>
                <img src="/zeev.png" alt="Zeev" class="zeev-logo" />
                Sincronização Zeev
              </h2>
            </div>

            <div v-if="zeevSinc" class="zeev-info">
              <div class="zeev-status">
                <div class="status-indicator" :class="{ 
                  'status-success': zeevStatus.sincronizado && !zeevStatus.emailDiferente,
                  'status-warning': zeevStatus.emailDiferente,
                  'status-error': !zeevStatus.sincronizado
                }">
                  <i class="bi" :class="{
                    'bi-check-circle-fill': zeevStatus.sincronizado && !zeevStatus.emailDiferente,
                    'bi-exclamation-triangle-fill': zeevStatus.emailDiferente,
                    'bi-x-circle-fill': !zeevStatus.sincronizado
                  }"></i>
                  <span v-if="zeevStatus.sincronizado && !zeevStatus.emailDiferente">
                    Sincronizado
                  </span>
                  <span v-else-if="zeevStatus.emailDiferente">
                    Email diferente
                  </span>
                  <span v-else>
                    Não sincronizado
                  </span>
                </div>
              </div>

              <div class="zeev-details">
                <div class="info-item">
                  <label>ID Zeev:</label>
                  <span>{{ zeevStatus.idZeev }}</span>
                </div>
                <div class="info-item">
                  <label>Email no Zeev:</label>
                  <span :class="{ 'text-warning': zeevStatus.emailDiferente }">
                    {{ zeevStatus.emailZeev }}
                  </span>
                </div>
                <div class="info-item" v-if="zeevStatus.emailDiferente">
                  <label>Email no Sistema:</label>
                  <span>{{ auditor.email }}</span>
                </div>
              </div>

              <div v-if="zeevStatus.emailDiferente" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Atenção!</strong> O email cadastrado no Zeev é diferente do email no sistema.
                Certifique-se de usar o mesmo email em ambos os sistemas.
              </div>
            </div>

            <div v-else class="zeev-not-synced">
              <p>Este parceiro ainda não está sincronizado com o Zeev.</p>
              <ButtonLoader 
                v-if="canEdit"
                @click="syncWithZeev" 
                :loading="syncingZeev"
                class="btn btn-primary"
              >
                <i class="bi bi-arrow-repeat"></i>
                Criar Sincronização
              </ButtonLoader>
            </div>
          </div>

          <!-- Normas -->
          <div class="info-card">
            <div class="card-header">
              <h2>
                <i class="bi bi-file-earmark-text"></i>
                Normas ({{ auditor.Normas?.length || 0 }})
              </h2>
            </div>

            <div class="tags-container">
              <div v-for="norma in auditor.Normas" :key="norma.id" class="tag">
                <img 
                  :src="`/selos/${norma.normaId}.png`" 
                  :alt="getNormaLabel(norma.normaId)"
                  class="tag-icon"
                  @error="e => e.target.style.display='none'"
                />
                <span>{{ getNormaLabel(norma.normaId) }}</span>
                <button 
                  v-if="canEdit"
                  @click="removeNorma(norma.normaId)" 
                  class="tag-remove"
                  title="Remover"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
              
              <button v-if="canEdit" @click="showAddNorma = true" class="tag-add">
                <i class="bi bi-plus-lg"></i>
                Adicionar Norma
              </button>
            </div>
          </div>

          <!-- NACE -->
          <div class="info-card">
            <div class="card-header">
              <h2>
                <i class="bi bi-bookmark"></i>
                NACE ({{ auditor.Nace?.length || 0 }})
              </h2>
            </div>

            <div class="tags-container">
              <div v-for="nace in auditor.Nace" :key="nace.id" class="tag">
                <span>{{ getNaceLabel(nace.naceId) }}</span>
                <button 
                  v-if="canEdit"
                  @click="removeNace(nace.naceId)" 
                  class="tag-remove"
                  title="Remover"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
              
              <button v-if="canEdit" @click="showAddNace = true" class="tag-add">
                <i class="bi bi-plus-lg"></i>
                Adicionar NACE
              </button>
            </div>
          </div>

          <!-- Tabela de Preços -->
          <div class="info-card" v-if="authStore.hasRole('viewPricingAuditors')">
            <div class="card-header">
              <h2>
                <i class="bi bi-currency-dollar"></i>
                Tabela de Preços
              </h2>
            </div>

            <div class="pricing-table" v-if="pricing.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Unidade</th>
                    <th>Preço</th>
                    <th v-if="authStore.hasRole('editPricingAuditors')">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pricing" :key="item.id">
                    <td>
                      <div class="produto-cell">
                        <i :class="getProdutoIcon(item.produtoId)" class="produto-icon-table"></i>
                        <span>{{ item.produtoNome }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="unidade-badge">{{ getProdutoUnidade(item.produtoId) || '-' }}</span>
                    </td>
                    <td>
                      <span v-if="!item.editing">R$ {{ formatPrice(item.preco) }}</span>
                      <input 
                        v-else 
                        type="number" 
                        step="0.01" 
                        v-model="item.newPreco"
                        class="price-input"
                      />
                    </td>
                    <td v-if="authStore.hasRole('editPricingAuditors')">
                      <div class="pricing-actions">
                        <button 
                          v-if="!item.editing"
                          @click="startEditPrice(item)" 
                          class="btn-icon btn-edit-price"
                          title="Editar"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          v-if="item.editing"
                          @click="savePrice(item)" 
                          class="btn-icon btn-save"
                          title="Salvar"
                        >
                          <i class="bi bi-check"></i>
                        </button>
                        <button 
                          v-if="item.editing"
                          @click="cancelEditPrice(item)" 
                          class="btn-icon btn-cancel"
                          title="Cancelar"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                        <button 
                          v-if="!item.editing"
                          @click="confirmDeletePrice(item)" 
                          class="btn-icon btn-delete-price"
                          title="Remover"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="empty-pricing">
              <i class="bi bi-currency-dollar"></i>
              <p>Nenhum preço cadastrado</p>
            </div>

            <button 
              v-if="authStore.hasRole('editPricingAuditors')" 
              @click="openAddPricingModal" 
              class="btn btn-add-pricing"
              type="button"
            >
              <i class="bi bi-plus-lg"></i>
              Adicionar Preço
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Ações -->
          <div class="action-card" v-if="canEdit">
            <h3>Ações Rápidas</h3>
            <div class="action-buttons">
              <div class="action-group">
                <label class="action-label">
                  Alterar Status
                  <span v-if="updatingStatus" class="loading-indicator">
                    <i class="bi bi-arrow-clockwise spin"></i>
                  </span>
                  <span v-if="auditor.desqualificado" class="blocked-indicator" title="Bloqueado: Auditor desqualificado">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                </label>
                <select 
                  v-model="statusSelecionado" 
                  @change="updateStatus" 
                  class="action-select"
                  :disabled="updatingStatus || auditor.desqualificado"
                  :class="{ 
                    'loading': updatingStatus,
                    'blocked': auditor.desqualificado 
                  }"
                  :title="auditor.desqualificado ? 'Bloqueado: Requalifique o auditor primeiro' : ''"
                >
                  <option value="">Sem Status</option>
                  <option value="aptoAuditoria">Apto para Auditoria</option>
                  <option value="emFormacao">Em Formação</option>
                  <option value="primeiraAuditoria">Primeira Auditoria</option>
                  <option value="auditorInativo">Auditor Inativo</option>
                </select>
              </div>
              
              <!-- Switch Revisor -->
              <div 
                class="switch-container" 
                :class="{ 
                  'loading': togglingRevisor,
                  'blocked': auditor.desqualificado 
                }"
                @click="confirmToggleRevisor"
                :title="auditor.desqualificado ? 'Bloqueado: Requalifique o auditor primeiro' : ''"
              >
                <div class="switch-info">
                  <i :class="togglingRevisor ? 'bi bi-arrow-clockwise spin' : auditor.desqualificado ? 'bi bi-lock-fill' : 'bi bi-star'"></i>
                  <span>Revisor</span>
                </div>
                <label class="switch">
                  <input 
                    type="checkbox" 
                    :checked="auditor.revisor"
                    :disabled="togglingRevisor || auditor.desqualificado"
                    @click.prevent
                  />
                  <span class="slider"></span>
                </label>
              </div>

              <!-- Switch Desqualificado -->
              <div 
                class="switch-container danger-switch" 
                :class="{ 
                  'loading': togglingDesqualificado,
                  'active-danger': auditor.desqualificado 
                }"
                @click="confirmToggleDesqualificado"
              >
                <div class="switch-info">
                  <i :class="togglingDesqualificado ? 'bi bi-arrow-clockwise spin' : 'bi bi-exclamation-triangle'"></i>
                  <span>Desqualificado</span>
                </div>
                <label class="switch switch-danger">
                  <input 
                    type="checkbox" 
                    :checked="auditor.desqualificado"
                    :disabled="togglingDesqualificado"
                    @click.prevent
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Histórico -->
          <div class="history-card" v-if="canViewHistory">
            <h3>
              <i class="bi bi-clock-history"></i>
              Histórico de Alterações
            </h3>
            <LoadingOverlay :show="loadingHistory" />
            
            <div v-if="!historicoCarregado" class="load-history">
              <button @click="loadHistory" class="btn-load">
                Carregar Histórico
              </button>
            </div>

            <div v-else class="history-list">
              <div 
                v-for="item in historicoAuditor" 
                :key="item.id" 
                class="history-item"
              >
                <div class="history-icon">
                  <i :class="getHistoryIcon(item.action)"></i>
                </div>
                <div class="history-content">
                  <strong>{{ historicoStore.getActionLabel(item.action) }}</strong>
                  <p v-if="item.value" class="history-value">{{ item.value }}</p>
                  <small>
                    Por {{ item.authorName }} em {{ formatDate(item.createdAt) }}
                  </small>
                </div>
              </div>
              
              <div v-if="historicoAuditor.length === 0" class="empty-history">
                Nenhuma alteração registrada
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <teleport to="body">
      <!-- Add Norma -->
      <div v-if="showAddNorma" class="modal-overlay" @click="showAddNorma = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Adicionar Norma</h3>
            <button @click="showAddNorma = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="selection-list">
              <label 
                v-for="norma in normasDisponiveis" 
                :key="norma.id"
                class="selection-item"
              >
                <input 
                  type="radio" 
                  :value="norma.id"
                  v-model="selectedNormaId"
                />
                <span>{{ norma.norma }}</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAddNorma = false" class="btn btn-secondary">
              Cancelar
            </button>
            <ButtonLoader @click="addNorma" :loading="adding">
              Adicionar
            </ButtonLoader>
          </div>
        </div>
      </div>

      <!-- Add NACE -->
      <div v-if="showAddNace" class="modal-overlay" @click="showAddNace = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Adicionar NACE</h3>
            <button @click="showAddNace = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="filters-row">
              <input 
                type="text" 
                v-model="naceSearchModal"
                placeholder="Buscar por código ou descrição..."
                class="search-input"
              />
              <select v-model="selectedIafFilter" class="iaf-filter">
                <option value="">Todos os IAFs</option>
                <option v-for="iaf in nacesStore.iafsDisponiveis" :key="iaf" :value="iaf">
                  IAF {{ iaf }}
                </option>
              </select>
            </div>
            <div class="selection-list">
              <label 
                v-for="nace in nacesDisponiveisFiltered" 
                :key="nace.id"
                class="selection-item"
              >
                <input 
                  type="radio" 
                  :value="nace.id"
                  v-model="selectedNaceId"
                />
                <span>
                  <strong>{{ nace.nace }}</strong> - {{ nace.descricao }}
                </span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAddNace = false" class="btn btn-secondary">
              Cancelar
            </button>
            <ButtonLoader @click="addNace" :loading="adding">
              Adicionar
            </ButtonLoader>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmação -->
      <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
        <div class="modal-content modal-confirm" @click.stop>
          <div class="modal-header">
            <h3>{{ confirmModal.title }}</h3>
            <button @click="showConfirmModal = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ confirmModal.message }}</p>
            <p v-if="confirmModal.warning" class="warning-text">
              <i class="bi bi-exclamation-triangle"></i>
              {{ confirmModal.warning }}
            </p>
          </div>
          <div class="modal-footer">
            <button 
              @click="showConfirmModal = false" 
              class="btn btn-secondary"
              :disabled="confirmModalLoading"
            >
              Cancelar
            </button>
            <ButtonLoader
              @click="confirmModal.action"
              :variant="confirmModal.isDanger ? 'danger' : 'primary'"
              :loading="confirmModalLoading"
            >
              {{ confirmModal.confirmText }}
            </ButtonLoader>
          </div>
        </div>
      </div>

      <!-- Modal Adicionar Preço -->
      <div v-show="showAddPricing" class="modal-overlay" @click="showAddPricing = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Adicionar Preço</h3>
            <button @click="showAddPricing = false" class="modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Produto</label>
              <select v-model="newPricing.produtoId" class="action-select">
                <option value="">Selecione um produto</option>
                <option v-for="produto in produtosDisponiveis" :key="produto.id" :value="produto.id">
                  <i :class="produto.icon || 'bi bi-box'"></i>
                  {{ produto.nome }} {{ produto.unidade ? `(${produto.unidade})` : '' }}
                </option>
              </select>
            </div>
            
            <!-- Preview do produto selecionado -->
            <div v-if="newPricing.produtoId" class="produto-preview">
              <div class="preview-item">
                <i :class="getProdutoIcon(newPricing.produtoId)" class="preview-icon"></i>
                <div class="preview-details">
                  <span class="preview-nome">{{ getProdutoNome(newPricing.produtoId) }}</span>
                  <span v-if="getProdutoUnidade(newPricing.produtoId)" class="preview-unidade">
                    {{ getProdutoUnidade(newPricing.produtoId) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Preço (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                v-model="newPricing.preco"
                placeholder="0.00"
                class="price-input-large"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAddPricing = false" class="btn btn-secondary">
              Cancelar
            </button>
            <ButtonLoader @click="addPricing" :loading="adding">
              Adicionar
            </ButtonLoader>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Mensagem quando não encontra o auditor -->
    <div v-if="!auditor && !loading" class="container">
      <div class="error-message">
        <i class="bi bi-exclamation-triangle"></i>
        <h2>Parceiro não encontrado</h2>
        <p>O parceiro que você está tentando acessar não foi encontrado ou não existe.</p>
        <button @click="$router.push('/')" class="btn btn-primary">
          Voltar ao Painel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuditoresStore } from '../stores/auditores';
import { useNormasStore } from '../stores/normas';
import { useNacesStore } from '../stores/naces';
import { useHistoricoStore } from '../stores/historico';
import { usePricingStore } from '../stores/pricing';
import { useProdutosStore } from '../stores/produtos';
import { useAuthStore } from '../stores/auth';
import { useZeevStore } from '../stores/zeev';
import { useToast } from '../composables/useToast';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import ButtonLoader from '../components/ButtonLoader.vue';

const route = useRoute();
const router = useRouter();
const auditoresStore = useAuditoresStore();
const normasStore = useNormasStore();
const nacesStore = useNacesStore();
const historicoStore = useHistoricoStore();
const pricingStore = usePricingStore();
const produtosStore = useProdutosStore();
const authStore = useAuthStore();
const zeevStore = useZeevStore();
const toast = useToast();

const loading = ref(false);
const loadingHistory = ref(false);
const updating = ref(false);
const adding = ref(false);
const editMode = ref(false);
const historicoCarregado = ref(false);
const updatingStatus = ref(false);
const togglingRevisor = ref(false);
const togglingDesqualificado = ref(false);
const confirmModalLoading = ref(false);
const showAddNorma = ref(false);
const showAddNace = ref(false);
const selectedNormaId = ref(null);
const showConfirmModal = ref(false);
const confirmModal = ref({
  title: '',
  message: '',
  warning: '',
  confirmText: '',
  isDanger: false,
  action: null
});
const selectedNaceId = ref(null);
const naceSearchModal = ref('');
const selectedIafFilter = ref('');
const statusSelecionado = ref('');
const showAddPricing = ref(false);
const newPricing = ref({
  produtoId: '',
  preco: ''
});

const editForm = ref({});
const paises = ref([]);
const estados = ref([]);
const cidades = ref([]);
const loadingCidades = ref(false);
const paisSearch = ref('');
const estadoSearch = ref('');
const cidadeSearch = ref('');
const showPaisDropdown = ref(false);
const showEstadoDropdown = ref(false);
const showCidadeDropdown = ref(false);
const auditor = ref(null);
const zeevSinc = ref(null);
const syncingZeev = ref(false);

const canEdit = computed(() => authStore.hasRole('editAuditors'));
const canViewHistory = computed(() => authStore.hasRole('historyAuditors'));

const zeevStatus = computed(() => {
  if (!zeevSinc.value) return { sincronizado: false, emailDiferente: false };
  
  const emailDiferente = zeevSinc.value.email.toLowerCase() !== auditor.value?.email?.toLowerCase();
  
  return {
    sincronizado: zeevSinc.value.statusSinc,
    emailDiferente: emailDiferente,
    emailZeev: zeevSinc.value.email,
    idZeev: zeevSinc.value.idZeev
  };
});

const historicoAuditor = computed(() => {
  if (!auditor.value) return [];
  return historicoStore.historicoByAuditor(auditor.value.id);
});

const normasDisponiveis = computed(() => {
  const normasAuditor = auditor.value?.Normas?.map(n => n.normaId) || [];
  return normasStore.normas.filter(n => !normasAuditor.includes(String(n.id)));
});

const nacesDisponiveis = computed(() => {
  const nacesAuditor = auditor.value?.Nace?.map(n => n.naceId) || [];
  return nacesStore.naces.filter(n => !nacesAuditor.includes(String(n.id)));
});

const nacesDisponiveisFiltered = computed(() => {
  let resultado = nacesDisponiveis.value;
  
  // Filtro por IAF
  if (selectedIafFilter.value) {
    resultado = resultado.filter(n => n.iaf === selectedIafFilter.value);
  }
  
  // Filtro por texto
  if (naceSearchModal.value) {
    const termo = naceSearchModal.value.toLowerCase();
    resultado = resultado.filter(n =>
      n.nace.toLowerCase().includes(termo) ||
      n.descricao.toLowerCase().includes(termo)
    );
  }
  
  return resultado;
});

const pricing = computed(() => pricingStore.pricing || []);

const produtosDisponiveis = computed(() => {
  const produtos = produtosStore.getProdutos;
  if (!Array.isArray(pricing.value)) return produtos;
  const produtosComPreco = pricing.value.map(p => String(p.produtoId));
  return produtos.filter(p => !produtosComPreco.includes(String(p.id)));
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

const fetchEstados = async (pais) => {
  estados.value = [];
  editForm.value.estado = '';
  editForm.value.cidade = '';
  cidades.value = [];

  if (!pais) return;

  try {
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
        console.log(`Nenhum estado encontrado para ${pais}. Permitindo entrada manual.`);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar estados:', error);
  }
};

const fetchCidades = async (pais, estado) => {
  if (!pais || !estado) return;
  loadingCidades.value = true;
  cidades.value = [];
  
  try {
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
  editForm.value.pais = pais;
  paisSearch.value = pais;
  showPaisDropdown.value = false;
  fetchEstados(pais);
};

const selectEstado = (estado) => {
  editForm.value.estado = estado.nome;
  estadoSearch.value = estado.nome;
  showEstadoDropdown.value = false;
  editForm.value.cidade = '';
  cidadeSearch.value = '';
  cidades.value = [];
  if (estado.sigla) {
    fetchCidades(editForm.value.pais, estado.sigla);
  }
};

const selectCidade = (cidade) => {
  editForm.value.cidade = cidade;
  cidadeSearch.value = cidade;
  showCidadeDropdown.value = false;
};

const getWhatsAppLink = (telefone) => {
  if (!telefone) return '#';
  
  // Remove todos os caracteres não numéricos
  const cleanedNumber = telefone.replace(/\D/g, '');
  
  // Se o número já tem código do país (mais de 10 dígitos), usa como está
  // Caso contrário, adiciona o código do Brasil (+55)
  const numberWithCountryCode = cleanedNumber.length > 10 
    ? cleanedNumber 
    : `55${cleanedNumber}`;
  
  return `https://wa.me/${numberWithCountryCode}`;
};

onMounted(async () => {
  loading.value = true;
  auditor.value = null; // Limpa o auditor local
  
  try {
    console.log('DetalhesAuditor - Carregando auditor ID:', route.params.id);
    
    // Validar que temos um ID válido
    if (!route.params.id) {
      throw new Error('ID do auditor não fornecido');
    }

    await Promise.all([
      auditoresStore.fetchAuditor(route.params.id),
      normasStore.fetchNormas(),
      nacesStore.fetchNaces(),
      produtosStore.fetchProdutos(),
      fetchPaises(),
    ]);

    // Atualiza o auditor local com os dados do store
    auditor.value = auditoresStore.auditorAtual;
    console.log('DetalhesAuditor - Auditor carregado:', auditor.value);

    // Verificar se o auditor foi carregado corretamente
    if (!auditor.value) {
      throw new Error('Auditor não encontrado');
    }

    // Carregar sincronização com Zeev
    zeevSinc.value = await zeevStore.fetchSincronizacao(route.params.id);

    editForm.value = { ...auditor.value };
    statusSelecionado.value = auditor.value?.auditorStatus || 'aptoAuditoria';
    
    // Carregar pricing se tiver permissão
    if (authStore.hasRole('viewPricingAuditors')) {
      await pricingStore.fetchPricing(route.params.id);
    }

    // Carregar estados e cidades se já tiver país e estado
    if (auditor.value?.pais) {
      paisSearch.value = auditor.value.pais;
      await fetchEstados(auditor.value.pais);
      if (auditor.value?.estado) {
        // Procura pelo nome do estado ou pela sigla (para compatibilidade com dados antigos)
        const estado = estados.value.find(e => e.nome === auditor.value.estado || e.sigla === auditor.value.estado);
        if (estado) {
          estadoSearch.value = estado.nome;
          // Para buscar cidades, usa a sigla
          await fetchCidades(auditor.value.pais, estado.sigla);
          if (auditor.value?.cidade) {
            cidadeSearch.value = auditor.value.cidade;
          }
        } else {
          // Se não encontrou na lista, assume que é um nome manual
          estadoSearch.value = auditor.value.estado;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar auditor:', error);
    toast.error('Erro ao carregar dados do parceiro');
    // Redireciona para o dashboard após 2 segundos
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } finally {
    loading.value = false;
  }
});

// Limpa o auditor quando o componente é desmontado
onBeforeUnmount(() => {
  console.log('DetalhesAuditor - Componente desmontado, limpando estado');
  auditor.value = null;
  auditoresStore.auditorAtual = null;
  pricingStore.clearPricing();
  zeevStore.clearSincronizacao();
  zeevSinc.value = null;
  historicoCarregado.value = false;
});

// Observa mudanças no ID da rota para recarregar quando navegar entre auditores
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('DetalhesAuditor - Mudança de rota detectada:', oldId, '->', newId);
    
    loading.value = true;
    auditor.value = null; // Limpa o auditor local
    pricingStore.clearPricing(); // Limpa o pricing anterior
    historicoCarregado.value = false;
    
    try {
      if (!newId) {
        throw new Error('ID do auditor não fornecido');
      }

      await Promise.all([
        auditoresStore.fetchAuditor(newId),
        normasStore.fetchNormas(),
        nacesStore.fetchNaces(),
        produtosStore.fetchProdutos(),
      ]);

      // Atualiza o auditor local com os dados do store
      auditor.value = auditoresStore.auditorAtual;
      console.log('DetalhesAuditor - Auditor recarregado:', auditor.value);

      if (!auditor.value) {
        throw new Error('Auditor não encontrado');
      }

      editForm.value = { ...auditor.value };
      statusSelecionado.value = auditor.value?.auditorStatus || 'aptoAuditoria';
      
      // Carregar sincronização com Zeev
      zeevSinc.value = await zeevStore.fetchSincronizacao(newId);
      
      if (authStore.hasRole('viewPricingAuditors')) {
        await pricingStore.fetchPricing(newId);
      }

      if (auditor.value?.pais) {
        paisSearch.value = auditor.value.pais;
        await fetchEstados(auditor.value.pais);
        if (auditor.value?.estado) {
          const estado = estados.value.find(e => e.nome === auditor.value.estado || e.sigla === auditor.value.estado);
          if (estado) {
            estadoSearch.value = estado.nome;
            await fetchCidades(auditor.value.pais, estado.sigla);
            if (auditor.value?.cidade) {
              cidadeSearch.value = auditor.value.cidade;
            }
          } else {
            estadoSearch.value = auditor.value.estado;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar auditor:', error);
      toast.error('Erro ao carregar dados do parceiro');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } finally {
      loading.value = false;
    }
  }
});

const loadHistory = async () => {
  loadingHistory.value = true;
  try {
    await historicoStore.fetchHistorico(auditor.value.id);
    historicoCarregado.value = true;
  } catch (error) {
    toast.error('Erro ao carregar histórico');
  } finally {
    loadingHistory.value = false;
  }
};

const syncWithZeev = async () => {
  syncingZeev.value = true;
  try {
    await zeevStore.createSincronizacao(auditor.value.id, auditor.value.email);
    zeevSinc.value = await zeevStore.fetchSincronizacao(auditor.value.id);
    toast.success('Sincronização com Zeev criada com sucesso');
  } catch (error) {
    toast.error('Erro ao sincronizar com Zeev');
  } finally {
    syncingZeev.value = false;
  }
};

const handleUpdate = async () => {
  updating.value = true;
  try {
    // Garante que os valores de busca sejam sincronizados com o editForm
    // se o usuário não alterou via dropdown
    if (!editForm.value.pais && paisSearch.value) {
      editForm.value.pais = paisSearch.value;
    }
    if (!editForm.value.estado && estadoSearch.value) {
      editForm.value.estado = estadoSearch.value;
    }
    if (!editForm.value.cidade && cidadeSearch.value) {
      editForm.value.cidade = cidadeSearch.value;
    }
    
    await auditoresStore.updateAuditor(auditor.value.id, editForm.value);
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    editForm.value = { ...auditor.value };
    toast.success('Auditor atualizado');
    editMode.value = false;
  } catch (error) {
    toast.error('Erro ao atualizar');
  } finally {
    updating.value = false;
  }
};

const addNorma = async () => {
  if (!selectedNormaId.value) return;
  adding.value = true;
  try {
    await auditoresStore.addNorma(auditor.value.id, selectedNormaId.value);
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success('Norma adicionada');
    showAddNorma.value = false;
    selectedNormaId.value = null;
  } catch (error) {
    toast.error('Erro ao adicionar norma');
  } finally {
    adding.value = false;
  }
};

const removeNorma = async (normaId) => {
  try {
    await auditoresStore.removeNorma(auditor.value.id, normaId);
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success('Norma removida');
  } catch (error) {
    toast.error('Erro ao remover norma');
  }
};

const addNace = async () => {
  if (!selectedNaceId.value) return;
  adding.value = true;
  try {
    await auditoresStore.addNace(auditor.value.id, selectedNaceId.value);
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success('NACE adicionado');
    showAddNace.value = false;
    selectedNaceId.value = null;
  } catch (error) {
    toast.error('Erro ao adicionar NACE');
  } finally {
    adding.value = false;
  }
};

const removeNace = async (naceId) => {
  try {
    await auditoresStore.removeNace(auditor.value.id, naceId);
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success('NACE removido');
  } catch (error) {
    toast.error('Erro ao remover NACE');
  }
};

const updateStatus = async () => {
  if (auditor.value.desqualificado) {
    toast.warning('Não é possível alterar o status de um auditor desqualificado');
    return;
  }
  
  updatingStatus.value = true;
  try {
    await auditoresStore.updateAuditor(auditor.value.id, {
      ...auditor.value,
      auditorStatus: statusSelecionado.value,
    });
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success('Status atualizado com sucesso');
  } catch (error) {
    toast.error('Erro ao atualizar status');
  } finally {
    updatingStatus.value = false;
  }
};

const confirmToggleRevisor = () => {
  console.log('confirmToggleRevisor chamado');
  console.log('togglingRevisor:', togglingRevisor.value);
  console.log('auditor.desqualificado:', auditor.value?.desqualificado);
  console.log('auditor.revisor:', auditor.value?.revisor);
  
  if (togglingRevisor.value) return;
  
  // Bloqueia se estiver desqualificado e tentando ativar revisor
  if (auditor.value.desqualificado && !auditor.value.revisor) {
    toast.warning('Não é possível tornar revisor um auditor desqualificado. Requalifique primeiro.');
    return;
  }
  
  const isRevisor = auditor.value.revisor;
  confirmModal.value = {
    title: isRevisor ? 'Remover Status de Revisor' : 'Tornar Revisor',
    message: isRevisor
      ? `Deseja remover o status de revisor de ${auditor.value.nome}?`
      : `Deseja tornar ${auditor.value.nome} um revisor?`,
    warning: isRevisor ? '' : 'Revisores têm permissões especiais no sistema.',
    confirmText: isRevisor ? 'Remover' : 'Confirmar',
    isDanger: isRevisor,
    action: async () => {
      confirmModalLoading.value = true;
      await toggleRevisor();
      confirmModalLoading.value = false;
      showConfirmModal.value = false;
    }
  };
  
  console.log('Abrindo modal, confirmModal:', confirmModal.value);
  showConfirmModal.value = true;
  console.log('showConfirmModal definido como true');
};

const confirmToggleDesqualificado = () => {
  if (togglingDesqualificado.value) return;
  
  const isDesqualificado = auditor.value.desqualificado;
  confirmModal.value = {
    title: isDesqualificado ? 'Requalificar Parceiro' : 'Desqualificar Parceiro',
    message: isDesqualificado
      ? `Deseja requalificar ${auditor.value.nome}?`
      : `Deseja desqualificar ${auditor.value.nome}?`,
    warning: !isDesqualificado ? 'Esta é uma ação crítica que afeta a capacidade do parceiro de realizar auditorias.' : '',
    confirmText: isDesqualificado ? 'Requalificar' : 'Desqualificar',
    isDanger: !isDesqualificado,
    action: async () => {
      confirmModalLoading.value = true;
      await toggleDesqualificado();
      confirmModalLoading.value = false;
      showConfirmModal.value = false;
    }
  };
  showConfirmModal.value = true;
};

const toggleRevisor = async () => {
  togglingRevisor.value = true;
  try {
    const novoValor = !auditor.value.revisor;
    await auditoresStore.updateAuditor(auditor.value.id, {
      ...auditor.value,
      revisor: novoValor,
    });
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    toast.success(novoValor ? 'Parceiro agora é revisor' : 'Revisor removido');
  } catch (error) {
    toast.error('Erro ao atualizar');
  } finally {
    togglingRevisor.value = false;
  }
};

const toggleDesqualificado = async () => {
  togglingDesqualificado.value = true;
  try {
    const novoValor = !auditor.value.desqualificado;
    
    // Se estiver desqualificando, remove revisor e altera status
    const dadosAtualizados = {
      ...auditor.value,
      desqualificado: novoValor,
    };
    
    if (novoValor) {
      // Desqualificando: remove revisor e altera status para inativo
      dadosAtualizados.revisor = false;
      dadosAtualizados.auditorStatus = 'auditorInativo';
    }
    
    await auditoresStore.updateAuditor(auditor.value.id, dadosAtualizados);
    
    // Recarrega os dados do auditor
    await auditoresStore.fetchAuditor(auditor.value.id);
    auditor.value = auditoresStore.auditorAtual;
    
    // Atualiza o status selecionado no select
    statusSelecionado.value = auditor.value.auditorStatus || '';
    
    if (novoValor) {
      toast.success('Parceiro desqualificado e removido de revisor');
    } else {
      toast.success('Parceiro requalificado');
    }
  } catch (error) {
    toast.error('Erro ao atualizar');
  } finally {
    togglingDesqualificado.value = false;
  }
};

// Pricing functions
const openAddPricingModal = () => {
  console.log('Opening pricing modal');
  showAddPricing.value = true;
  console.log('showAddPricing:', showAddPricing.value);
};

const addPricing = async () => {
  if (!newPricing.value.produtoId || !newPricing.value.preco) {
    toast.error('Preencha todos os campos');
    return;
  }

  adding.value = true;
  try {
    await pricingStore.addPricing(
      auditor.value.id,
      newPricing.value.produtoId,
      newPricing.value.preco
    );
    toast.success('Preço adicionado');
    showAddPricing.value = false;
    newPricing.value = { produtoId: '', preco: '' };
  } catch (error) {
    toast.error('Erro ao adicionar preço');
  } finally {
    adding.value = false;
  }
};

const startEditPrice = (item) => {
  item.editing = true;
  item.newPreco = item.preco;
};

const cancelEditPrice = (item) => {
  item.editing = false;
  delete item.newPreco;
};

const savePrice = async (item) => {
  if (!item.newPreco) {
    toast.error('Digite um preço válido');
    return;
  }

  try {
    await pricingStore.updatePricing(auditor.value.id, item.produtoId, item.newPreco);
    item.preco = item.newPreco;
    item.editing = false;
    delete item.newPreco;
    toast.success('Preço atualizado');
    await pricingStore.fetchPricing(auditor.value.id);
  } catch (error) {
    toast.error('Erro ao atualizar preço');
  }
};

const confirmDeletePrice = (item) => {
  confirmModal.value = {
    title: 'Remover Preço',
    message: `Deseja remover o preço de ${item.produtoNome}?`,
    warning: '',
    confirmText: 'Remover',
    isDanger: true,
    action: async () => {
      confirmModalLoading.value = true;
      await deletePrice(item);
      confirmModalLoading.value = false;
      showConfirmModal.value = false;
    }
  };
  showConfirmModal.value = true;
};

const deletePrice = async (item) => {
  try {
    await pricingStore.deletePricing(auditor.value.id, item.produtoId);
    toast.success('Preço removido');
  } catch (error) {
    toast.error('Erro ao remover preço');
  }
};

const formatPrice = (value) => {
  return parseFloat(value).toFixed(2).replace('.', ',');
};

const getProdutoIcon = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.icon || 'bi bi-box';
};

const getProdutoUnidade = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.unidade;
};

const getProdutoNome = (produtoId) => {
  const produto = produtosStore.produtos.find(p => p.id === parseInt(produtoId));
  return produto?.nome || 'Produto não encontrado';
};

const hasRole = (role) => {
  return authStore.hasRole(role);
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
  if (!status) return 'badge-secondary';
  const classes = {
    aptoAuditoria: 'badge-success',
    emFormacao: 'badge-warning',
    primeiraAuditoria: 'badge-secondary',
    auditorInativo: 'badge-danger',
  };
  return classes[status] || 'badge-secondary';
};

const getNormaLabel = (normaId) => {
  const norma = normasStore.getNormaById(normaId);
  return norma?.norma || normaId;
};

const getNaceLabel = (naceId) => {
  const nace = nacesStore.getNaceById(naceId);
  return nace ? `${nace.nace} - ${nace.descricao}` : naceId;
};

const getHistoryIcon = (action) => {
  const icons = {
    ADD_NACE_AUDITOR: 'bi bi-plus-circle text-success',
    REMOVE_NACE_AUDITOR: 'bi bi-dash-circle text-danger',
    ADD_NORMA_AUDITOR: 'bi bi-plus-circle text-success',
    REMOVE_NORMA_AUDITOR: 'bi bi-dash-circle text-danger',
    ADD_AUDITOR: 'bi bi-person-plus text-success',
    UPDATE_AUDITOR: 'bi bi-pencil text-primary',
  };
  return icons[action] || 'bi bi-circle text-secondary';
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('pt-BR');
};
</script>

<style scoped>
.detalhes-auditor-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.page-loading .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e70d0c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.page-loading p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.header-info h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 8px 0;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.badge-secondary {
  background: #e2e3e5;
  color: #383d41;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-primary {
  background: #cce5ff;
  color: #004085;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

.main-content,
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card,
.action-card,
.history-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h2,
.action-card h3,
.history-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-edit {
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

.btn-edit:hover {
  border-color: #e70d0c;
  color: #e70d0c;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 15px;
  color: #333;
}

.info-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-with-action span {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f5f5f5;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-link:hover {
  background: #e70d0c;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 13, 12, 0.2);
}

.action-link i {
  font-size: 16px;
}

.action-link-whatsapp:hover {
  background: #25D366;
  color: white;
  box-shadow: 0 4px 8px rgba(37, 211, 102, 0.2);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.tag-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  border-radius: 4px;
  font-size: 18px;
  padding: 0;
}

.tag-remove:hover {
  background: #dc3545;
  color: white;
}

.tag-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: transparent;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
  transition: all 0.2s;
}

.tag-add:hover {
  border-color: #e70d0c;
  color: #e70d0c;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.action-btn:hover {
  background: #e70d0c;
  border-color: #e70d0c;
  color: white;
}

.action-btn.danger:hover {
  background: #dc3545;
  border-color: #dc3545;
}

/* Switch Styles */
.switch-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
}

.switch-container:hover {
  background: #e9ecef;
}

.switch-container.blocked {
  background: #f5f5f5;
  border: 2px solid #ccc;
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-container.blocked:hover {
  background: #f5f5f5;
}

.switch-container.blocked .switch-info {
  color: #999;
}

.switch-container.blocked .switch-info i {
  color: #999;
}

.switch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.switch-info i {
  font-size: 16px;
  color: #666;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #e70d0c;
}

input:checked + .slider.slider-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c62828 100%);
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:focus + .slider {
  box-shadow: 0 0 1px #e70d0c;
}

input:focus + .slider.slider-danger {
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.8);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.action-select {
  width: 100%;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.action-select:hover {
  border-color: #e70d0c;
}

.action-select:focus {
  outline: none;
  border-color: #e70d0c;
  background: white;
}

.action-select:disabled,
.action-select.loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.action-select.blocked {
  background: #f5f5f5;
  border-color: #999;
  color: #999;
  cursor: not-allowed;
  pointer-events: none;
}

.action-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-indicator {
  color: #e70d0c;
  font-size: 14px;
}

.blocked-indicator {
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.switch-container.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.switch-container.loading .switch-info i {
  color: #e70d0c;
}

/* Estilo perigoso quando desqualificado está ativo */
.switch-container.active-danger {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 2px solid #dc3545;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
  animation: pulse-danger 2s ease-in-out infinite;
}

.switch-container.active-danger .switch-info {
  color: #c62828;
  font-weight: 600;
}

.switch-container.active-danger .switch-info i {
  color: #dc3545;
  font-size: 18px;
  animation: shake 0.5s ease-in-out infinite;
}

.switch-container.active-danger:hover {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  border-color: #c62828;
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.5);
}

@keyframes pulse-danger {
  0%, 100% {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(220, 53, 69, 0.5);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-2px) rotate(-3deg);
  }
  75% {
    transform: translateX(2px) rotate(3deg);
  }
}

.spin {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.load-history {
  text-align: center;
  padding: 20px;
}

.btn-load {
  padding: 10px 20px;
  background: #e70d0c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-icon {
  font-size: 20px;
}

.history-content {
  flex: 1;
}

.history-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.history-value {
  font-size: 13px;
  color: #666;
  margin: 4px 0;
  white-space: pre-wrap;
}

.history-content small {
  font-size: 12px;
  color: #999;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
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
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin: auto;
}

@media (max-height: 700px) {
  .modal-content {
    max-height: calc(100vh - 20px);
  }
  
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }
}

@media (max-height: 500px) {
  .modal-header {
    padding: 16px !important;
  }
  
  .modal-body {
    padding: 16px !important;
  }
  
  .modal-footer {
    padding: 16px !important;
  }
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
  overflow-y: auto;
  flex: 1;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.iaf-filter {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.iaf-filter:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.selection-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.selection-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.selection-item:hover {
  background: #f8f9fa;
  border-color: #e70d0c;
}

.selection-item input[type="radio"] {
  margin-top: 2px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
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

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.modal-confirm {
  max-width: 500px;
}

.modal-confirm .modal-body p {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: #555;
  line-height: 1.6;
}

.modal-confirm .modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  font-weight: 500;
}

.warning-text i {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.text-success { color: #28a745; }
.text-danger { color: #dc3545; }
.text-primary { color: #007bff; }
.text-secondary { color: #6c757d; }

/* Pricing Styles */
.pricing-table {
  margin-bottom: 16px;
}

.pricing-table table {
  width: 100%;
  border-collapse: collapse;
}

.pricing-table thead {
  background: #f8f9fa;
}

.pricing-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}

.pricing-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.produto-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.produto-icon-table {
  font-size: 18px;
  color: #e70d0c;
}

.unidade-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f0f0;
  color: #666;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.pricing-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-edit-price {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit-price:hover {
  background: #1976d2;
  color: white;
}

.btn-save {
  background: #d4edda;
  color: #155724;
}

.btn-save:hover {
  background: #155724;
  color: white;
}

.btn-cancel {
  background: #f8d7da;
  color: #721c24;
}

.btn-cancel:hover {
  background: #721c24;
  color: white;
}

.btn-delete-price {
  background: #f8d7da;
  color: #721c24;
}

.btn-delete-price:hover {
  background: #dc3545;
  color: white;
}

.price-input {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Red Hat Text', sans-serif;
}

.price-input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.price-input-large {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
}

.price-input-large:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.empty-pricing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #999;
}

.empty-pricing i {
  font-size: 48px;
}

.btn-add-pricing {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
  margin-top: 16px;
}

.btn-add-pricing:hover {
  border-color: #e70d0c;
  color: #e70d0c;
  background: rgba(231, 13, 12, 0.05);
}

.price-input-large {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Red Hat Text', sans-serif;
  transition: all 0.2s;
}

.price-input-large:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

/* Produto Preview in Modal */
.produto-preview {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  font-size: 28px;
  color: #e70d0c;
  flex-shrink: 0;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-nome {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.preview-unidade {
  font-size: 12px;
  color: #666;
  background: white;
  padding: 4px 10px;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
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

.error-message {
  text-align: center;
  padding: 60px 20px;
  max-width: 600px;
  margin: 60px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message i {
  font-size: 64px;
  color: #e70d0c;
  margin-bottom: 20px;
}

.error-message h2 {
  color: #333;
  margin-bottom: 12px;
}

.error-message p {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
}

/* Zeev Sync Styles */
.zeev-card .zeev-logo {
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
}

.zeev-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.zeev-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.status-indicator i {
  font-size: 20px;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
}

.zeev-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.zeev-details .info-item {
  display: flex;
  gap: 8px;
}

.zeev-details .info-item label {
  font-weight: 600;
  color: #666;
  min-width: 140px;
}

.zeev-details .info-item span {
  color: #333;
}

.zeev-details .info-item .text-warning {
  color: #856404;
  font-weight: 600;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}

.alert i {
  font-size: 18px;
  margin-top: 2px;
}

.alert strong {
  margin-right: 4px;
}

.zeev-not-synced {
  text-align: center;
  padding: 30px 20px;
}

.zeev-not-synced p {
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
}

.zeev-not-synced .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 968px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-2 {
    grid-column: span 1;
  }
}
</style>
