'use client';

import React from 'react';
import { MUNICIPALITIES, CATEGORIES, SearchFilters } from '@/types';
import { MapPin, Tag, Calendar, GitCompare, Loader2 } from 'lucide-react';

interface SearchFormProps {
  leftFilters: SearchFilters;
  rightFilters: SearchFilters;
  onLeftChange: (filters: Partial<SearchFilters>) => void;
  onRightChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  leftFilters,
  rightFilters,
  onLeftChange,
  onRightChange,
  onSearch,
  loading = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Municipios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <MapPin size={16} className="text-indigo-500" />
            Municipio 1
          </label>
          <select
            value={leftFilters.municipio}
            onChange={(e) => onLeftChange({ municipio: e.target.value })}
            className="select-modern w-full"
          >
            <option value="">Selecione o municipio</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun.value} value={mun.value}>{mun.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <MapPin size={16} className="text-emerald-500" />
            Municipio 2
          </label>
          <select
            value={rightFilters.municipio}
            onChange={(e) => onRightChange({ municipio: e.target.value })}
            className="select-modern w-full"
          >
            <option value="">Selecione o municipio</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun.value} value={mun.value}>{mun.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Periodo e Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Calendar size={16} className="text-indigo-500" />
            Data Inicial
          </label>
          <input
            type="date"
            value={leftFilters.dataInicio}
            onChange={(e) => {
              onLeftChange({ dataInicio: e.target.value });
              onRightChange({ dataInicio: e.target.value });
            }}
            className="input-modern"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Calendar size={16} className="text-indigo-500" />
            Data Final
          </label>
          <input
            type="date"
            value={leftFilters.dataFim}
            onChange={(e) => {
              onLeftChange({ dataFim: e.target.value });
              onRightChange({ dataFim: e.target.value });
            }}
            className="input-modern"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Tag size={16} className="text-indigo-500" />
            Categoria
          </label>
          <select
            value={leftFilters.categoria}
            onChange={(e) => {
              const value = e.target.value as SearchFilters['categoria'];
              onLeftChange({ categoria: value });
              onRightChange({ categoria: value });
            }}
            className="select-modern w-full"
          >
            <option value="">Selecione a categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
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
              Comparando...
            </>
          ) : (
            <>
              <GitCompare size={20} />
              Comparar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
