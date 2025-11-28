/**
 * Serviço para carregar e processar dados JSON do backend/data_output
 * Lê arquivos de análise e os transforma em dados visualizáveis
 */

import fs from 'fs';
import path from 'path';

export interface AnalysisData {
  territory_id: string;
  territory_name?: string;
  date?: string;
  data?: Record<string, any>;
  [key: string]: any;
}

export interface ProcessedAnalysis {
  fileName: string;
  territoryId: string;
  date: string;
  investmentsByCategory: Array<{ category: string; value: number }>;
  totalInvestment: number;
  publicationCount: number;
}

/**
 * Carrega todos os arquivos JSON de data_output
 */
export async function loadAnalysisFiles(): Promise<AnalysisData[]> {
  try {
    const dataDir = path.join(process.cwd(), '..', 'backend', 'data_output');
    
    if (!fs.existsSync(dataDir)) {
      console.warn(`Diretório não encontrado: ${dataDir}`);
      return [];
    }

    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .slice(0, 10); // Limita a 10 arquivos para não sobrecarregar

    const analysisData: AnalysisData[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        analysisData.push({
          fileName: file,
          territory_id: data.territory_id || 'Unknown',
          territory_name: data.territory_name || `Territory ${data.territory_id}`,
          date: data.date || file,
          ...data,
        });
      } catch (error) {
        console.warn(`Erro ao processar arquivo ${file}:`, error);
      }
    }

    return analysisData;
  } catch (error) {
    console.error('Erro ao carregar arquivos de análise:', error);
    return [];
  }
}

/**
 * Processa dados de análise para visualização em gráficos
 */
export function processAnalysisForCharts(analysisData: AnalysisData[]): ProcessedAnalysis[] {
  return analysisData.map(analysis => {
    // Extrai informações de investimento por categoria
    const investmentsByCategory: Array<{ category: string; value: number }> = [];
    let totalInvestment = 0;
    let publicationCount = 0;

    // Se há dados de investimento no objeto
    if (analysis.data && typeof analysis.data === 'object') {
      Object.entries(analysis.data).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0) {
          investmentsByCategory.push({ category: key, value });
          totalInvestment += value;
        }
      });
    }

    // Se há informações de publicação
    if (analysis.publications) {
      publicationCount = Array.isArray(analysis.publications) 
        ? analysis.publications.length 
        : 1;
    }

    return {
      fileName: analysis.fileName,
      territoryId: analysis.territory_id,
      date: analysis.date || new Date().toISOString(),
      investmentsByCategory: investmentsByCategory.length > 0 
        ? investmentsByCategory 
        : [{ category: 'Outros', value: totalInvestment || 1 }],
      totalInvestment,
      publicationCount,
    };
  });
}

/**
 * Agrupa dados por território
 */
export function groupByTerritory(analysisData: AnalysisData[]): Record<string, AnalysisData[]> {
  return analysisData.reduce((acc, item) => {
    const territory = item.territory_id || 'Unknown';
    if (!acc[territory]) {
      acc[territory] = [];
    }
    acc[territory].push(item);
    return acc;
  }, {} as Record<string, AnalysisData[]>);
}

/**
 * Gera estatísticas gerais
 */
export function generateStatistics(analysisData: AnalysisData[]) {
  const territories = new Set(analysisData.map(a => a.territory_id));
  const totalInvestment = analysisData.reduce((sum, a) => {
    if (a.data && typeof a.data === 'object') {
      const categorySum = Object.values(a.data)
        .filter(v => typeof v === 'number')
        .reduce((s, v) => s + (v as number), 0);
      return sum + categorySum;
    }
    return sum;
  }, 0);

  return {
    totalFiles: analysisData.length,
    totalTerritories: territories.size,
    totalInvestment,
    averageInvestmentPerFile: analysisData.length > 0 ? totalInvestment / analysisData.length : 0,
  };
}
