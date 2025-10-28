"use client";

import React from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import { Navbar_second } from '@/components/atoms/Navbar_second';
import SugestaoPesquisa from '@/components/atoms/Sugestão_pesquisa';

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="w-full mx-auto bg-transparent p-6">
        <Navbar_second />
      </div>

      <div className="text-center">
        <h1 className="text-3xl text-[#01161E] font-semibold mb-5">
          Comparar Diários Oficiais
        </h1>
        <p className="text-[#01161E]">
          Compare investimentos em tecnologia educacional nos diários oficiais do seu município
        </p>
      </div>

      <div className="w-full max-w-4xl mt-8">
        <div className="bg-transparent p-6">
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

            <SugestaoPesquisa />
          </div>
        </div>
      </div>
    </div>
  );
}