"use client";

import React from 'react';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { SearchForm } from '@/components/molecules/ranking/SearchForm';
import { Navbar_second } from '@/components/atoms/Navbar_second';
import SugestaoPesquisa from '@/components/atoms/Sugestão_pesquisa';

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
          <h1 className="text-3xl text-[#01161E] font-semibold mb-5">Ranking</h1>
          <p className="text-[#01161E]">
            Compare investimentos em tecnologia educacional no seu município com o seu estado
          </p>
        </div>

        <div className="bg-transparent p-6 mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="mx-auto w-full mb-6">
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
          </div>
          <SugestaoPesquisa />
        </div>
      </div>
    </div>
  );
}
