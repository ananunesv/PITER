# Integração-B: Arquitetura Limpa para Backend Integration

## 📋 Visão Geral

A pasta `integracao-b` implementa uma arquitetura limpa e escalável para integração com o backend, separando completamente a lógica de chamadas à API da interface de usuário.

## 📁 Estrutura de Pastas

```
frontend/integracao-b/
├── index.ts                    # Ponto central de exportações
├── types/
│   └── index.ts               # Tipos TypeScript centralizados
├── config/
│   └── api-config.ts          # Configuração de endpoints e URLs
└── services/
    └── backend-integration.ts  # Serviço principal com lógica de API
```

## 🎯 Componentes

### 1. **Types** (`types/index.ts`)

Define todos os tipos TypeScript usados na integração:

- `Municipality` - Dados de um município
- `RankingResponse` - Estrutura completa de ranking
- `GazetteAnalysis` - Dados de análise de gazeta
- `SearchFilters` - Filtros para busca
- `PaginatedResponse` - Resposta paginada genérica
- `ApiError` - Estrutura padrão de erro

**Benefícios:**
- Type safety em toda aplicação
- Autocomplete no IDE
- Fácil manutenção de mudanças no backend

### 2. **Config** (`config/api-config.ts`)

Centraliza configurações de API:

```typescript
// Endpoints
API_CONFIG.ENDPOINTS.RANKING
API_CONFIG.ENDPOINTS.SEARCH
API_CONFIG.ENDPOINTS.MUNICIPALITIES

// Configurações
API_CONFIG.BASE_URL        // URL base do backend
API_CONFIG.TIMEOUT         // Timeout de requisições
API_CONFIG.CACHE.ENABLED   // Habilitar cache
API_CONFIG.PAGINATION      // Configurações de paginação
```

**Funções auxiliares:**
- `buildApiUrl()` - Constrói URL com parâmetros
- `getDefaultHeaders()` - Headers padrão de requisições

### 3. **Services** (`services/backend-integration.ts`)

Serviço principal `BackendIntegrationService` com métodos:

#### Ranking
```typescript
BackendIntegrationService.getRanking()              // Ranking completo
BackendIntegrationService.getRankingByPublications() // Por publicações
BackendIntegrationService.getRankingByInvestment()  // Por investimento
```

#### Busca
```typescript
BackendIntegrationService.search(filters, page, pageSize)
```

#### Municípios
```typescript
BackendIntegrationService.getMunicipalityDetail(territoryId)
BackendIntegrationService.getMunicipalities()
```

#### Cache
```typescript
BackendIntegrationService.clearCache()
BackendIntegrationService.invalidateCache(pattern)
```

**Features:**
- ✅ Tratamento automático de erros
- ✅ Cache em memória com TTL
- ✅ Type safety completo
- ✅ Suporte a paginação

### 4. **Dashboard Pesquisa** (`components/pages/dashboard-pesquisa.tsx`)

Componente React completo com:

**Features:**
- 🔍 Filtros avançados (termo, município, categoria, datas)
- 📊 Resumo de dados com estatísticas
- 📄 Lista de resultados paginada
- 🎨 Design responsivo com Tailwind CSS
- ⚠️ Tratamento completo de erros
- ⏳ Estados de carregamento
- 🖱️ Modal com detalhes de resultado

**Estados gerenciados:**
- Carregamento e erro
- Resultados de pesquisa
- Paginação
- Filtros selecionados
- Resultado selecionado

### 5. **Hook useSearch** (`hooks/useSearch.ts`)

Hook customizado para gerenciar estado de pesquisa:

```typescript
const {
  loading,
  error,
  results,
  totalResults,
  currentPage,
  totalPages,
  search,
  clearResults,
  nextPage,
  previousPage,
  goToPage,
} = useSearch({ initialPageSize: 10 });
```

**Benefícios:**
- Reutilizável em múltiplos componentes
- Lógica abstraída
- Fácil de testar

## 🚀 Como Usar

### Importar tipos

```typescript
import { 
  RankingResponse, 
  Municipality, 
  SearchFilters 
} from '@/integracao-b';
```

### Usar o serviço

```typescript
import { BackendIntegrationService } from '@/integracao-b';

// Obter ranking
const ranking = await BackendIntegrationService.getRanking();

// Pesquisar
const results = await BackendIntegrationService.search(
  { territory_id: '5208707', search_term: 'investimento' },
  1,
  10
);
```

### Usar o hook

```typescript
import { useSearch } from '@/hooks/useSearch';

function MyComponent() {
  const { search, results, loading, error } = useSearch();

  const handleSearch = async () => {
    await search({ territory_id: '5208707' });
  };

  return (
    // seu componente aqui
  );
}
```

## 🔧 Configuração

### Variáveis de ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Customizar endpoints

Editar `integracao-b/config/api-config.ts`:

```typescript
ENDPOINTS: {
  RANKING: '/api/v2/ranking',  // Novo path
  // ...
}
```

### Desabilitar cache

```typescript
API_CONFIG.CACHE.ENABLED = false;
```

## 📊 Padrões Implementados

### 1. **Service Pattern**
Centraliza lógica de API em um serviço reutilizável

### 2. **Repository Pattern**
`BackendIntegrationService` atua como repositório de dados

### 3. **Custom Hooks Pattern**
`useSearch` encapsula lógica de estado e efeitos

### 4. **Type Safety**
Tipos TypeScript em toda estrutura

### 5. **Error Handling**
Classe `ApiErrorHandler` padroniza erros

### 6. **Caching Strategy**
Cache em memória com TTL para otimizar requisições

## 🔄 Fluxo de Dados

```
Componente UI
     ↓
useSearch Hook (gerencia estado)
     ↓
BackendIntegrationService (lógica de API)
     ↓
API Config (URLs e headers)
     ↓
Backend API
```

## 🧪 Testando

### Testar o serviço

```typescript
import { BackendIntegrationService } from '@/integracao-b';

// Teste básico
try {
  const ranking = await BackendIntegrationService.getRanking();
  console.log('✅ Ranking carregado:', ranking);
} catch (error) {
  console.error('❌ Erro:', error);
}
```

### Testar o componente

```typescript
import DashboardPesquisa from '@/components/pages/dashboard-pesquisa';

export default function Page() {
  return <DashboardPesquisa />;
}
```

## 📈 Escalabilidade

A arquitetura permite fácil crescimento:

1. **Novo endpoint?** → Adicione em `config/api-config.ts` + método em `BackendIntegrationService`
2. **Novo tipo?** → Adicione em `types/index.ts`
3. **Novo componente?** → Use `BackendIntegrationService` ou `useSearch`

## ⚡ Performance

- **Cache automático** reduz requisições repetidas
- **Paginação** otimiza transferência de dados
- **Type safety** evita erros em runtime
- **Lazy loading** no componente (modal de detalhes)

## 🐛 Troubleshooting

### "Erro ao buscar dados"

1. Verifique `NEXT_PUBLIC_API_URL` em `.env.local`
2. Confirme que backend está rodando
3. Verifique CORS se necessário

### Tipos não encontrados

```bash
# Limpe cache do TypeScript
rm -rf node_modules/.cache
npm install
```

## 📝 Próximas Melhorias

- [ ] Implementar paginação com cursor
- [ ] Adicionar retry automático para falhas
- [ ] Implementar filtering no frontend
- [ ] Adicionar export para CSV/PDF
- [ ] Integrar com React Query para caching avançado

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com/)
