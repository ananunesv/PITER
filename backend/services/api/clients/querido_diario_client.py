# backend/services/api/clients/querido_diario_client.py

import httpx
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

QUERIDO_DIARIO_API_URL = "https://api.queridodiario.ok.org.br" # <-- Corrigido

async def fetch_gazettes(territory_id: str, since: str, until: str) -> Optional[Dict[Any, Any]]:
    """
    Busca diários oficiais de um território em um período.
    """
    url = f"{QUERIDO_DIARIO_API_URL}/gazettes"
    params = {
        "territory_ids": territory_id,
        "since": since,
        "until": until,
        "size": 50,
        "querystring": "prefeitura"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            
            # Levanta um erro se a requisição falhar (ex: 404, 500)
            response.raise_for_status() 
            
            data = response.json()
            total = data.get('total_gazettes', 0)
            print(f"Querido Diário: Encontrados {total} diários para {territory_id} entre {since} e {until}")
            print(f"URL da requisição: {response.url}")
            return data
    
    except httpx.HTTPStatusError as e: # Captura erros de status (4xx, 5xx)
        print(f"Erro HTTP ao buscar dados do Querido Diário: Status {e.response.status_code}")
        print(f"URL da requisição: {e.request.url}")
        print(f"Resposta: {e.response.text}")
        return None
    except httpx.RequestError as e: # Captura erros de conexão, DNS, timeout, etc.
        print(f"Erro de CONEXÃO ao buscar dados do Querido Diário: {e}")
        return None
    except Exception as e: # Captura outros erros inesperados
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
    BASE_URL = "https://api.queridodiario.ok.org.br/gazettes" # <-- Corrigido

    async def fetch_gazettes(self, filters: FilterParams) -> Dict[str, Any]:
        # Converte o modelo Pydantic para um dicionário, removendo valores nulos
        params = filters.dict(exclude_none=True)

        async with httpx.AsyncClient() as client:
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
        """
        # Currently we ignore `keywords` here because the simple
        # Querido Diário client implementation does not use them in the
        # request params. If needed, we can add mapping to the
        # `querystring` parameter later.
        return await fetch_gazettes(str(territory_id), str(start_date), str(end_date))