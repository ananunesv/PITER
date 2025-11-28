/**
 * Tipos para integração com backend P.I.T.E.R
 * Define estruturas de dados centralizadas para toda aplicação frontend
 */

/**
 * Dados de uma categoria de investimento
 */
export interface CategoryData {
  [key: string]: number;
}

/**
 * Faixa de datas
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Estatísticas de uma entidade
 */
export interface EntityCount {
  [key: string]: number;
}

/**
 * Estatísticas de um município
 */
export interface MunicipalityStatistics {
  total_gazettes: number;
  date_range: DateRange;
  total_entities: number;
  entity_counts_by_type: EntityCount;
  top_entities: Record<string, unknown>;
  total_invested: number;
  top_categories: CategoryData;
}

/**
 * Dados completos de um município
 */
export interface Municipality {
  total_gazettes: number;
  total_invested: number;
  top_categories: CategoryData;
  statistics: MunicipalityStatistics;
}

/**
 * Mapeamento de todos os municípios
 */
export interface MunicipalitiesData {
  [territoryId: string]: Municipality;
}

/**
 * Item de ranking por publicações
 */
export interface RankingByPublications {
  territory_id: string;
  total: number;
  rank: number;
}

/**
 * Categoria com valor para ranking de investimento
 */
export interface RankingCategory {
  category: string;
  value: number;
}

/**
 * Item de ranking por investimento
 */
export interface RankingByInvestment {
  territory_id: string;
  total_invested: number;
  top_categories: RankingCategory[];
  rank: number;
}

/**
 * Estrutura de rankings
 */
export interface RankingsData {
  by_publications: RankingByPublications[];
  by_investment: RankingByInvestment[];
  total_municipalities: number;
}

/**
 * Resposta completa do ranking de municípios
 */
export interface RankingResponse {
  municipalities: MunicipalitiesData;
  rankings: RankingsData;
}

/**
 * Dados de análise de gazeta
 */
export interface GazetteAnalysis {
  territory_id: string;
  territory_name?: string;
  analysis_date?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Filtros de pesquisa
 */
export interface SearchFilters {
  territory_id?: string;
  search_term?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * Resposta de pesquisa paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Estado de carregamento da API
 */
export interface ApiState {
  loading: boolean;
  error: string | null;
  data: any;
}

/**
 * Resposta genérica de erro
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
}
