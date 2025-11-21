import { useState } from 'react';
import { RankingData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RankingFilter {
  territory_id: string;
  start_date: string;
  end_date: string;
  keywords: string[];
}

interface RankingParams {
  municipalityFilter: RankingFilter;
  stateFilter: RankingFilter;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useRanking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);

  const validateParams = ({ municipalityFilter, stateFilter }: RankingParams): ValidationResult => {
    // Required fields validation
    if (!municipalityFilter.territory_id || !stateFilter.territory_id) {
      return { 
        isValid: false, 
        error: 'Selecione município e estado antes de rankear.' 
      };
    }

    // Prevent comparing same territory
    if (municipalityFilter.territory_id === stateFilter.territory_id) {
      return { 
        isValid: false, 
        error: 'Selecione um município diferente do estado para comparação.' 
      };
    }

    // Date validation
    if (municipalityFilter.start_date && municipalityFilter.end_date) {
      const start = new Date(municipalityFilter.start_date);
      const end = new Date(municipalityFilter.end_date);
      
      if (start > end) {
        return {
          isValid: false,
          error: 'A data inicial deve ser anterior à data final.'
        };
      }
    }

    return { isValid: true };
  };

  const getRanking = async (params: RankingParams) => {
    try {
      // Validate parameters
      const validation = validateParams(params);
      if (!validation.isValid) {
        setError(validation.error || 'Parâmetros inválidos');
        return;
      }

      setLoading(true);
      setError(null);

      const { municipalityFilter, stateFilter } = params;
      console.log('🔍 Iniciando busca de ranking com filtros:', {
        municipality: municipalityFilter,
        state: stateFilter
      });

      const body = {
        state_code: (stateFilter.territory_id || '').substring(0, 2),
        territory_ids: [municipalityFilter.territory_id, stateFilter.territory_id],
        start_date: municipalityFilter.start_date,
        end_date: municipalityFilter.end_date,
        keywords: municipalityFilter.keywords,
      };

      console.log('📤 Enviando requisição para API:', body);

      const response = await fetch(`${API_BASE_URL}/api/v1/ranking/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Erro na resposta da API:', errorData);
        throw new Error(errorData?.detail || 'Falha ao obter o ranking');
      }

      const data = await response.json();
      console.log('✅ Dados do ranking recebidos:', data);
      setRankingData(data);
      
    } catch (err) {
      console.error('❌ Erro ao buscar ranking:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar o ranking');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    rankingData,
    getRanking,
    clearError: () => setError(null),
    clearRanking: () => setRankingData(null),
  };
}