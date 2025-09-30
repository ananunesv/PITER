// TIPOS PARA O P.I.T.E.R - Procurador de Investimentos em Tecnologia na Educação e Recursos

export interface SearchFilters {
  municipio: string;
  categoria: 'robotica' | 'software' | '';
  dataInicio: string;
  dataFim: string;
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

// Opções para os selects
export const MUNICIPALITIES = [
  { value: 'goiania', label: 'Goiânia', ibge_code: '5208707' },
  { value: 'aparecida', label: 'Aparecida de Goiânia', ibge_code: '5201405' },
] as const;

export const CATEGORIES = [
  { value: 'robotica', label: 'Robótica Educacional' },
  { value: 'software', label: 'Software e Aplicativos' },
] as const;

export type Municipality = typeof MUNICIPALITIES[number];
export type Category = typeof CATEGORIES[number];