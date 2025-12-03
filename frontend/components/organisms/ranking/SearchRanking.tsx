"use client";

import React, { useState, useMemo } from "react";
import { useGazetteSearch } from "@/hooks/useGazetteSearch";
import { SearchForm } from "@/components/molecules/ranking/SearchForm";
import { Trophy, TrendingUp, ExternalLink, RefreshCw, Loader2, AlertCircle, Medal, Sparkles } from "lucide-react";
import { generateAIAnalysis, generatePDFReport } from '@/services/ai-report';
import Navbar_sec from "@/components/atoms/Navbar_sec";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MUNICIPALITIES } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

interface RankingData {
  total_invested: number;
  total_gazettes: number;
  investments_by_category: Record<string, number>;
  investments_by_period: Record<string, number>;
  publications_by_period: Record<string, number>;
  period_grouping: string;
}

export default function SearchRanking() {
  const { filters, updateFilters, results, loading: searchLoading, search } = useGazetteSearch();
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [gazettes, setGazettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const territoryName = MUNICIPALITIES.find(m => m.value === filters.municipio)?.label || 'Município';

  const handleGenerateAIReport = async () => {
    if (!rankingData) return;

    setGeneratingReport(true);
    try {
      // Chamar análise do Gemini
      let aiResult = null;
      try {
        aiResult = await generateAIAnalysis(
          filters.municipio,
          filters.dataInicio,
          filters.dataFim,
          filters.categoria
        );
      } catch (e) {
        console.warn('Análise IA não disponível:', e);
      }

      // Gerar PDF com os dados
      generatePDFReport({
        territoryId: filters.municipio,
        territoryName,
        period: `${filters.dataInicio} a ${filters.dataFim}`,
        category: filters.categoria || 'Geral',
        totalInvested: rankingData.total_invested,
        totalGazettes: rankingData.total_gazettes || gazettes.length,
        investmentsByCategory: rankingData.investments_by_category,
        qualitativeAnalysis: aiResult?.data?.qualitative_analysis,
      });
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSearch = async () => {
    if (!filters.municipio) {
      setError("Selecione um município");
      return;
    }
    if (!filters.categoria) {
      setError("Selecione uma categoria");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await search();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar dados");
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (results.length > 0 && loading) {
      processResults(results);
    }
  }, [results, loading]);

  const processResults = async (gazettesData: any[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/save_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gazettes: gazettesData,
          filters: {
            territory_id: filters.municipio,
            municipio: filters.municipio,
            categoria: filters.categoria,
            dataInicio: filters.dataInicio,
            dataFim: filters.dataFim,
          }
        })
      });

      if (!response.ok) throw new Error("Erro ao processar ranking");

      const data = await response.json();

      setRankingData({
        total_invested: data.total_invested || 0,
        total_gazettes: data.total_gazettes || 0,
        investments_by_category: data.investments_by_category || {},
        investments_by_period: data.investments_by_period || {},
        publications_by_period: data.publications_by_period || {},
        period_grouping: data.period_grouping || 'month',
      });

      setGazettes(gazettesData);
      setShowResults(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar ranking");
    } finally {
      setLoading(false);
    }
  };

  const topCategories = useMemo(() => {
    if (!rankingData?.investments_by_category) return [];
    
    return Object.entries(rankingData.investments_by_category)
      .filter(([category, value]) => category !== "Outros" && (value as number) > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name, value], index) => ({ 
        name, 
        value: Math.round(value as number),
        rank: index + 1
      }));
  }, [rankingData]);

  const chartData = useMemo(() => {
    if (!rankingData?.investments_by_category) return [];
    
    return Object.entries(rankingData.investments_by_category)
      .filter(([category, value]) => category !== "Outros" && (value as number) > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([name, value]) => ({ 
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value: Math.round(value as number)
      }));
  }, [rankingData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const municipioName = MUNICIPALITIES.find(m => m.value === filters.municipio)?.label || filters.municipio;

  const handleNewSearch = () => {
    setShowResults(false);
    setRankingData(null);
    setGazettes([]);
    setError(null);
  };

  // Tela de busca
  if (!showResults) {
    return (
      <div className="min-h-screen py-8 px-6 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="animate-fade-in flex flex-col items-center">
            {/* Navbar secundária */}
            <div className="mb-8">
              <Navbar_sec />
            </div>

            <div className="text-center mb-10 w-full">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-700 mb-6 border border-indigo-100">
                <Trophy size={16} />
                Ranking de Investimentos
              </div>
              
              <h1 className="hero-title text-neutral-800 mb-4">
                Descubra onde seu município
                <span className="text-gradient block">mais investe em tecnologia</span>
              </h1>
              
              <p className="hero-subtitle mx-auto">
                Veja o ranking das subcategorias de investimento em tecnologia 
                educacional do seu município.
              </p>
            </div>

            <div className="form-container w-full max-w-4xl mb-8">
              <SearchForm
                filters={filters}
                onFiltersChange={updateFilters}
                onSearch={handleSearch}
                loading={loading || searchLoading}
              />
              
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </div>

            <div className="glass-card w-full max-w-2xl p-6 text-center">
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-indigo-600">Dica:</span> Selecione um período maior 
                para obter resultados mais completos sobre os investimentos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || searchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-500">Processando ranking...</p>
        </div>
      </div>
    );
  }

  // Dashboard de Ranking
  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Ranking de Investimentos</h1>
          <p className="text-neutral-500">{municipioName} • {filters.dataInicio} a {filters.dataFim}</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-indigo-600" size={20} />
              </div>
              <span className="text-sm text-neutral-500">Total Investido</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800">
              {formatCurrency(rankingData?.total_invested || 0)}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Trophy className="text-purple-600" size={20} />
              </div>
              <span className="text-sm text-neutral-500">Diários Analisados</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800">
              {rankingData?.total_gazettes || 0}
            </p>
          </div>
        </div>

        {/* Top 3 Subcategorias - Pódio */}
        {topCategories.length > 0 && (
          <div className="chart-container mb-8">
            <h3 className="font-semibold text-neutral-700 mb-8 text-center text-lg">Top 3 Maiores Investimentos</h3>
            <div className="flex justify-center items-end gap-6 pb-4">
              {/* 2º lugar */}
              {topCategories[1] && (
                <div className="text-center flex flex-col items-center">
                  <div className="w-28 h-28 bg-gradient-to-t from-neutral-300 to-neutral-200 rounded-t-xl flex flex-col items-center justify-end pb-3 shadow-lg">
                    <Medal className="text-neutral-500 mb-1" size={28} />
                    <span className="text-2xl font-bold text-neutral-600">2º</span>
                  </div>
                  <div className="bg-white p-4 rounded-b-xl shadow-lg w-28">
                    <p className="text-xs font-medium text-neutral-500 truncate">{topCategories[1].name}</p>
                    <p className="text-sm font-bold text-neutral-800 mt-1">{formatCurrency(topCategories[1].value)}</p>
                  </div>
                </div>
              )}
              
              {/* 1º lugar */}
              {topCategories[0] && (
                <div className="text-center flex flex-col items-center -mt-6">
                  <div className="w-32 h-36 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-xl flex flex-col items-center justify-end pb-3 shadow-lg">
                    <Trophy className="text-white mb-1" size={32} />
                    <span className="text-3xl font-bold text-white">1º</span>
                  </div>
                  <div className="bg-white p-4 rounded-b-xl shadow-lg w-32">
                    <p className="text-xs font-medium text-neutral-500 truncate">{topCategories[0].name}</p>
                    <p className="text-sm font-bold text-neutral-800 mt-1">{formatCurrency(topCategories[0].value)}</p>
                  </div>
                </div>
              )}
              
              {/* 3º lugar */}
              {topCategories[2] && (
                <div className="text-center flex flex-col items-center">
                  <div className="w-28 h-24 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-xl flex flex-col items-center justify-end pb-3 shadow-lg">
                    <Medal className="text-amber-100 mb-1" size={24} />
                    <span className="text-2xl font-bold text-white">3º</span>
                  </div>
                  <div className="bg-white p-4 rounded-b-xl shadow-lg w-28">
                    <p className="text-xs font-medium text-neutral-500 truncate">{topCategories[2].name}</p>
                    <p className="text-sm font-bold text-neutral-800 mt-1">{formatCurrency(topCategories[2].value)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráfico de Barras Horizontal */}
        {chartData.length > 0 && (
          <div className="chart-container mb-8">
            <h3 className="font-semibold text-neutral-700 mb-6">Investimento por Subcategoria</h3>
            <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 60)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  width={140}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Investimento']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={handleNewSearch} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Nova Busca
          </button>
          
          <button 
            onClick={handleGenerateAIReport}
            disabled={generatingReport}
            className={`btn-primary flex items-center gap-2 ${generatingReport ? 'opacity-70 cursor-wait' : ''}`}
          >
            {generatingReport ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Gerar Análise por IA
              </>
            )}
          </button>
          
          {gazettes.length > 0 && gazettes[0]?.url && (
            <a 
              href={gazettes[0].url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Ver Fontes ({gazettes.length} diários)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
