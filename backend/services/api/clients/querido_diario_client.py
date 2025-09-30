# backend/services/api/clients/querido_diario_client.py

import httpx
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

class FilterParams(BaseModel):
    """Modelo para os parâmetros de filtro da API do Querido Diário."""
    territory_ids: Optional[str] = None
    published_since: Optional[date] = None
    published_until: Optional[date] = None
    querystring: Optional[str] = None
    size: Optional[int] = 10

class QueridoDiarioClient:
    BASE_URL = "https://queridodiario.ok.org.br/api/gazettes"

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