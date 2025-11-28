/**
 * Dashboard com Gráficos - Componente principal
 * Carrega dados de backend/data_output e exibe visualizações com Recharts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { InvestmentPieChart } from '@/components/organisms/charts_pesquisa/InvestmentPieChart';
import { InvestmentBarChart } from '@/components/organisms/charts_pesquisa/InvestmentBarChart';
import { InvestmentLineChart } from '@/components/organisms/charts_pesquisa/InvestmentLineChart';

interface ChartData {
  territoryId: string;
  date: string;
  investmentsByCategory: Array<{ category: string; value: number }>;
  totalInvestment: number;
  publicationCount: number;
}

interface Statistics {
  totalFiles: number;
  totalTerritories: number;
  totalInvestment: number;
  averageInvestmentPerFile: number;
}

export default function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<string>('all');

  // Carregar dados do servidor
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/api/analysis');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const data = await response.json();
        setChartData(data.chartData);
        setStatistics(data.statistics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filtrar dados por território
  const filteredData = selectedTerritory === 'all' 
    ? chartData 
    : chartData.filter(d => d.territoryId === selectedTerritory);

  // Preparar dados para gráfico de barras (por território)
  const barChartData = chartData
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.territoryId);
      if (existing) {
        existing.value += curr.totalInvestment;
      } else {
        acc.push({ name: curr.territoryId, value: curr.totalInvestment });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>)
    .sort((a, b) => b.value - a.value);

  // Preparar dados para gráfico de pizza (agregado)
  const pieChartData = chartData
    .flatMap(d => d.investmentsByCategory)
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.category === curr.category);
      if (existing) {
        existing.value += curr.value;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as Array<{ category: string; value: number }>)
    .sort((a, b) => b.value - a.value);

  // Preparar dados para gráfico de linha (por data)
  const lineChartData = filteredData
    .map(d => ({
      name: new Date(d.date).toLocaleDateString('pt-BR'),
      value: d.totalInvestment,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  // Territórios únicos para filtro
  const territories = Array.from(new Set(chartData.map(d => d.territoryId)));

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-semibold">Erro ao carregar dados: {error}</p>
        <p className="text-red-500 text-sm mt-2">
          Verifique se os arquivos estão em backend/data_output
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 mt-12 bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#466986]/50 to-[#1D2D44]/50 text-[#F0EBD8] p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Análise</h1>
        <p className="text-[#F0EBD8]">Visualização de dados de investimentos em diários oficiais</p>
      </div>

      {/* Estatísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold">Total de Arquivos</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{statistics.totalFiles}</p>
          </div>

          <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold">Total de Territórios</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{statistics.totalTerritories}</p>
          </div>

          <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold">Total Investido</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              R$ {(statistics.totalInvestment / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md border-l-4 border-orange-600">
            <p className="text-gray-600 text-sm font-semibold">Média por Arquivo</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              R$ {(statistics.averageInvestmentPerFile / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      )}

      {/* Filtro por Território */}
      <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Filtrar por Território:
        </label>
        <select
          value={selectedTerritory}
          onChange={(e) => setSelectedTerritory(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">Todos os Territórios</option>
          {territories.map((territory) => (
            <option key={territory} value={territory}>
              {territory}
            </option>
          ))}
        </select>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza Chart */}
        <InvestmentPieChart
          data={pieChartData}
          title="Distribuição de Investimentos por Categoria"
        />

        {/* Bar Chart */}
        <InvestmentBarChart
          data={barChartData}
          dataKey="value"
          title="Investimentos por Território"
        />
      </div>

      {/* Line Chart - Tendência */}
      <InvestmentLineChart
        data={lineChartData}
        dataKey="value"
        title="Tendência de Investimentos ao Longo do Tempo"
      />

      {/* Tabela de Dados */}
      <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes dos Dados</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Território</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Data</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Total Investido</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Publicações</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{item.territoryId}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  R$ {item.totalInvestment.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {item.publicationCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
