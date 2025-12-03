/**
 * BackendIntegrationService
 * Serviço centralizado para comunicação com a API do backend P.I.T.E.R
 * 
 * Fluxos disponíveis:
 * 1. Search - Busca simples de diários (GET /api/v1/gazettes)
 * 2. Analyze - Análise completa com IA (GET /analyze)
 * 3. Compare - Comparação entre territórios (GET /compare)
 */

import {
  AnalysisResponse,
  ComparisonResponse,
  SearchResponse,
} from '@/types';

const API_BASE_URL: string =
  ((globalThis as any).process?.env?.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8001';

export class BackendIntegrationService {
  /**
   * FLUXO 1: Busca Simples de Diários
   * Retorna diários direto da Querido Diário API
   * 
   * @param territoryId - ID IBGE do município
   * @param querystring - Palavra-chave para buscar
   * @param publishedSince - Data inicial (YYYY-MM-DD)
   * @param publishedUntil - Data final (YYYY-MM-DD)
   * @param size - Quantidade de resultados
   */
  static async search(
    territoryId: string,
    querystring: string,
    publishedSince?: string,
    publishedUntil?: string,
    size: number = 100
  ): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        territory_ids: territoryId,
        querystring,
        size: size.toString(),
      });

      if (publishedSince) params.append('published_since', publishedSince);
      if (publishedUntil) params.append('published_until', publishedUntil);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/gazettes?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar diários:', error);
      throw error;
    }
  }

  /**
   * FLUXO 2: Análise Completa com IA
   * Executa pipeline completo: NER + Estatísticas + Gemini
   * 
   * @param territoryId - ID IBGE do município
   * @param since - Data inicial (YYYY-MM-DD)
   * @param until - Data final (YYYY-MM-DD)
   * @param keywords - Palavra-chave para filtro (opcional)
   */
  static async analyze(
    territoryId: string,
    since: string,
    until: string,
    keywords?: string
  ): Promise<AnalysisResponse> {
    try {
      const params = new URLSearchParams({
        territory_id: territoryId,
        since,
        until,
      });

      if (keywords) params.append('keywords', keywords);

      const response = await fetch(`${API_BASE_URL}/analyze?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Analyze API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      // Salvar localmente para acesso posterior
      await this.saveAnalysisLocally(data);

      return data;
    } catch (error) {
      console.error('❌ Erro ao analisar diários:', error);
      throw error;
    }
  }

  /**
   * FLUXO 3: Comparação entre Territórios
   * Executa 2 análises completas e calcula diferença
   * 
   * @param territoryA - ID IBGE do município A
   * @param dateAStart - Data inicial para A
   * @param dateAEnd - Data final para A
   * @param territoryB - ID IBGE do município B
   * @param dateBStart - Data inicial para B
   * @param dateBEnd - Data final para B
   * @param keywords - Palavra-chave comum (opcional)
   */
  static async compare(
    territoryA: string,
    dateAStart: string,
    dateAEnd: string,
    territoryB: string,
    dateBStart: string,
    dateBEnd: string,
    keywords?: string
  ): Promise<ComparisonResponse> {
    try {
      const params = new URLSearchParams({
        territory_a: territoryA,
        date_a_start: dateAStart,
        date_a_end: dateAEnd,
        territory_b: territoryB,
        date_b_start: dateBStart,
        date_b_end: dateBEnd,
      });

      if (keywords) params.append('keywords', keywords);

      const response = await fetch(`${API_BASE_URL}/compare?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Compare API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      // Salvar localmente para acesso posterior
      await this.saveComparisonLocally(data);

      return data;
    } catch (error) {
      console.error('❌ Erro ao comparar territórios:', error);
      throw error;
    }
  }

  /**
   * Verificar saúde do backend
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Backend offline:', error);
      return false;
    }
  }

  /**
   * Salvar análise localmente no localStorage e em arquivo
   */
  private static async saveAnalysisLocally(data: AnalysisResponse) {
    try {
      // Armazenar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'latest_search',
          JSON.stringify({
            ...data,
            saved_at: new Date().toISOString(),
          })
        );
      }

      // Salvar em arquivo público via API Next.js (se houver)
      // Nota: Isso seria implementado em um endpoint Next.js
      console.log('✅ Análise salva localmente');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar análise localmente:', error);
    }
  }

  /**
   * Salvar comparação localmente no localStorage e em arquivo
   */
  private static async saveComparisonLocally(data: ComparisonResponse) {
    try {
      // Armazenar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'latest_comparison',
          JSON.stringify({
            ...data,
            saved_at: new Date().toISOString(),
          })
        );
      }

      console.log('✅ Comparação salva localmente');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar comparação localmente:', error);
    }
  }

  /**
   * Carregar dados salvos do localStorage
   */
  static loadAnalysisFromLocal(): AnalysisResponse | null {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('latest_search');
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar análise local:', error);
      return null;
    }
  }

  static loadComparisonFromLocal(): ComparisonResponse | null {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('latest_comparison');
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar comparação local:', error);
      return null;
    }
  }

  /**
   * NOVO: Carregar lista de arquivos de data_output
   */
  static async loadDataOutput(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/data_output`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Data Output API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados de data_output carregados:', data.files.length, 'arquivos');
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar data_output:', error);
      throw error;
    }
  }

  /**
   * NOVO: Carregar arquivo específico de data_output
   */
  static async loadDataOutputFile(filename: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/data_output/${filename}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Data Output File API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Arquivo carregado:', filename);
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar arquivo:', filename, error);
      throw error;
    }
  }

  /**
   * NOVO: Salvar resultados de busca no backend
   * Permite sincronizar busca simples com dashboard
   *
   * @param gazettes - Array de diários encontrados
   * @param filters - Filtros usados na busca
   */
  static async saveSearchResults(
    gazettes: any[],
    filters: {
      territory_id?: string;
      municipio?: string;
      dataInicio?: string;
      dataFim?: string;
      categoria?: string;
      querystring?: string;
    }
  ): Promise<void> {
    try {
      // Não bloquear se não houver diários
      if (!gazettes || gazettes.length === 0) {
        console.log('⚠️ Nenhum diário para salvar');
        return;
      }

      console.log(`💾 Salvando ${gazettes.length} diários no backend...`);

      const response = await fetch(`${API_BASE_URL}/api/v1/save_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gazettes,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save Search API Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'saved') {
        console.log(`✅ Resultados salvos: ${result.filename}`);
      } else if (result.status === 'error') {
        console.warn('⚠️ Erro ao salvar (não crítico):', result.message);
      }
    } catch (error) {
      // Erro silencioso - não deve bloquear a busca
      console.warn('⚠️ Não foi possível salvar resultados (não crítico):', error);
      // NÃO lançar erro - deixa a busca continuar normalmente
    }
  }
}

// Export como singleton para uso direto
export default BackendIntegrationService;
