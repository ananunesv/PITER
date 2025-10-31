# backend/services/processing/statistics_generator.py
import pandas as pd
from typing import List, Dict, Any

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
            gazette_data: Lista de diários oficiais para análise
            
        Returns:
            Dict contendo estatísticas calculadas
        """
        if not gazette_data:
            return {
                "total_gazettes": 0,
                "total_entities": 0,
                "entity_counts_by_type": {},
                "top_entities": {}
            }
            
        # Converte para DataFrame para facilitar a análise
        df = pd.DataFrame(gazette_data)
        
        # Estatísticas básicas
        stats = {
            "total_gazettes": len(df),
            "date_range": {
                "start": df['date'].min() if 'date' in df.columns else None,
                "end": df['date'].max() if 'date' in df.columns else None
            }
        }
        
        # Se houver entidades extraídas, calcula estatísticas delas
        entities_stats = self.calculate_entity_statistics(self._extract_entities(gazette_data))
        stats.update(entities_stats)
        
        return stats

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

        # Usa Pandas para facilitar a agregação
        df = pd.DataFrame(entities)
        
        # 1. Contagem total de entidades
        total_entities = len(df)
        
        # 2. Contagem por tipo (ex: 50 PESSOAS, 30 LOCAIS)
        entity_counts_by_type = df['label'].value_counts().to_dict() if 'label' in df.columns else {}
        
        # 3. Entidades mais comuns (ex: "Prefeitura de Brasília": 10 vezes)
        top_entities = df['text'].value_counts().head(10).to_dict() if 'text' in df.columns else {}
        
        stats = {
            "total_entities": total_entities,
            "entity_counts_by_type": entity_counts_by_type,
            "top_entities": top_entities
        }
        
        print(f"Estatísticas das entidades: {stats}")
        return stats
        
    def _extract_entities(self, gazette_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Extrai todas as entidades dos diários para análise.
        """
        all_entities = []
        for gazette in gazette_data:
            if 'entities' in gazette:
                all_entities.extend(gazette['entities'])
        return all_entities