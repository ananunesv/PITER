"use client";

import React from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { Navbar_second } from '@/components/atoms/Navbar_second';

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="text-center">
      <div className='w-full mx-auto bg-transparent p-6 mt-30'>
        <Navbar_second />
      </div>
        <h1 className="text-3xl font-semibold mb-5">Comparar Diários Oficiais</h1>
        <p className="text-gray-600">Compare investimentos em tecnologia educacional nos diários oficiais do seu município</p>
      </div>
      <div className="w-full max-w-4xl mt-8">
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

            <div className="bg-gray-100 rounded-lg p-4 justify-center text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">💡 Dicas de Busca 💡</div>
              <ul className="text-sm text-gray-700 list-disc space-y-1">
                <ul>Experimente um período de tempo mais amplo</ul>
                <ul>Teste outras categorias tecnológicas</ul>
                <ul>Verifique se há publicações recentes no município</ul>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
