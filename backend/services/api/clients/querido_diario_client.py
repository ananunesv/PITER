# backend/services/api/clients/querido_diario_client.py

import httpx
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

QUERIDO_DIARIO_API_URL = "https://api.queridodiario.ok.org.br/api" # <-- Corrigido

async def fetch_gazettes(territory_id: str, since: str, until: str, keywords: str = None) -> Optional[Dict[Any, Any]]:
    """
    Busca diários oficiais com palavras-chave específicas.
    """
    url = f"{QUERIDO_DIARIO_API_URL}/gazettes"
    
    # Se não passar keyword, usa uma padrão focada em gastos para garantir resultados
    query_term = keywords if keywords else "educação tecnologia informática"
    
    params = {
        "territory_ids": territory_id,
        "since": since,
        "until": until,
        "size": 50, # Pode aumentar para 100 para ter mais dados
        "querystring": query_term # <-- Usa a variável dinâmica aqui
    }
    
    try:
        # --- CORREÇÃO: follow_redirects=True segue o link novo automaticamente ---
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            print(f"Buscando em: {url} (com redirecionamento automático)")
            response = await client.get(url, params=params)
            
            # Se der erro 404 ou 500, vai cair aqui
            response.raise_for_status() 
            
            data = response.json()
            print(f"Querido Diário: Encontrados {data.get('total_gazettes', 0)} diários.")
            return data
    
    except httpx.HTTPStatusError as e:
        print(f"Erro HTTP ao buscar dados do Querido Diário: Status {e.response.status_code}")
        print(f"Detalhes: {e.response.text[:200]}...") # Mostra o início do erro para ajudar no debug
        return None
    except httpx.RequestError as e:
        print(f"Erro de CONEXÃO ao buscar dados do Querido Diário: {e}")
        return None
    except Exception as e:
        print(f"Erro inesperado no cliente do Querido Diário: {e}")
        return None

class FilterParams(BaseModel):
    """Modelo para os parâmetros de filtro da API do Querido Diário."""
    territory_ids: Optional[str] = None
    published_since: Optional[date] = None
    published_until: Optional[date] = None
    querystring: Optional[str] = None
    size: Optional[int] = 10

class QueridoDiarioClient:
    BASE_URL = "https://api.queridodiario.ok.org.br/api/gazettes" # <-- Corrigido

    async def fetch_gazettes(self, filters: FilterParams) -> Dict[str, Any]:
        params = filters.dict(exclude_none=True)
        # Adiciona follow_redirects aqui também
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.get(self.BASE_URL, params=params)
            response.raise_for_status()

            # Garantir codificação UTF-8 correta
            response.encoding = 'utf-8'
            data = response.json()

            # Corrigir problemas de codificação nos excerpts
            if 'gazettes' in data:
                for gazette in data['gazettes']:
                    if 'excerpts' in gazette and gazette['excerpts']:
                        gazette['excerpts'] = [
                            self._fix_encoding(excerpt) if isinstance(excerpt, str) else excerpt
                            for excerpt in gazette['excerpts']
                        ]

            print("Resposta do Querido Diário:", data) # Ótimo para depuração
            return data

    def _fix_encoding(self, text: str) -> str:
        """Corrige problemas comuns de codificação de caracteres."""
        if not text:
            return text

        # Dicionário de substituições para caracteres mal codificados
        replacements = {
            '�': '',  # Remove caracteres de interrogação
            'ç': 'ç',
            'ã': 'ã',
            'á': 'á',
            'â': 'â',
            'à': 'à',
            'ê': 'ê',
            'é': 'é',
            'í': 'í',
            'ô': 'ô',
            'ó': 'ó',
            'ú': 'ú',
            'ü': 'ü',
            'Ç': 'Ç',
            'Ã': 'Ã',
            'Á': 'Á',
            'Â': 'Â',
            'À': 'À',
            'Ê': 'Ê',
            'É': 'É',
            'Í': 'Í',
            'Ô': 'Ô',
            'Ó': 'Ó',
            'Ú': 'Ú',
            'Ü': 'Ü',
        }

        # Aplicar correções específicas para caracteres mal codificados
        fixed_text = text

        # Corrigir padrões específicos encontrados
        fixed_text = fixed_text.replace('incen�var', 'incentivar')
        fixed_text = fixed_text.replace('inicia�va', 'iniciativa')
        fixed_text = fixed_text.replace('a�vidades', 'atividades')
        fixed_text = fixed_text.replace('a�ões', 'ações')

        # Remover caracteres de interrogação isolados
        import re
        fixed_text = re.sub(r'[�]+', '', fixed_text)

        return fixed_text

    async def search_gazettes(self, territory_id: str, start_date: str, end_date: str, keywords: list):
        """Compatibility wrapper expected by RankingService.

        The older RankingService calls `search_gazettes(...)`. Provide a
        thin wrapper that delegates to the module-level `fetch_gazettes`
        implementation (which performs the actual HTTP request).

        Args:
            territory_id: Código IBGE do território
            start_date: Data inicial (YYYY-MM-DD)
            end_date: Data final (YYYY-MM-DD)
            keywords: Lista de palavras-chave para filtrar os resultados
        """
        # Passa as keywords para fetch_gazettes para uso no querystring
        return await fetch_gazettes(str(territory_id), str(start_date), str(end_date), keywords)