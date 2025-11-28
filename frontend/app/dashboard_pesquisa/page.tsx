/**
 * Página de Dashboard com Gráficos
 * Exibe visualizações dos dados de investimento
 */

import React from 'react';
import DashboardCharts from '@/components/organisms/DashboardCharts';

export const metadata = {
  title: 'Dashboard de Análise - P.I.T.E.R',
  description: 'Visualização de dados de investimentos em diários oficiais',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DashboardCharts />
      </div>
    </main>
  );
}
