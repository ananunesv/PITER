# backend/services/processing/statistics_generator.py
import re
from typing import List, Dict, Any

try:
    import pandas as pd
except Exception:
    pd = None  # pandas is optional; we use it when available

# Common categories keywords to try to detect investment destinations
CATEGORY_KEYWORDS = [
    'tablet', 'tablets', 'computador', 'computadores', 'notebook', 'notebooks', 'laptop',
    'infraestrutura', 'obra', 'obras', 'reforma', 'mobiliario', 'mobiliário', 'móveis',
    'software', 'sistema', 'equipamento', 'equipamentos', 'robótica', 'robotica',
    'internet', 'conectividade', 'rede', 'servidor', 'mobiliario'
]


class StatisticsGenerator:
    """
    Gerador de estatísticas para dados dos diários oficiais.
    """

    def __init__(self):
        """Inicializa o gerador de estatísticas."""
        pass

    def generate_statistics(self, gazette_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Gera estatísticas a partir dos dados dos diários oficiais.

        Args:
            gazette_data: Lista de diários oficiais para análise (ou dict retornado pela API)

        Returns:
            Dict contendo estatísticas calculadas
        """
        # Aceita tanto uma lista de gazettes quanto um dicionário com chave 'gazettes'
        if isinstance(gazette_data, dict) and 'gazettes' in gazette_data:
            gazettes_list = gazette_data.get('gazettes') or []
        else:
            gazettes_list = gazette_data or []

        if not gazettes_list:
            return {
                "total_gazettes": 0,
                "total_entities": 0,
                "entity_counts_by_type": {},
                "top_entities": {},
                "total_invested": 0.0,
                "top_categories": {}
            }

        # Converte para DataFrame quando possível (facilita algumas operações)
        df = pd.DataFrame(gazettes_list) if pd is not None else None

        stats: Dict[str, Any] = {
            "total_gazettes": len(gazettes_list),
            "date_range": {
                "start": (df['date'].min() if df is not None and 'date' in df.columns else None),
                "end": (df['date'].max() if df is not None and 'date' in df.columns else None)
            }
        }

        # Estatísticas de entidades (extraídas pelo pipeline de NLP, se houver)
        entities_stats = self.calculate_entity_statistics(self._extract_entities(gazettes_list))
        stats.update(entities_stats)

        # Estatísticas financeiras (investimentos detectados)
        investment_stats = self.extract_investment_statistics(gazettes_list)
        stats.update(investment_stats)

        return stats

    def extract_investment_statistics(self, gazettes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extrai valores monetários e categorias dos textos dos diários.

        Retorna:
            - total_invested: soma de todos os valores encontrados
            - top_categories: mapeamento categoria -> soma dos valores
        """
        total = 0.0
        categories_counter: Dict[str, float] = {}

        # regex para capturar valores em formatos comuns (R$ 1.234,56 ou 1234,56 ou 1.234.567,89)
        money_re = re.compile(r"R\$\s?[0-9\.]{1,20},[0-9]{2}|[0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}")

        for gazette in gazettes:
            # Concatenar campos de texto possíveis
            text_candidates: List[str] = []
            for f in ('excerpts', 'text', 'content'):
                if f in gazette and gazette[f]:
                    if isinstance(gazette[f], list):
                        text_candidates.extend([str(x) for x in gazette[f] if x])
                    else:
                        text_candidates.append(str(gazette[f]))

            combined = "\n".join(text_candidates)
            if not combined:
                continue

            # Buscar valores monetários
            for raw in money_re.findall(combined):
                # Normaliza: remove R$, pontos de milhar, substitui vírgula por ponto decimal
                normalized = raw.replace('R$', '').replace('R', '').strip()
                normalized = normalized.replace('.', '').replace(',', '.')
                cleaned = re.sub(r'[^0-9\.]', '', normalized)
                if not cleaned:
                    continue
                try:
                    value = float(cleaned)
                except Exception:
                    continue

                total += value

                # Determinar categoria buscando palavras-chave próximas ao valor
                idx = combined.find(raw)
                window = combined[max(0, idx - 120): idx + len(raw) + 120]
                found_cat = None
                lower_window = window.lower()
                for kw in CATEGORY_KEYWORDS:
                    if kw in lower_window:
                        found_cat = kw
                        break

                if not found_cat:
                    found_cat = 'outros'

                categories_counter[found_cat] = categories_counter.get(found_cat, 0.0) + value

        # Ordenar categorias por valor decrescente
        sorted_cats = dict(sorted(categories_counter.items(), key=lambda x: x[1], reverse=True))

        return {
            'total_invested': round(total, 2),
            'top_categories': sorted_cats
        }

    def calculate_entity_statistics(self, entities: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Calcula estatísticas a partir das entidades extraídas pelo Spacy.
        """
        if not entities:
            return {
                "total_entities": 0,
                "entity_counts_by_type": {},
                "top_entities": {}
            }

        # Usa Pandas para facilitar a agregação quando disponível
        if pd is not None:
            df = pd.DataFrame(entities)
            total_entities = len(df)
            entity_counts_by_type = df['label'].value_counts().to_dict() if 'label' in df.columns else {}
            top_entities = df['text'].value_counts().head(10).to_dict() if 'text' in df.columns else {}
        else:
            total_entities = len(entities)
            entity_counts_by_type = {}
            top_entities = {}

        stats = {
            "total_entities": total_entities,
            "entity_counts_by_type": entity_counts_by_type,
            "top_entities": top_entities
        }

        return stats

    def _extract_entities(self, gazette_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Extrai todas as entidades dos diários para análise.
        """
        all_entities: List[Dict[str, str]] = []
        for gazette in gazette_data:
            if 'entities' in gazette and gazette['entities']:
                all_entities.extend(gazette['entities'])
        return all_entities