"use client";

import React, { useCallback, useState } from "react";
import { useGazetteSearch } from "@/hooks/useGazetteSearch";
import { useRanking } from "@/hooks/useRanking";
import { SearchForm } from "@/components/molecules/ranking/SearchForm";
import { GazetteCard } from "@/components/molecules/GazetteCard";
import Navbar_sec from "@/components/atoms/Navbar_sec";

export default function SearchRanking() {
  const municipalitySearch = useGazetteSearch();
  const stateSearch = useGazetteSearch();
  const ranking = useRanking();

  const showResults = ranking.rankingData !== null;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    // Prepare keywords based on category
    const keywords = [];
    if (municipalitySearch?.filters?.categoria === 'robotica') {
      keywords.push('robótica', 'educacional', 'tecnologia', 'ensino');
    } else if (municipalitySearch?.filters?.categoria === 'software') {
      keywords.push('software', 'aplicativo', 'tecnologia', 'digital', 'educação');
    }

    // Clear any previous local errors
    setLocalError(null);

    // Log search preparation
    console.log('🔄 Preparando busca de ranking:', {
      municipality: {
        territory_id: municipalitySearch.filters.territory_id,
        category: municipalitySearch.filters.categoria,
        dates: {
          start: municipalitySearch.filters.dataInicio,
          end: municipalitySearch.filters.dataFim
        }
      },
      state: stateSearch.filters,
      keywords,
    });

    // Prepare filters for API call
    const params = {
      municipalityFilter: {
        territory_id: municipalitySearch.filters.territory_id || '',
        start_date: municipalitySearch.filters.published_since || municipalitySearch.filters.dataInicio || '',
        end_date: municipalitySearch.filters.published_until || municipalitySearch.filters.dataFim || '',
        keywords: keywords,
      },
      stateFilter: {
        territory_id: stateSearch.filters.territory_id || '',
        start_date: stateSearch.filters.published_since || stateSearch.filters.dataInicio || '',
        end_date: stateSearch.filters.published_until || stateSearch.filters.dataFim || '',
        keywords: keywords,
      }
    };

    // Call API through useRanking hook
    try {
      console.log('📤 Chamando ranking.getRanking com params:', params);
      await ranking.getRanking(params);
      console.log('✅ ranking.getRanking terminou. rankingData:', ranking.rankingData);
    } catch (err) {
      console.error('❌ Erro na busca:', err);
      setLocalError(err instanceof Error ? err.message : 'Erro ao realizar a busca');
    }
  }, [municipalitySearch.filters, stateSearch.filters, ranking]);

  return (
    <div className="w-full">
      {!showResults ? (
        <div className="flex flex-col items-center mt-0">
          <div className="w-full mx-auto bg-transparent p-6">
            <Navbar_sec />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-5">Ranking</h1>
            <p className="text-gray-600">
              Compare investimentos em tecnologia educacional no seu município com o seu estado
            </p>
          </div>

          <div className="bg-transparent p-6 mb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="mx-auto w-full">
                  <SearchForm
                    leftFilters={municipalitySearch?.filters}
                    rightFilters={stateSearch?.filters}
                    onLeftChange={municipalitySearch?.updateFilters}
                    onRightChange={stateSearch?.updateFilters}
                    onSearch={handleSearch}
                    loading={ranking.loading}
                  />
                  {localError ? (
                    <div className="mt-3 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded">
                      {localError}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  💡 Dicas de Busca
                </div>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>Experimente um período de tempo mais amplo</li>
                  <li>Teste outras categorias tecnológicas</li>
                  <li>Verifique se há publicações recentes no município</li>
                </ul>
              </div>
            </div>
          </div>
          <SugestaoPesquisa />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ranking de Investimentos
              </h1>
              <p className="text-gray-600 mt-1">
                {ranking.rankingData && ranking.rankingData.rankings.total_municipalities > 0
                  ? `${ranking.rankingData.rankings.total_municipalities} municípios comparados (ranking por investimento)`
                  : 'Nenhum resultado encontrado'}
              </p>
            </div>

            <button
              onClick={() => {
                ranking.clearRanking();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Nova Busca
            </button>
          </div>

          {ranking.loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Processando ranking...</p>
            </div>
          ) : ranking.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex justify-between items-center">
                <span>{ranking.error}</span>
                <button
                  onClick={ranking.clearError}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
              ) : ranking.rankingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Município (por investimento)</h2>
                <div className="space-y-4">
                  {ranking.rankingData.rankings.by_investment
                    .filter(item => item.territory_id === municipalitySearch?.filters?.territory_id)
                    .map(rankItem => (
                      <div key={rankItem.territory_id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold">Posição no Ranking: {rankItem.rank}º</h3>
                        <p>Total Investido: R$ {rankItem.total_invested.toLocaleString()}</p>
                        {rankItem.top_categories && rankItem.top_categories.length > 0 ? (
                          <div className="mt-2 text-sm text-gray-600">
                            Principais categorias:
                            <ul className="list-disc pl-5">
                              {rankItem.top_categories.map((c: any) => (
                                <li key={c.category}>{`${c.category} — R$ ${Number(c.value).toLocaleString()}`}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Estado (por investimento)</h2>
                <div className="space-y-4">
                  {ranking.rankingData.rankings.by_investment
                    .filter(item => item.territory_id === stateSearch?.filters?.territory_id)
                    .map(rankItem => (
                      <div key={rankItem.territory_id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold">Posição no Ranking: {rankItem.rank}º</h3>
                        <p>Total Investido: R$ {rankItem.total_invested.toLocaleString()}</p>
                        {rankItem.top_categories && rankItem.top_categories.length > 0 ? (
                          <div className="mt-2 text-sm text-gray-600">
                            Principais categorias:
                            <ul className="list-disc pl-5">
                              {rankItem.top_categories.map((c: any) => (
                                <li key={c.category}>{`${c.category} — R$ ${Number(c.value).toLocaleString()}`}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Nenhum resultado encontrado para comparação.
              </div>
              <p className="text-gray-400 mt-2">
                Tente ajustar os critérios de busca.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
