/**
 * Serviço para gerar relatório de análise por IA (Gemini)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface AIAnalysisResult {
  resumo_objeto?: string;
  justificativa?: string;
  fornecedor?: string;
  marca_modelo?: string;
  raw_analysis?: string;
  error?: string;
}

interface AnalysisData {
  territoryId: string;
  territoryName: string;
  period: string;
  category: string;
  totalInvested: number;
  totalGazettes: number;
  investmentsByCategory: Record<string, number>;
  qualitativeAnalysis?: AIAnalysisResult;
}

/**
 * Chama o endpoint de análise do backend que usa o Gemini
 */
export async function generateAIAnalysis(
  territoryId: string,
  since: string,
  until: string,
  keywords?: string
): Promise<any> {
  try {
    const params = new URLSearchParams({
      territory_id: territoryId,
      since,
      until,
    });

    if (keywords) {
      params.append('keywords', keywords);
    }

    const response = await fetch(`${API_BASE_URL}/analyze?${params}`);
    
    if (!response.ok) {
      throw new Error(`Erro na análise: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    throw error;
  }
}

/**
 * Gera um PDF com o relatório de análise
 */
export function generatePDFReport(data: AnalysisData): void {
  // Criar conteúdo HTML para o PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório P.I.T.E.R - Análise por IA</title>
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
        .section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }
        .section h2 {
          color: #4f46e5;
          font-size: 18px;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .stat-card .label {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-card .value {
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
          margin-top: 4px;
        }
        .category-list {
          list-style: none;
        }
        .category-list li {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .category-list li:last-child {
          border-bottom: none;
        }
        .ai-section {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        }
        .ai-section h2 {
          color: #4338ca;
        }
        .ai-item {
          margin-bottom: 16px;
        }
        .ai-item .label {
          color: #4338ca;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .ai-item .content {
          color: #374151;
          background: white;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
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
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>P.I.T.E.R - Relatório de Análise por IA</h1>
        <p class="subtitle">Plataforma de Integração e Transparência em Educação e Recursos</p>
      </div>

      <div class="section">
        <h2>Informações da Pesquisa</h2>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="label">Município</div>
            <div class="value" style="font-size: 18px;">${data.territoryName}</div>
          </div>
          <div class="stat-card">
            <div class="label">Período</div>
            <div class="value" style="font-size: 18px;">${data.period}</div>
          </div>
          <div class="stat-card">
            <div class="label">Categoria</div>
            <div class="value" style="font-size: 18px;">${data.category}</div>
          </div>
          <div class="stat-card">
            <div class="label">Diários Analisados</div>
            <div class="value">${data.totalGazettes}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Resumo Financeiro</h2>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="label">Total Investido</div>
            <div class="value" style="color: #059669;">R$ ${data.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="stat-card">
            <div class="label">Média por Diário</div>
            <div class="value" style="font-size: 18px;">R$ ${data.totalGazettes > 0 ? (data.totalInvested / data.totalGazettes).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
          </div>
        </div>
      </div>

      ${Object.keys(data.investmentsByCategory).length > 0 ? `
      <div class="section">
        <h2>Investimentos por Subcategoria</h2>
        <ul class="category-list">
          ${Object.entries(data.investmentsByCategory)
            .filter(([name, value]) => value > 0 && name !== 'Outros')
            .sort(([,a], [,b]) => b - a)
            .map(([name, value]) => `
              <li>
                <span>${name}</span>
                <strong>R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </li>
            `).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.qualitativeAnalysis && !data.qualitativeAnalysis.error ? `
      <div class="section ai-section">
        <h2>🤖 Análise Qualitativa por IA (Gemini)</h2>
        ${data.qualitativeAnalysis.resumo_objeto ? `
        <div class="ai-item">
          <div class="label">Objeto da Contratação</div>
          <div class="content">${data.qualitativeAnalysis.resumo_objeto}</div>
        </div>
        ` : ''}
        ${data.qualitativeAnalysis.justificativa ? `
        <div class="ai-item">
          <div class="label">Justificativa</div>
          <div class="content">${data.qualitativeAnalysis.justificativa}</div>
        </div>
        ` : ''}
        ${data.qualitativeAnalysis.fornecedor ? `
        <div class="ai-item">
          <div class="label">Fornecedor</div>
          <div class="content">${data.qualitativeAnalysis.fornecedor}</div>
        </div>
        ` : ''}
        ${data.qualitativeAnalysis.marca_modelo ? `
        <div class="ai-item">
          <div class="label">Marca/Modelo</div>
          <div class="content">${data.qualitativeAnalysis.marca_modelo}</div>
        </div>
        ` : ''}
        ${data.qualitativeAnalysis.raw_analysis ? `
        <div class="ai-item">
          <div class="label">Análise Detalhada</div>
          <div class="content">${data.qualitativeAnalysis.raw_analysis}</div>
        </div>
        ` : ''}
      </div>
      ` : `
      <div class="section ai-section">
        <h2>🤖 Análise Qualitativa por IA</h2>
        <p style="color: #6b7280; text-align: center; padding: 20px;">
          ${data.qualitativeAnalysis?.error || 'Análise não disponível para este período.'}
        </p>
      </div>
      `}

      <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p>P.I.T.E.R - Procurador de Investimentos em Tecnologia em Educação Regional</p>
      </div>
    </body>
    </html>
  `;

  // Abrir janela de impressão
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

