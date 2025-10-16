# 📋 Instruções Finais - Sistema CBG Auditores

## ✅ O que foi implementado

### 1. Estrutura Completa
- ✅ Vue 3 + Vite configurado
- ✅ Pinia para gerenciamento de estado
- ✅ Vue Router com proteção de rotas
- ✅ Axios com interceptors
- ✅ Sistema de Toast notifications
- ✅ Componentes reutilizáveis

### 2. Stores (Pinia)
- ✅ **auth.js** - Autenticação e permissões
- ✅ **auditores.js** - CRUD de auditores + filtros
- ✅ **normas.js** - Gestão de normas (cache)
- ✅ **naces.js** - Gestão de NACE (cache)
- ✅ **produtos.js** - CRUD de produtos
- ✅ **historico.js** - Histórico de alterações
- ✅ **pricing.js** - Preços de auditores

### 3. Views/Páginas
- ✅ **Login.vue** - Tela de login com design especificado
- ✅ **Dashboard.vue** - Lista de auditores com filtros avançados
- ✅ **NovoAuditor.vue** - Cadastro de auditor + normas + naces
- ✅ **DetalhesAuditor.vue** - Edição, histórico, ações rápidas
- ✅ **Produtos.vue** - Gerenciamento de produtos

### 4. Componentes
- ✅ **AppHeader.vue** - Header com navegação e menu mobile
- ✅ **ToastNotification.vue** - Sistema de notificações
- ✅ **ButtonLoader.vue** - Botão com loading
- ✅ **LoadingOverlay.vue** - Overlay de carregamento

### 5. Funcionalidades Implementadas
- ✅ Autenticação com JWT
- ✅ Sistema de permissões (roles)
- ✅ CRUD completo de auditores
- ✅ Associação de normas e NACE
- ✅ Filtros avançados (cidade, estado, status, norma, nace, inativo)
- ✅ Histórico de alterações (carrega sob demanda)
- ✅ Tornar auditor em revisor
- ✅ Desqualificar/Requalificar auditor
- ✅ Ativar/Inativar auditor
- ✅ CRUD de produtos
- ✅ Design responsivo
- ✅ Toasts para feedback
- ✅ Loading states

## 🎨 Design Aplicado
- ✅ Cor primária: #e70d0c
- ✅ Fonte: Red Hat Text (Google Fonts)
- ✅ Border radius: 8px em todos elementos
- ✅ Bootstrap Icons
- ✅ Fundo branco nas páginas
- ✅ Background gradiente no login
- ✅ Responsivo para mobile
- ✅ Container 1140px

## 📝 Arquivos que você precisa adicionar

### 1. Logo da empresa
Adicione o arquivo: `public/logo.png`
- Usado no header de todas as páginas
- Usado na tela de login

### 2. Favicon
O favicon já está referenciado como: `public/favicon.png`
- Certifique-se de que o arquivo existe

### 3. Selos das Normas
Crie a pasta: `public/selos/`
Adicione imagens com o nome igual ao ID da norma:
- `public/selos/12.png` (ISO 9001)
- `public/selos/13.png` (ISO 14001)
- `public/selos/14.png` (ISO 45001)
- etc...

### 4. Background SVG do Login
O arquivo `public/path6.svg` foi criado como placeholder.
Substitua pelo seu SVG real se necessário.

## 🚀 Como executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔐 Credenciais de Teste

```
Email: anton@cbgcertificadora.com.br
Senha: Kaka22222
```

## 🌐 API

Base URL: `https://api.cbgcertificadora.com.br/webhook`

Todas as rotas (exceto login) usam autenticação Bearer Token.

## ⚙️ Configurações Importantes

### Permissões (Roles)
- `viewAuditors` - Ver auditores
- `editAuditors` - Editar/deletar auditores
- `historyAuditors` - Ver histórico
- `viewPricingAuditors` - Ver preços
- `editPricingAuditors` - Editar preços
- `viewProducts` - Ver produtos
- `editProducts` - Editar produtos

### Status do Auditor
- `aptoAuditoria` - Apto para Auditoria
- `emFormacao` - Em Formação
- `primeiraAuditoria` - Primeira Auditoria

**Nota:** O status do auditor pode ser alterado na tela de edição (DetalhesAuditor) ou durante o cadastro.

### Eventos do Histórico
- `ADD_NACE_AUDITOR`
- `REMOVE_NACE_AUDITOR`
- `ADD_NORMA_AUDITOR`
- `REMOVE_NORMA_AUDITOR`
- `ADD_AUDITOR`
- `UPDATE_AUDITOR`
- `ADD_AUDITOR_PRICING`
- `REMOVE_AUDITOR_PRICING`
- `ADD_PRODUCT`
- `UPDATE_PRODUCT`
- `REMOVE_PRODUCT`

## 📱 Responsividade

A aplicação é totalmente responsiva:
- Desktop (1140px container)
- Tablet (adaptativo)
- Mobile (menu hamburguer, layouts ajustados)

## 🎯 Próximas Melhorias Sugeridas

1. **Gestão de Preços de Auditores**
   - Tela para adicionar/editar preços por produto
   - Implementar na view de detalhes do auditor

2. **Filtro por IAF**
   - Adicionar filtro de IAF no dashboard

3. **Paginação**
   - Implementar paginação na lista de auditores

4. **Exportação**
   - Exportar lista de auditores (PDF/Excel)

5. **Busca Avançada**
   - Melhorar sistema de busca com operadores

6. **Relatórios**
   - Dashboard com estatísticas
   - Gráficos de auditores por região, norma, etc.

## 🐛 Debugging

### Token expirado
Se o token expirar, o usuário será automaticamente redirecionado para login.

### Cache de Normas/NACE
Normas e NACE são carregados uma vez e mantidos em cache (flag `loaded`).
Para forçar reload, limpe o localStorage.

### Histórico
O histórico é carregado sob demanda ao clicar em "Carregar Histórico"
para otimizar performance.

## 📞 Suporte

Para dúvidas sobre a API ou funcionalidades específicas,
consulte a documentação fornecida ou entre em contato com o time de backend.

---

**Desenvolvido com ❤️ para CBG Certificadora**
