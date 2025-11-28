/**
 * Rota de API para análise
 * Carrega dados de backend/data_output e os processa
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AnalysisFile {
  fileName: string;
  territoryId: string;
  date: string;
  investmentsByCategory: Array<{ category: string; value: number }>;
  totalInvestment: number;
  publicationCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), '..', 'backend', 'data_output');
    
    // Verificar se diretório existe
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({
        success: false,
        error: 'Diretório de dados não encontrado',
        chartData: [],
        statistics: {
          totalFiles: 0,
          totalTerritories: 0,
          totalInvestment: 0,
          averageInvestmentPerFile: 0,
        },
      });
    }

    // Ler arquivos JSON
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .slice(0, 20); // Limita a 20 arquivos

    const chartData: AnalysisFile[] = [];
    const territories = new Set<string>();
    let totalInvestment = 0;

    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Extrair dados de investimento
        let fileInvestment = 0;
        const investmentsByCategory: Array<{ category: string; value: number }> = [];

        // Se há um objeto "ranking" com informações de investimento
        if (data.rankings && data.rankings.by_investment) {
          const byInvestment = data.rankings.by_investment;
          if (Array.isArray(byInvestment)) {
            byInvestment.forEach((item: any) => {
              if (item.top_categories && Array.isArray(item.top_categories)) {
                item.top_categories.forEach((cat: any) => {
                  investmentsByCategory.push({
                    category: cat.category || 'Outros',
                    value: cat.value || 0,
                  });
                  fileInvestment += cat.value || 0;
                });
              }
            });
          }
        }

        // Se há informações de municípios com investimentos
        if (data.municipalities && typeof data.municipalities === 'object') {
          Object.entries(data.municipalities).forEach(([_, muniData]: [string, any]) => {
            const territoryId = muniData.territory_id || _;
            territories.add(territoryId);

            if (muniData.top_categories && typeof muniData.top_categories === 'object') {
              Object.entries(muniData.top_categories).forEach(([category, value]) => {
                if (typeof value === 'number' && value > 0) {
                  const existing = investmentsByCategory.find(
                    ic => ic.category === category
                  );
                  if (existing) {
                    existing.value += value;
                  } else {
                    investmentsByCategory.push({
                      category: category as string,
                      value: value as number,
                    });
                  }
                  fileInvestment += value as number;
                }
              });
            }
          });
        }

        // Se não há investimento mas há ranking, usa como publicações
        if (fileInvestment === 0 && data.rankings?.by_publications) {
          const pubs = data.rankings.by_publications;
          if (Array.isArray(pubs)) {
            const totalPubs = pubs.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
            investmentsByCategory.push({ category: 'Publicações', value: totalPubs });
            fileInvestment = totalPubs;
          }
        }

        if (investmentsByCategory.length === 0) {
          investmentsByCategory.push({ category: 'Sem dados', value: 0 });
        }

        totalInvestment += fileInvestment;

        chartData.push({
          fileName: file,
          territoryId: Array.from(territories)[0] || 'Unknown',
          date: new Date().toISOString(),
          investmentsByCategory,
          totalInvestment: fileInvestment,
          publicationCount: 1,
        });
      } catch (error) {
        console.warn(`Erro ao processar ${file}:`, error);
      }
    }

    const statistics = {
      totalFiles: chartData.length,
      totalTerritories: territories.size,
      totalInvestment,
      averageInvestmentPerFile: chartData.length > 0 ? totalInvestment / chartData.length : 0,
    };

    return NextResponse.json({
      success: true,
      chartData,
      statistics,
    });
  } catch (error) {
    console.error('Erro na rota de análise:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar dados',
        chartData: [],
        statistics: {
          totalFiles: 0,
          totalTerritories: 0,
          totalInvestment: 0,
          averageInvestmentPerFile: 0,
        },
      },
      { status: 500 }
    );
  }
}
