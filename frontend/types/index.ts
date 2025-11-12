// TIPOS PARA O P.I.T.E.R - Procurador de Investimentos em Tecnologia na Educação e Recursos

export interface SearchFilters {
  municipio: string;
  categoria: 'robotica' | 'software' | '';
  dataInicio: string;
  dataFim: string;
  territory_id?: string;
  published_since?: string;
  published_until?: string;
  querystring?: string;
}

export interface RankingFilters {
  territory_id: string;
  published_since: string;
  published_until: string;
  querystring: string;
}

export interface Gazette {
  territory_id: string;
  territory_name: string;
  date: string;
  url: string;
  txt_url?: string;
  edition?: string;
  is_extra_edition?: boolean;
  excerpts?: string[];
  scraped_at?: string;
  state_code?: string;
}

export interface SearchResponse {
  total_gazettes: number;
  gazettes: Gazette[];
}

export interface SearchState {
  results: Gazette[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: SearchFilters;
}

export interface RankingData {
  municipalities: {
    [key: string]: {
      total_gazettes: number;
      statistics: any;
    };
  };
  rankings: {
    by_publications: Array<{
      territory_id: string;
      total: number;
      rank: number;
    }>;
    by_investment?: Array<{
      territory_id: string;
      total_invested: number;
      top_categories: Array<{ category: string; value: number }>;
      rank: number;
    }>;
    total_municipalities: number;
  };
}

// Opções para os selects
export const MUNICIPALITIES = [
  { value: '5208707', label: 'Goiânia', state_code: 'GO' },
  { value: '5201405', label: 'Aparecida de Goiânia', state_code: 'GO' },
] as const;

export const STATES = [
  { value: '52', label: 'Goiás', state_code: 'GO' },
] as const;

export const CATEGORIES = [
  { value: 'robotica', label: 'Robótica Educacional' },
  { value: 'software', label: 'Software e Aplicativos' },
] as const;

export type Municipality = typeof MUNICIPALITIES[number];
export type Category = typeof CATEGORIES[number];