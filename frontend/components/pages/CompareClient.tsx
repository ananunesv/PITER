"use client";

import React from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-semibold mb-5">Comparar Diários Oficiais</h1>
        <p className="text-gray-600">Compare investimentos em tecnologia educacional nos diários oficiais do seu município</p>
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

            <div className="bg-gray-100 rounded-lg p-4 justify-center">
              <div className="text-sm font-medium text-gray-700 mb-2">💡 Dicas de Busca</div>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Experimente um período de tempo mais amplo</li>
                <li>Teste outras categorias tecnológicas</li>
                <li>Verifique se há publicações recentes no município</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
