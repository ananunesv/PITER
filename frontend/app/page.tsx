'use client';

import React, { useState } from 'react';
import { Header } from '@/components/organisms/Header';
import { SearchForm } from '@/components/molecules/SearchForm';
import { GazetteCard } from '@/components/molecules/GazetteCard';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const {
    results,
    loading,
    error,
    total,
    filters,
    updateFilters,
    search,
    clearResults,
    clearError,
  } = useGazetteSearch();

  const handleSearch = async () => {
    await search();
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    clearResults();
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          // Página de busca inicial
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Buscar Diários Oficiais
              </h1>
              <p className="text-xl text-gray-600">
                Encontre investimentos em tecnologia educacional nos diários oficiais de Goiás
              </p>
            </div>

            <SearchForm
              filters={filters}
              onFiltersChange={updateFilters}
              onSearch={handleSearch}
              loading={loading}
            />

            {error && (
              <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Página de resultados
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Resultados da Busca
                </h1>
                <p className="text-gray-600 mt-1">
                  {total > 0 ? `${total} diários oficiais encontrados` : 'Nenhum resultado encontrado'}
                </p>
              </div>

              <button
                onClick={handleNewSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Nova Busca
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Buscando diários oficiais...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((gazette, index) => (
                  <GazetteCard key={`${gazette.territory_id}-${gazette.date}-${index}`} gazette={gazette} />
                ))}
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
      </main>
    </div>
  );
}