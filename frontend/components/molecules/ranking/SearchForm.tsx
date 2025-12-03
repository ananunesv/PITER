'use client';

import React from 'react';
import { MUNICIPALITIES, CATEGORIES, SearchFilters } from '@/types';
import { MapPin, Tag, Calendar, Trophy, Loader2 } from 'lucide-react';

interface SearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Municipio */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <MapPin size={16} className="text-indigo-500" />
            Município
          </label>
          <select
            value={filters.municipio}
            onChange={(e) => onFiltersChange({ municipio: e.target.value, territory_id: e.target.value })}
            className="select-modern w-full"
          >
            <option value="">Selecione o municipio</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun.value} value={mun.value}>
                {mun.label}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Tag size={16} className="text-indigo-500" />
            Categoria
          </label>
          <select
            value={filters.categoria}
            onChange={(e) => onFiltersChange({ categoria: e.target.value as SearchFilters['categoria'] })}
            className="select-modern w-full"
          >
            <option value="">Selecione a categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data Inicio */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Calendar size={16} className="text-indigo-500" />
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.dataInicio}
            onChange={(e) => onFiltersChange({ dataInicio: e.target.value })}
            className="input-modern"
          />
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Calendar size={16} className="text-indigo-500" />
            Data Final
          </label>
          <input
            type="date"
            value={filters.dataFim}
            onChange={(e) => onFiltersChange({ dataFim: e.target.value })}
            className="input-modern"
          />
        </div>
      </div>

      {/* Botao */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onSearch}
          disabled={loading}
          className={`btn-primary flex items-center gap-3 min-w-[200px] justify-center ${loading ? 'opacity-80 cursor-wait' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Trophy size={20} />
              Gerar Ranking
            </>
          )}
        </button>
      </div>
    </div>
  );
};
