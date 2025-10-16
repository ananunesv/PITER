"use client";

import React from 'react';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { SearchForm } from '@/components/molecules/ranking/SearchForm';
import { Navbar_second } from '@/components/atoms/Navbar_second';

export default function SearchRanking() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();

  return (
    <div
      className="flex flex-col items-center px-6 py-0"
    >
      <div className="w-full items-center">
        <div className='w-full mx-auto bg-transparent p-6'>
          <Navbar_second />
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
                  leftFilters={first.filters}
                  rightFilters={second.filters}
                  onLeftChange={first.updateFilters}
                  onRightChange={second.updateFilters}
                  onSearch={() => {
                    first.search();
                    second.search();
                  }}
                  loading={first.loading || second.loading}
                />
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="bg-gray-100 rounded-lg justify-center text-center">
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
    </div>
  );
}
