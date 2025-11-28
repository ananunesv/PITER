'use client';

/**
 * Dashboard de Pesquisa - Componente principal para pesquisa de dados
 * Integra dados do backend com interface responsiva e tratamento de erros
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BackendIntegrationService,
  RankingResponse,
  SearchFilters,
  GazetteAnalysis,
  PaginatedResponse,
  ApiError,
} from '@/integracao-b';

interface DashboardState {
  loading: boolean;
  error: string | null;
  searchResults: GazetteAnalysis[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
}

interface RankingState {
  loading: boolean;
  error: string | null;
  data: RankingResponse | null;
}

/**
 * Componente principal do Dashboard de Pesquisa
 */
export default function DashboardPesquisa() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: false,
    error: null,
    searchResults: [],
    totalResults: 0,
    currentPage: 1,
    pageSize: 10,
  });

  const [rankingState, setRankingState] = useState<RankingState>({
    loading: true,
    error: null,
    data: null,
  });

  const [selectedResult, setSelectedResult] = useState<GazetteAnalysis | null>(null);

  /**
   * Carrega dados de ranking na inicialização
   */
  useEffect(() => {
    loadRankingData();
  }, []);

  /**
   * Carrega dados de ranking
   */
  const loadRankingData = async () => {
    setRankingState({ loading: true, error: null, data: null });
    try {
      const ranking = await BackendIntegrationService.getRanking();
      setRankingState({ loading: false, error: null, data: ranking });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao carregar ranking';
      setRankingState({ loading: false, error: errorMessage, data: null });
    }
  };

  /**
   * Realiza busca com filtros
   */
  const handleSearch = useCallback(async (page: number = 1) => {
    if (!searchTerm.trim() && !selectedTerritoryId) {
      setDashboardState((prev) => ({
        ...prev,
        error: 'Por favor, digite um termo de pesquisa ou selecione um município',
      }));
      return;
    }

    setDashboardState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const filters: SearchFilters = {
        search_term: searchTerm || undefined,
        territory_id: selectedTerritoryId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category: selectedCategory || undefined,
      };

      const results = await BackendIntegrationService.search(
        filters,
        page,
        dashboardState.pageSize
      );

      setDashboardState({
        loading: false,
        error: null,
        searchResults: results.data,
        totalResults: results.total,
        currentPage: page,
        pageSize: results.page_size,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao realizar busca';
      setDashboardState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [searchTerm, selectedTerritoryId, startDate, endDate, selectedCategory, dashboardState.pageSize]);

  /**
   * Calcula total de páginas
   */
  const totalPages = useMemo(() => {
    return Math.ceil(dashboardState.totalResults / dashboardState.pageSize);
  }, [dashboardState.totalResults, dashboardState.pageSize]);

  /**
   * Lista de categorias únicas do ranking
   */
  const categories = useMemo(() => {
    if (!rankingState.data) return [];
    
    const categorySet = new Set<string>();
    Object.values(rankingState.data.municipalities).forEach((muni) => {
      Object.keys(muni.top_categories).forEach((cat) => categorySet.add(cat));
    });
    
    return Array.from(categorySet).sort();
  }, [rankingState.data]);

  /**
   * Lista de municípios únicos do ranking
   */
  const municipalities = useMemo(() => {
    if (!rankingState.data) return [];
    
    return Object.entries(rankingState.data.municipalities)
      .map(([id, data]) => ({
        id,
        name: `Município ${id}`,
        gazettes: data.total_gazettes,
        invested: data.total_invested,
      }))
      .sort((a, b) => b.gazettes - a.gazettes);
  }, [rankingState.data]);

  /**
   * Formata moeda em Real
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Renderiza informações de ranking
   */
  const renderRankingInfo = () => {
    if (rankingState.loading) {
      return <div className="text-center text-gray-500">Carregando ranking...</div>;
    }

    if (rankingState.error) {
      return (
        <div className="text-center text-red-500">
          Erro ao carregar ranking: {rankingState.error}
        </div>
      );
    }

    if (!rankingState.data) {
      return <div className="text-center text-gray-500">Nenhum dado disponível</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600">Total de Municípios</div>
          <div className="text-2xl font-bold text-blue-600">
            {rankingState.data.rankings.total_municipalities}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600">Maior Investimento</div>
          <div className="text-lg font-bold text-green-600">
            {rankingState.data.rankings.by_investment.length > 0 &&
              formatCurrency(
                rankingState.data.rankings.by_investment[0].total_invested
              )}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600">Total de Publicações</div>
          <div className="text-lg font-bold text-purple-600">
            {rankingState.data.rankings.by_publications.reduce(
              (sum, item) => sum + item.total,
              0
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard de Pesquisa P.I.T.E.R
          </h1>
          <p className="text-gray-600">
            Consulte dados de publicações e investimentos em municípios
          </p>
        </div>

        {/* Informações de Ranking */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumo de Dados
          </h2>
          {renderRankingInfo()}
        </div>

        {/* Filtros de Pesquisa */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filtros de Pesquisa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Termo de Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termo de Pesquisa
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite um termo para pesquisar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Município */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Município
              </label>
              <select
                value={selectedTerritoryId}
                onChange={(e) => setSelectedTerritoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Selecione um município...</option>
                {municipalities.map((muni) => (
                  <option key={muni.id} value={muni.id}>
                    {muni.name} ({muni.gazettes} pub.)
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Botão de Pesquisa */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSearch(1)}
              disabled={dashboardState.loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {dashboardState.loading ? 'Pesquisando...' : 'Pesquisar'}
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTerritoryId('');
                setStartDate('');
                setEndDate('');
                setSelectedCategory('');
                setDashboardState({
                  loading: false,
                  error: null,
                  searchResults: [],
                  totalResults: 0,
                  currentPage: 1,
                  pageSize: 10,
                });
              }}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Limpar
            </button>
          </div>

          {/* Mensagem de Erro */}
          {dashboardState.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {dashboardState.error}
            </div>
          )}
        </div>

        {/* Resultados da Pesquisa */}
        {dashboardState.searchResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resultados ({dashboardState.totalResults} encontrados)
            </h2>

            <div className="space-y-4">
              {dashboardState.searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedResult(result)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {result.territory_name || `Território ${result.territory_id}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {result.territory_id}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.analysis_date || 'Data não informada'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {JSON.stringify(result).substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleSearch(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        dashboardState.currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detalhes do Resultado Selecionado */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalhes da Análise
                </h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(selectedResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando sem resultados */}
        {!dashboardState.loading &&
          dashboardState.searchResults.length === 0 &&
          !dashboardState.error &&
          (searchTerm || selectedTerritoryId) && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">
                Nenhum resultado encontrado para os filtros selecionados.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
