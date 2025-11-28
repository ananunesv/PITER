/**
 * Configuração de endpoints e URLs do backend
 */

export const API_CONFIG = {
  // URL base do backend (pode ser ajustada via variáveis de ambiente)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

  // Endpoints da API
  ENDPOINTS: {
    // Ranking
    RANKING: '/api/ranking',
    RANKING_BY_PUBLICATIONS: '/api/ranking/publications',
    RANKING_BY_INVESTMENT: '/api/ranking/investment',
    
    // Búsqueda e análises
    SEARCH: '/api/search',
    ANALYSIS: '/api/analysis',
    GAZETTE: '/api/gazette',
    
    // Municípios
    MUNICIPALITIES: '/api/municipalities',
    MUNICIPALITY_DETAIL: '/api/municipalities/:id',
  },

  // Timeout para requisições (em ms)
  TIMEOUT: 30000,

  // Configurações de cache
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutos
  },

  // Configurações de paginação padrão
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
};

/**
 * Constrói URL completa para um endpoint
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
};

/**
 * Headers padrão para requisições
 */
export const getDefaultHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});
