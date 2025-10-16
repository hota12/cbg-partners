# 🛠️ Guia de Desenvolvimento - CBG Auditores

## 🚀 Comandos Essenciais

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

---

## 📁 Estrutura de Diretórios

```
cbg-partners/
│
├── public/                    # Arquivos estáticos
│   ├── favicon.png           # ❌ Adicione este arquivo
│   ├── logo.png              # ❌ Adicione este arquivo
│   ├── path6.svg             # ✅ Background do login
│   └── selos/                # ❌ Crie esta pasta
│       ├── 12.png            #    Selo ISO 9001
│       ├── 13.png            #    Selo ISO 14001
│       └── ...               #    Outros selos
│
├── src/
│   ├── assets/               # Assets do projeto
│   ├── components/           # Componentes reutilizáveis
│   ├── composables/          # Composables Vue
│   ├── router/               # Configuração de rotas
│   ├── services/             # Serviços (API)
│   ├── stores/               # Stores Pinia
│   ├── views/                # Páginas/Views
│   ├── App.vue               # Componente raiz
│   ├── main.js               # Entry point
│   └── style.css             # Estilos globais
│
├── index.html                # HTML principal
├── package.json              # Dependências
├── vite.config.js            # Config Vite
├── INSTRUCOES.md             # Instruções detalhadas
└── RESUMO.md                 # Resumo da implementação
```

---

## 🎯 Fluxo de Autenticação

```
1. Usuário acessa /login
2. Digita email e senha
3. Submete formulário
4. API retorna { token, email }
5. Token salvo no localStorage
6. Fetch user data (GET /user/me)
7. User salvo na store auth
8. Redirect para /
```

### Proteção de Rotas
```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.requiredRole;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (requiredRole && !authStore.hasRole(requiredRole)) {
    next('/');
  } else {
    next();
  }
});
```

---

## 🗄️ Como Usar as Stores

### Auth Store
```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Login
await authStore.login(email, password);

// Logout
authStore.logout();

// Verificar permissão
if (authStore.hasRole('editAuditors')) {
  // Mostrar botão editar
}

// User atual
console.log(authStore.user);
```

### Auditores Store
```javascript
import { useAuditoresStore } from '@/stores/auditores';

const auditoresStore = useAuditoresStore();

// Listar todos
await auditoresStore.fetchAuditores();

// Buscar um específico
await auditoresStore.fetchAuditor(id);

// Criar
const auditor = await auditoresStore.createAuditor(data);

// Atualizar
await auditoresStore.updateAuditor(id, data);

// Deletar
await auditoresStore.deleteAuditor(id);

// Adicionar norma
await auditoresStore.addNorma(auditorId, normaId);

// Remover norma
await auditoresStore.removeNorma(auditorId, normaId);

// Filtros
auditoresStore.setFilter('cidade', 'Joinville');
const filtrados = auditoresStore.auditoresFiltrados;
```

### Normas Store (com cache)
```javascript
import { useNormasStore } from '@/stores/normas';

const normasStore = useNormasStore();

// Buscar (só carrega se não estiver em cache)
await normasStore.fetchNormas();

// Acessar
const normas = normasStore.normas;

// Buscar por ID
const norma = normasStore.getNormaById(12);
```

---

## 🎨 Como Usar Componentes

### Toast Notifications
```javascript
import { useToast } from '@/composables/useToast';

const toast = useToast();

// Sucesso
toast.success('Operação realizada com sucesso!');

// Erro
toast.error('Ocorreu um erro!');

// Aviso
toast.warning('Atenção!');

// Info
toast.info('Informação importante');
```

### Button com Loading
```vue
<template>
  <ButtonLoader 
    @click="handleSave"
    :loading="saving"
    variant="primary"
  >
    <i class="bi bi-check"></i>
    Salvar
  </ButtonLoader>
</template>

<script setup>
import ButtonLoader from '@/components/ButtonLoader.vue';
import { ref } from 'vue';

const saving = ref(false);

const handleSave = async () => {
  saving.value = true;
  try {
    // Sua lógica
  } finally {
    saving.value = false;
  }
};
</script>
```

### Loading Overlay
```vue
<template>
  <div class="card">
    <LoadingOverlay :show="loading" />
    <!-- Seu conteúdo -->
  </div>
</template>

<script setup>
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import { ref } from 'vue';

const loading = ref(false);
</script>
```

---

## 🎯 Permissões (Roles)

### No Template
```vue
<template>
  <button v-if="authStore.hasRole('editAuditors')">
    Editar
  </button>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>
```

### No Script
```javascript
const canEdit = computed(() => authStore.hasRole('editAuditors'));

if (canEdit.value) {
  // Lógica
}
```

### Roles Disponíveis
- `viewAuditors` - Ver auditores
- `editAuditors` - Editar/deletar
- `historyAuditors` - Ver histórico
- `viewPricingAuditors` - Ver preços
- `editPricingAuditors` - Editar preços
- `viewProducts` - Ver produtos
- `editProducts` - Editar produtos

---

## 🔧 Configuração da API

### Base URL
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'https://api.cbgcertificadora.com.br/webhook',
});
```

### Interceptors
```javascript
// Request - Adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response - Trata erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🎨 Personalização de Estilos

### Variáveis CSS
```css
:root {
  --primary-color: #e70d0c;
  --primary-hover: #c00b0a;
  --dark-blue: #001e66;
  --text-color: #333;
}
```

### Classes Utilitárias
```css
.container { max-width: 1140px; }
border-radius: 8px; /* Padrão em todos elementos */
font-family: 'Red Hat Text'; /* Fonte global */
```

---

## 📱 Breakpoints Responsivos

```css
/* Mobile First */
@media (max-width: 768px) {
  /* Estilos mobile */
}

@media (max-width: 968px) {
  /* Tablet */
}

@media (min-width: 1140px) {
  /* Desktop */
}
```

---

## 🐛 Debug e Troubleshooting

### Ver estado da Store
```javascript
import { useAuditoresStore } from '@/stores/auditores';
const store = useAuditoresStore();
console.log('Estado:', store.$state);
```

### Limpar Cache
```javascript
// Limpar localStorage
localStorage.clear();

// Limpar cache de normas/naces
normasStore.loaded = false;
nacesStore.loaded = false;
```

### Vue DevTools
Instale a extensão Vue DevTools no navegador para:
- Inspecionar componentes
- Ver estado das stores
- Timeline de eventos
- Performance

---

## 🚀 Deploy para Produção

### Build
```bash
npm run build
```

Gera pasta `dist/` com arquivos otimizados.

### Variáveis de Ambiente
Crie `.env.production`:
```
VITE_API_BASE_URL=https://api.cbgcertificadora.com.br/webhook
```

Use no código:
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## 📝 Boas Práticas

### 1. Sempre use try/catch
```javascript
try {
  await store.fetchData();
  toast.success('Sucesso');
} catch (error) {
  toast.error('Erro');
  console.error(error);
}
```

### 2. Loading states
```javascript
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    // API call
  } finally {
    loading.value = false; // Sempre executa
  }
};
```

### 3. Feedback para o usuário
```javascript
// Sempre mostre toast após ações
await deleteItem();
toast.success('Item deletado!');
```

### 4. Confirmações
```javascript
// Sempre confirme ações destrutivas
const confirmDelete = () => {
  showModal.value = true;
};
```

---

## 🎓 Recursos Úteis

- [Vue 3 Docs](https://vuejs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Vue Router Docs](https://router.vuejs.org/)
- [Axios Docs](https://axios-http.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Vite Docs](https://vitejs.dev/)

---

**Happy Coding! 🚀**
