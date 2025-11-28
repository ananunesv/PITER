/**
 * Hook customizado para gerenciar estado de busca integrado com backend-integration
 * Abstrai a lógica de busca e permite reutilização em múltiplos componentes
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BackendIntegrationService,
  SearchFilters,
  GazetteAnalysis,
  PaginatedResponse,
} from '@/integracao-b';

interface UseSearchOptions {
  autoLoad?: boolean;
  initialPageSize?: number;
}

interface UseSearchReturn {
  // Estado de carregamento e erro
  loading: boolean;
  error: string | null;

  // Dados
  results: GazetteAnalysis[];
  totalResults: number;

  // Paginação
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Funções
  search: (filters: SearchFilters, page?: number) => Promise<void>;
  clearResults: () => void;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;

  // Último filtro usado
  lastFilters: SearchFilters | null;
}

export const useSearch = (
  options: UseSearchOptions = {}
): UseSearchReturn => {
  const { autoLoad = false, initialPageSize = 10 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GazetteAnalysis[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);

  const totalPages = Math.ceil(totalResults / pageSize);

  const search = useCallback(
    async (filters: SearchFilters, page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const data = await BackendIntegrationService.search(
          filters,
          page,
          pageSize
        );

        setResults(data.data);
        setTotalResults(data.total);
        setCurrentPage(page);
        setLastFilters(filters);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao buscar dados';
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);
    setLastFilters(null);
  }, []);

  const nextPage = useCallback(async () => {
    if (currentPage < totalPages && lastFilters) {
      await search(lastFilters, currentPage + 1);
    }
  }, [currentPage, totalPages, lastFilters, search]);

  const previousPage = useCallback(async () => {
    if (currentPage > 1 && lastFilters) {
      await search(lastFilters, currentPage - 1);
    }
  }, [currentPage, lastFilters, search]);

  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= totalPages && lastFilters) {
        await search(lastFilters, page);
      }
    },
    [totalPages, lastFilters, search]
  );

  useEffect(() => {
    if (autoLoad) {
      search({});
    }
  }, [autoLoad, search]);

  return {
    loading,
    error,
    results,
    totalResults,
    currentPage,
    pageSize,
    totalPages,
    search,
    clearResults,
    nextPage,
    previousPage,
    goToPage,
    lastFilters,
  };
};

export default useSearch;
