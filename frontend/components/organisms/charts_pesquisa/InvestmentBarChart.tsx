/**
 * Componente de gráfico de barras (Bar Chart)
 * Mostra comparação de investimentos entre territórios
 */

'use client';

import React from 'react';
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

interface BarChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  dataKey?: string;
  title?: string;
  color?: string;
}

export function InvestmentBarChart({
  data,
  dataKey = 'value',
  title = 'Investimentos por Território',
  color = '#8884d8',
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F0EBD8]/80 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => `R$ ${(value as number).toLocaleString('pt-BR')}`}
          />
          <Legend />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
