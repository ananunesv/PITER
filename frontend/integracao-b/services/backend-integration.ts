/**
 * Serviço centralizado de integração com backend
 * Centraliza todas as chamadas à API, tratamento de erros e cache
 */

import {
  RankingResponse,
  GazetteAnalysis,
  SearchFilters,
  PaginatedResponse,
  ApiError,
  Municipality,
  RankingByInvestment,
} from '../types';
import { API_CONFIG, buildApiUrl, getDefaultHeaders } from '../config/api-config';

/**
 * Cache simples em memória
 */
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  set(key: string, data: any): void {
    if (API_CONFIG.CACHE.ENABLED) {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  }

  get(key: string): any | null {
    if (!API_CONFIG.CACHE.ENABLED) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > API_CONFIG.CACHE.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

/**
 * Classe para lidar com erros de API
 */
class ApiErrorHandler {
  static create(error: unknown): ApiError {
    if (error instanceof Response) {
      return {
        message: error.statusText || 'Erro desconhecido da API',
        code: `HTTP_${error.status}`,
        status: error.status,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'CLIENT_ERROR',
        status: 0,
      };
    }

    return {
      message: 'Erro desconhecido',
      code: 'UNKNOWN_ERROR',
      status: 0,
    };
  }
}

/**
 * Serviço principal de integração
 */
export class BackendIntegrationService {
  /**
   * Realiza uma requisição genérica com tratamento de erros
   */
  private static async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getDefaultHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      const apiError = ApiErrorHandler.create(error);
      console.error('Erro na requisição da API:', apiError);
      throw apiError;
    }
  }

  /**
   * Obtém o ranking completo de municípios
   */
  static async getRanking(): Promise<RankingResponse> {
    const cacheKey = 'ranking:all';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.RANKING);
    const data = await this.request<RankingResponse>(url);
    
    apiCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obtém ranking por publicações
   */
  static async getRankingByPublications(): Promise<RankingResponse> {
    const cacheKey = 'ranking:publications';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.RANKING_BY_PUBLICATIONS);
    const data = await this.request<RankingResponse>(url);
    
    apiCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obtém ranking por investimento
   */
  static async getRankingByInvestment(): Promise<RankingByInvestment[]> {
    const cacheKey = 'ranking:investment';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.RANKING_BY_INVESTMENT);
    const data = await this.request<RankingResponse>(url);
    
    apiCache.set(cacheKey, data.rankings.by_investment);
    return data.rankings.by_investment;
  }

  /**
   * Pesquisa dados com filtros
   */
  static async search(
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<GazetteAnalysis>> {
    const params: Record<string, string> = {
      page: page.toString(),
      page_size: pageSize.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
    };

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH, params);
    return this.request<PaginatedResponse<GazetteAnalysis>>(url);
  }

  /**
   * Obtém detalhes de análise por ID
   */
  static async getAnalysis(analysisId: string): Promise<GazetteAnalysis> {
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ANALYSIS}/${analysisId}`);
    return this.request<GazetteAnalysis>(url);
  }

  /**
   * Obtém detalhes de um município específico
   */
  static async getMunicipalityDetail(territoryId: string): Promise<Municipality> {
    const cacheKey = `municipality:${territoryId}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = buildApiUrl(
      API_CONFIG.ENDPOINTS.MUNICIPALITY_DETAIL.replace(':id', territoryId)
    );
    const data = await this.request<Municipality>(url);
    
    apiCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obtém lista de todos os municípios
   */
  static async getMunicipalities(): Promise<Record<string, Municipality>> {
    const cacheKey = 'municipalities:all';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MUNICIPALITIES);
    const ranking = await this.request<RankingResponse>(url);
    
    apiCache.set(cacheKey, ranking.municipalities);
    return ranking.municipalities;
  }

  /**
   * Limpa o cache
   */
  static clearCache(): void {
    apiCache.clear();
  }

  /**
   * Invalida cache específico
   */
  static invalidateCache(pattern: string): void {
    // Implementação simples - em produção usar pattern matching
    if (pattern === '*') {
      this.clearCache();
    }
  }
}

export default BackendIntegrationService;
