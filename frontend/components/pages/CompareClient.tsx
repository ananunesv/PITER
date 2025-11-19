"use client";

import React from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { GazetteCard } from '@/components/molecules/GazetteCard';
import Navbar_sec from '@/components/atoms/Navbar_sec';
import SugestaoPesquisa from '@/components/atoms/SugestaoPesquisa';

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();

  const showResults = first.results.length > 0 || second.results.length > 0;

  return (
    <div className="w-full">
      {!showResults ? (
        <div className="flex flex-col items-center mt-8">
          <div className="w-full mx-auto bg-transparent p-6">
            <Navbar_sec />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-5">Comparar Diários Oficiais</h1>
            <p className="text-[#01161E]">Compare investimentos em tecnologia educacional nos diários oficiais do seu município</p>
          </div>
          <div className="w-full max-w-4xl">
            <div className="bg-transparent p-6 mb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="mx-auto w-full">
                    <SearchForm
                      leftFilters={first.filters}
                      rightFilters={second.filters}
                      onLeftChange={first.updateFilters}
                      onRightChange={second.updateFilters}
                      onSearch={() => { first.search(); second.search(); }}
                      loading={first.loading || second.loading}
                    />
                  </div>
                </div>

                <SugestaoPesquisa />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Resultados da Busca
              </h1>
              <p className="text-gray-600 mt-1">
                {first.total + second.total > 0 
                  ? `${first.total + second.total} diários oficiais encontrados` 
                  : 'Nenhum resultado encontrado'}
              </p>
            </div>

            <button
              onClick={() => {
                first.clearResults();
                second.clearResults();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Nova Busca
            </button>
          </div>

          {(first.loading || second.loading) ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Buscando diários oficiais...</p>
            </div>
          ) : (first.error || second.error) ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex justify-between items-center">
                <span>{first.error || second.error}</span>
                <button
                  onClick={() => {
                    first.clearError();
                    second.clearError();
                  }}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (first.results.length > 0 || second.results.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Primeira Busca</h2>
                <div className="space-y-4">
                  {first.results.map((gazette, index) => (
                    <GazetteCard key={`first-${gazette.territory_id}-${gazette.date}-${index}`} gazette={gazette} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Segunda Busca</h2>
                <div className="space-y-4">
                  {second.results.map((gazette, index) => (
                    <GazetteCard key={`second-${gazette.territory_id}-${gazette.date}-${index}`} gazette={gazette} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Nenhum diário oficial encontrado com os filtros selecionados.
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