/**
 * Componente de gráfico de pizza (Pie Chart)
 * Mostra distribuição de investimentos por categoria
 */

'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: Array<{ category: string; value: number }>;
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

export function InvestmentPieChart({ 
  data, 
  title = 'Distribuição de Investimentos',
  colors = DEFAULT_COLORS 
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => {
              const category = entry.category || entry.name || 'Outros';
              return category;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `R$ ${(value as number).toLocaleString('pt-BR')}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
