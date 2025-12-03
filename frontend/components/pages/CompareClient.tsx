"use client";

import React, { useState, useMemo } from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import Navbar_sec from '@/components/atoms/Navbar_sec';
import { GitCompare, TrendingUp, TrendingDown, ArrowRight, Loader2, FileText, RefreshCw, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateAIAnalysis } from '@/services/ai-report';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const TERRITORY_NAMES: Record<string, string> = {
  '5208707': 'Goiania',
  '5201405': 'Aparecida de Goiania',
  '5201108': 'Anapolis',
  '5300108': 'Brasilia',
};

// Extrai valores monetarios
function extractMoneyValues(text: string): number[] {
  const regex = /R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
  const values: number[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    try {
      const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      if (value >= 100 && value <= 100000000) {
        const start = Math.max(0, match.index - 500);
        const end = Math.min(text.length, match.index + 500);
        const context = text.substring(start, end).toLowerCase();
        
        if (context.includes('software') || context.includes('robótica')) {
          values.push(value);
        }
      }
    } catch { /* ignore */ }
  }
  
  return values;
}

function processResults(results: any[]) {
  const byMonth: Record<string, number> = {};
  let totalInvested = 0;

  for (const gazette of results) {
    const date = gazette.date;
    if (!date) continue;
    const [year, month] = date.split('-');
    const monthKey = `${year}-${month}`;
    let text = gazette.excerpts?.join('\n') || gazette.excerpt || '';
    const values = extractMoneyValues(text);
    const sum = values.reduce((a, b) => a + b, 0);
    
    if (sum > 0) {
      byMonth[monthKey] = (byMonth[monthKey] || 0) + sum;
      totalInvested += sum;
    }
  }

  return { totalInvested, byMonth };
}

function generateComparisonPDF(
  name1: string,
  name2: string,
  data1: { totalInvested: number; byMonth: Record<string, number> },
  data2: { totalInvested: number; byMonth: Record<string, number> },
  filters: any,
  ai1?: any,
  ai2?: any
): string {
  const diff = data1.totalInvested - data2.totalInvested;
  const diffPercent = data2.totalInvested > 0 ? ((diff / data2.totalInvested) * 100).toFixed(1) : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>P.I.T.E.R - Comparação de Municípios</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1f2937;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #6366f1;
        }
        .header h1 {
          color: #6366f1;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .header .subtitle {
          color: #6b7280;
          font-size: 14px;
        }
        .info-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .compare-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .municipality-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }
        .municipality-card.first {
          border-color: #3b82f6;
        }
        .municipality-card.second {
          border-color: #8b5cf6;
        }
        .municipality-card h2 {
          font-size: 20px;
          margin-bottom: 16px;
        }
        .municipality-card.first h2 { color: #3b82f6; }
        .municipality-card.second h2 { color: #8b5cf6; }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .stat-row:last-child { border-bottom: none; }
        .stat-label { color: #6b7280; }
        .stat-value { font-weight: 700; color: #1f2937; }
        .diff-section {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .diff-section h3 {
          color: #4338ca;
          margin-bottom: 16px;
        }
        .diff-value {
          font-size: 32px;
          font-weight: 700;
          color: ${diff >= 0 ? '#059669' : '#dc2626'};
        }
        .diff-percent {
          color: #6b7280;
          font-size: 14px;
          margin-top: 8px;
        }
        .ai-section {
          background: #fefce8;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .ai-section h3 {
          color: #854d0e;
          margin-bottom: 12px;
        }
        .ai-content {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #eab308;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #9ca3af;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .compare-grid { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>P.I.T.E.R - Comparação de Municípios</h1>
        <p class="subtitle">Análise Comparativa de Investimentos em Tecnologia</p>
      </div>

      <div class="info-section">
        <p><strong>Período:</strong> ${filters.dataInicio || 'N/A'} a ${filters.dataFim || 'N/A'}</p>
        <p><strong>Categoria:</strong> ${filters.categoria || 'Geral'}</p>
      </div>

      <div class="compare-grid">
        <div class="municipality-card first">
          <h2>${name1}</h2>
          <div class="stat-row">
            <span class="stat-label">Total Investido</span>
            <span class="stat-value">R$ ${data1.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Períodos com Investimento</span>
            <span class="stat-value">${Object.keys(data1.byMonth).length}</span>
          </div>
          ${ai1 ? `
          <div class="ai-section" style="margin-top: 16px;">
            <h3>🤖 Análise IA</h3>
            <div class="ai-content">${ai1.resumo_objeto || ai1.raw_analysis || 'Análise disponível no sistema.'}</div>
          </div>
          ` : ''}
        </div>

        <div class="municipality-card second">
          <h2>${name2}</h2>
          <div class="stat-row">
            <span class="stat-label">Total Investido</span>
            <span class="stat-value">R$ ${data2.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Períodos com Investimento</span>
            <span class="stat-value">${Object.keys(data2.byMonth).length}</span>
          </div>
          ${ai2 ? `
          <div class="ai-section" style="margin-top: 16px;">
            <h3>🤖 Análise IA</h3>
            <div class="ai-content">${ai2.resumo_objeto || ai2.raw_analysis || 'Análise disponível no sistema.'}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="diff-section">
        <h3>Diferença de Investimentos</h3>
        <div class="diff-value">${diff >= 0 ? '+' : ''}R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="diff-percent">${name1} investiu ${diff >= 0 ? `${diffPercent}% a mais` : `${Math.abs(Number(diffPercent))}% a menos`} que ${name2}</div>
      </div>

      <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p>P.I.T.E.R - Procurador de Investimentos em Tecnologia em Educação Regional</p>
      </div>
    </body>
    </html>
  `;
}

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();
  const [showDashboard, setShowDashboard] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateAIReport = async () => {
    setGeneratingReport(true);
    try {
      // Chamar análise do Gemini para ambos os municípios
      const [aiResult1, aiResult2] = await Promise.all([
        generateAIAnalysis(
          first.filters.municipio,
          first.filters.dataInicio,
          first.filters.dataFim,
          first.filters.categoria
        ).catch(() => null),
        generateAIAnalysis(
          second.filters.municipio,
          second.filters.dataInicio,
          second.filters.dataFim,
          second.filters.categoria
        ).catch(() => null),
      ]);

      // Gerar PDF de comparação
      const htmlContent = generateComparisonPDF(
        TERRITORY_NAMES[first.filters.municipio] || 'Município 1',
        TERRITORY_NAMES[second.filters.municipio] || 'Município 2',
        firstData,
        secondData,
        first.filters,
        aiResult1?.data?.qualitative_analysis,
        aiResult2?.data?.qualitative_analysis
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSearch = async () => {
    // Sincronizar filtros antes de buscar
    second.updateFilters({
      categoria: first.filters.categoria,
      dataInicio: first.filters.dataInicio,
      dataFim: first.filters.dataFim,
    });
    
    // Pequeno delay para garantir que os filtros foram atualizados
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await Promise.all([
      first.search(),
      second.search()
    ]);
    setShowDashboard(true);
  };

  const handleNewSearch = () => {
    first.clearResults();
    second.clearResults();
    setShowDashboard(false);
  };

  const firstData = useMemo(() => processResults(first.results), [first.results]);
  const secondData = useMemo(() => processResults(second.results), [second.results]);

  const isYearlyGrouping = useMemo(() => {
    const start = first.filters.dataInicio;
    const end = first.filters.dataFim;
    if (!start || !end) return false;
    const diffDays = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 366;
  }, [first.filters.dataInicio, first.filters.dataFim]);

  const chartData = useMemo(() => {
    const allPeriods = new Set([...Object.keys(firstData.byMonth), ...Object.keys(secondData.byMonth)]);
    const sorted = Array.from(allPeriods).sort();

    let rawData: { name: string; first: number; second: number; firstOriginal: number; secondOriginal: number }[] = [];

    if (isYearlyGrouping) {
      const yearlyFirst: Record<string, number> = {};
      const yearlySecond: Record<string, number> = {};
      
      sorted.forEach(monthKey => {
        const [year] = monthKey.split('-');
        yearlyFirst[year] = (yearlyFirst[year] || 0) + (firstData.byMonth[monthKey] || 0);
        yearlySecond[year] = (yearlySecond[year] || 0) + (secondData.byMonth[monthKey] || 0);
      });
      
      rawData = Object.keys({ ...yearlyFirst, ...yearlySecond }).sort().map(year => ({
        name: year,
        first: Math.round(yearlyFirst[year] || 0),
        second: Math.round(yearlySecond[year] || 0),
        firstOriginal: Math.round(yearlyFirst[year] || 0),
        secondOriginal: Math.round(yearlySecond[year] || 0),
      }));
    } else {
      rawData = sorted.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        return {
          name: `${MONTH_NAMES[monthIndex]}/${year.slice(2)}`,
          first: Math.round(firstData.byMonth[monthKey] || 0),
          second: Math.round(secondData.byMonth[monthKey] || 0),
          firstOriginal: Math.round(firstData.byMonth[monthKey] || 0),
          secondOriginal: Math.round(secondData.byMonth[monthKey] || 0),
        };
      });
    }

    // Calcular valor mínimo visível (5% do máximo) para barras muito pequenas
    const allValues = rawData.flatMap(d => [d.first, d.second]);
    const maxValue = Math.max(...allValues, 1);
    const minVisibleValue = maxValue * 0.05;

    // Ajustar valores muito pequenos para serem visíveis
    return rawData.map(d => ({
      ...d,
      firstDisplay: d.first > 0 && d.first < minVisibleValue ? minVisibleValue : d.first,
      secondDisplay: d.second > 0 && d.second < minVisibleValue ? minVisibleValue : d.second,
    }));
  }, [firstData.byMonth, secondData.byMonth, isYearlyGrouping]);

  const difference = firstData.totalInvested - secondData.totalInvested;
  const percentageDiff = secondData.totalInvested > 0 
    ? ((difference / secondData.totalInvested) * 100).toFixed(1)
    : firstData.totalInvested > 0 ? '100' : '0';

  const firstName = TERRITORY_NAMES[first.filters.municipio] || 'Municipio 1';
  const secondName = TERRITORY_NAMES[second.filters.municipio] || 'Municipio 2';

  const isLoading = first.loading || second.loading;

  // Tela de busca
  if (!showDashboard) {
    return (
      <div className="min-h-screen">
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-fade-in">
            <div className="mb-8">
              <Navbar_sec />
            </div>

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-purple-700 mb-6 border border-purple-100">
                <GitCompare size={16} />
                Comparação de Municípios
              </div>
              
              <h1 className="hero-title text-neutral-800 mb-4">
                Compare investimentos entre
                <span className="text-gradient block">dois municipios</span>
              </h1>
              
              <p className="hero-subtitle">
                Analise e compare os investimentos em tecnologia educacional 
                entre diferentes municipios de Goias.
              </p>
            </div>

            <div className="form-container max-w-4xl mx-auto mb-8">
              <SearchForm
                leftFilters={first.filters}
                rightFilters={second.filters}
                onLeftChange={first.updateFilters}
                onRightChange={second.updateFilters}
                onSearch={handleSearch}
                loading={isLoading}
              />
            </div>

            <div className="glass-card max-w-2xl mx-auto p-6 text-center">
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-purple-600">Dica:</span> Selecione dois municípios diferentes 
                e o mesmo período para uma comparação mais precisa.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-neutral-500 font-medium">Comparando dados...</p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Comparação de Investimentos</h1>
          <p className="text-neutral-500">{firstName} vs {secondName}</p>
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 border-l-4 border-indigo-500">
            <p className="text-sm text-neutral-500 mb-1">{firstName}</p>
            <p className="text-3xl font-bold text-neutral-800">
              R$ {firstData.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-400 mt-2">{first.total} diarios encontrados</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-emerald-500">
            <p className="text-sm text-neutral-500 mb-1">{secondName}</p>
            <p className="text-3xl font-bold text-neutral-800">
              R$ {secondData.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-400 mt-2">{second.total} diarios encontrados</p>
          </div>
        </div>

        {/* Card de Diferenca */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Diferenca</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-neutral-800">
                  R$ {Math.abs(difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className={`badge ${difference >= 0 ? 'badge-success' : 'badge-danger'}`}>
                  {difference >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(parseFloat(percentageDiff))}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">
                {difference >= 0 ? firstName : secondName} investiu mais
              </p>
            </div>
          </div>
        </div>

        {/* Grafico */}
        <div className="chart-container mb-8">
          <h3 className="font-semibold text-neutral-700 mb-6">
            {isYearlyGrouping ? 'Investimentos por Ano' : 'Investimentos por Mês'}
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 13 }} />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 13 }}
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => {
                    // Mostrar valor original, não o ajustado
                    const original = name === firstName 
                      ? props.payload?.firstOriginal 
                      : props.payload?.secondOriginal;
                    return [`R$ ${(original ?? value).toLocaleString('pt-BR')}`, ''];
                  }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="firstDisplay" name={firstName} fill="#6366F1" radius={[6, 6, 0, 0]} minPointSize={5} />
                <Bar dataKey="secondDisplay" name={secondName} fill="#10B981" radius={[6, 6, 0, 0]} minPointSize={5} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-400">
              <FileText size={48} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Botoes */}
        <div className="flex justify-center gap-4">
          <button onClick={handleNewSearch} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Nova Comparacao
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
        </div>
      </div>
    </div>
  );
}
