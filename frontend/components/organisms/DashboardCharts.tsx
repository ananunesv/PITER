'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, FileText, RefreshCw, AlertCircle, Loader2, BarChart3, ExternalLink, Sparkles } from 'lucide-react';
import { MUNICIPALITIES } from '@/types';
import { generateAIAnalysis, generatePDFReport } from '@/services/ai-report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

interface DashboardData {
  meta: {
    source_territory: string;
    period: string;
    search_keywords: string;
    generated_at: string;
    date_range_start?: string;
    date_range_end?: string;
  };
  data: {
    total_invested: number;
    investments_by_category: Record<string, number>;
    investments_by_period?: Record<string, number>;
    publications_by_period?: Record<string, number>;
    period_grouping?: 'month' | 'year';
    total_entities?: number;
    total_gazettes?: number;
  };
  gazettes?: any[];
}

export default function DashboardCharts() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [gazettes, setGazettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [territoryName, setTerritoryName] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateAIReport = async () => {
    if (!dashboardData) return;

    setGeneratingReport(true);
    try {
      const meta = dashboardData.meta;
      const territoryId = meta.source_territory;
      
      // Extrair datas do período
      const [startDate, endDate] = meta.period.split(' a ').map(d => d.trim());
      
      // Chamar análise do Gemini
      let aiResult = null;
      try {
        aiResult = await generateAIAnalysis(
          territoryId,
          meta.date_range_start || startDate,
          meta.date_range_end || endDate,
          meta.search_keywords
        );
      } catch (e) {
        console.warn('Análise IA não disponível:', e);
      }

      // Gerar PDF com os dados
      generatePDFReport({
        territoryId,
        territoryName,
        period: meta.period,
        category: meta.search_keywords || 'Geral',
        totalInvested: dashboardData.data.total_invested,
        totalGazettes: dashboardData.data.total_gazettes || gazettes.length,
        investmentsByCategory: dashboardData.data.investments_by_category,
        qualitativeAnalysis: aiResult?.data?.qualitative_analysis,
      });
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/data_output`);
        if (!response.ok) throw new Error('Erro ao carregar dados');

        const result = await response.json();
        
        if (!result.files || result.files.length === 0) {
          throw new Error('Nenhum dado encontrado. Faca uma busca primeiro.');
        }

        const sortedFiles = result.files
          .filter((f: any) => f.data?.data)
          .sort((a: any, b: any) => b.modified - a.modified);

        if (sortedFiles.length === 0) {
          throw new Error('Nenhum arquivo valido encontrado');
        }

        const latestFile = sortedFiles[0];
        setDashboardData(latestFile.data as DashboardData);
        setGazettes(latestFile.data.gazettes || []);
        
        const territory = latestFile.data.meta.source_territory;
        const mun = MUNICIPALITIES.find(m => m.value === territory);
        setTerritoryName(mun?.label || territory);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Dados do grafico de barras
  const barChartData = useMemo(() => {
    if (!dashboardData?.data) return [];

    const { investments_by_period, publications_by_period, period_grouping } = dashboardData.data;
    const hasInvestments = investments_by_period && Object.values(investments_by_period).some(v => v > 0);
    
    const dataSource = hasInvestments ? investments_by_period : publications_by_period;
    if (!dataSource) return [];

    const rawData = Object.entries(dataSource).map(([period, value]) => {
      let name = period;
      if (period_grouping === 'month' && period.includes('-')) {
        const [year, month] = period.split('-');
        name = `${MONTH_NAMES[month] || month}/${year.slice(2)}`;
      }
      return { name, value: Math.round(value as number), period, originalValue: Math.round(value as number) };
    });

    rawData.sort((a, b) => a.period.localeCompare(b.period));
    
    const maxValue = Math.max(...rawData.map(d => d.value), 1);
    const minVisibleValue = maxValue * 0.05;
    
    return rawData.map(d => ({
      ...d,
      displayValue: d.value > 0 && d.value < minVisibleValue ? minVisibleValue : d.value,
    }));
  }, [dashboardData]);

  const hasMoneyData = useMemo(() => {
    if (!dashboardData?.data?.investments_by_period) return false;
    return Object.values(dashboardData.data.investments_by_period).some(v => v > 0);
  }, [dashboardData]);

  // Dados do grafico de pizza
  const pieChartData = useMemo(() => {
    if (!dashboardData?.data?.investments_by_category) return [];

    const categories = dashboardData.data.investments_by_category;
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];

    return Object.entries(categories)
      .filter(([name, value]) => value > 0 && name !== 'Outros')
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-neutral-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Dados nao encontrados</h2>
          <p className="text-neutral-500 mb-6">{error}</p>
          <a href="/" className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={18} />
            Fazer Nova Busca
          </a>
        </div>
      </div>
    );
  }

  const totalInvested = dashboardData?.data?.total_invested || 0;
  const totalGazettes = dashboardData?.data?.total_gazettes || 0;
  const period = dashboardData?.meta?.period || '';
  const isYearly = dashboardData?.data?.period_grouping === 'year';

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-700 mb-6 border border-indigo-100">
              <BarChart3 size={16} />
              Dashboard de Analise
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Investimentos em Tecnologia</h1>
            <p className="text-neutral-500">{territoryName} - {period}</p>
          </div>

          {/* Cards de Estatisticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 stagger-children">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-indigo-600" size={20} />
                </div>
                <span className="text-sm text-neutral-500">Total Investido</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">{formatCurrency(totalInvested)}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-emerald-600" size={20} />
                </div>
                <span className="text-sm text-neutral-500">Diarios Analisados</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">{totalGazettes}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <span className="text-sm text-neutral-500">Media por Diario</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {totalGazettes > 0 ? formatCurrency(totalInvested / totalGazettes) : 'R$ 0'}
              </p>
            </div>
          </div>

          {/* Grafico de Barras */}
          <div className="chart-container mb-8">
            <h3 className="font-semibold text-neutral-700 mb-6">
              {hasMoneyData 
                ? (isYearly ? 'Investimentos por Ano' : 'Investimentos por Mes')
                : (isYearly ? 'Publicacoes por Ano' : 'Publicacoes por Mes')
              }
            </h3>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 13 }} />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 13 }}
                    tickFormatter={(v) => hasMoneyData ? (v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : v}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => {
                      const original = props.payload?.originalValue ?? value;
                      return [hasMoneyData ? formatCurrency(original) : `${original} publicacoes`, ''];
                    }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="displayValue" fill="#6366F1" radius={[6, 6, 0, 0]} minPointSize={5} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-400">
                Nenhum dado disponivel
              </div>
            )}
          </div>

          {/* Grafico de Pizza */}
          {pieChartData.length > 0 && (
            <div className="chart-container mb-8">
              <h3 className="font-semibold text-neutral-700 mb-6">Distribuicao por Subcategoria</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, payload }) => `${name}: ${payload?.percentage || 0}%`}
                    labelLine={true}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Botoes */}
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/" className="btn-secondary flex items-center gap-2">
              <RefreshCw size={18} />
              Nova Busca
            </a>
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
                Fontes ({gazettes.length})
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
