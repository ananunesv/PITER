'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar_sec from '@/components/atoms/Navbar_sec';
import { SearchForm } from '@/components/molecules/search/SearchForm';
import { GazetteCard } from '@/components/molecules/GazetteCard';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { Search, FileText, TrendingUp, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
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
    // Redireciona para o dashboard após a busca
    router.push('/dashboard_pesquisa');
  };

  const handleNewSearch = () => {
    setShowResults(false);
    clearResults();
    clearError();
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!showResults ? (
          // Pagina de busca inicial
          <div className="animate-fade-in">
            {/* Navbar */}
            <div className="w-full mx-auto mb-8">
              <Navbar_sec />
            </div>

            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-700 mb-6 border border-indigo-100">
                <Sparkles size={16} />
                Plataforma de Transparencia em Educacao
              </div>
              
              <h1 className="hero-title text-neutral-800 mb-4">
                Descubra investimentos em
                <span className="text-gradient block">tecnologia educacional</span>
              </h1>
              
              <p className="hero-subtitle">
                Pesquise e analise dados dos Diarios Oficiais de Goias sobre 
                investimentos em software, robotica e tecnologia nas escolas.
              </p>
            </div>

            {/* Formulario de Busca */}
            <div className="form-container max-w-4xl mx-auto mb-8">
              <SearchForm
                filters={filters}
                onFiltersChange={updateFilters}
                onSearch={handleSearch}
                loading={loading}
              />
            </div>

            {/* Cards de Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
              <div className="stat-card text-center group cursor-pointer">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="text-indigo-600" size={24} />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Pesquisa Inteligente</h3>
                <p className="text-sm text-neutral-500">
                  Busque por municipio, periodo e categoria de tecnologia
                </p>
              </div>

              <div className="stat-card text-center group cursor-pointer">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="text-emerald-600" size={24} />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Dados Oficiais</h3>
                <p className="text-sm text-neutral-500">
                  Informacoes extraidas diretamente dos Diarios Oficiais
                </p>
              </div>

              <div className="stat-card text-center group cursor-pointer">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-amber-600" size={24} />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Analise Visual</h3>
                <p className="text-sm text-neutral-500">
                  Graficos e dashboards para visualizar investimentos
                </p>
              </div>
            </div>

            {/* Dica */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <div className="glass-card p-6">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-indigo-600">Dica:</span> Para melhores resultados, 
                  selecione um periodo de pelo menos 6 meses e escolha uma categoria especifica.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Pagina de resultados
          <div className="animate-fade-in">
            {/* Header dos Resultados */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Resultados da Busca
              </h1>
              <p className="text-neutral-500 mb-6">
                {total > 0 
                  ? `${total} diarios oficiais encontrados` 
                  : 'Nenhum resultado encontrado'}
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleNewSearch}
                  className="btn-secondary"
                >
                  Nova Busca
                </button>
                <a
                  href="/dashboard_pesquisa"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <TrendingUp size={18} />
                  Ver Dashboard
                </a>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-6 text-neutral-500 font-medium">Buscando diarios oficiais...</p>
              </div>
            ) : error ? (
              <div className="max-w-lg mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span>{error}</span>
                    <button
                      onClick={clearError}
                      className="text-red-400 hover:text-red-600 font-bold text-xl"
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((gazette, index) => (
                  <div key={`${gazette.territory_id}-${gazette.date}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <GazetteCard gazette={gazette} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-neutral-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-neutral-500">
                  Tente ajustar os filtros ou ampliar o periodo de busca.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer simples */}
      <footer className="text-center py-8 text-sm text-neutral-500">
        <p>P.I.T.E.R - Plataforma de Integracao e Transparencia em Educacao e Recursos</p>
      </footer>
    </div>
  );
}
