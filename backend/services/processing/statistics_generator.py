# backend/services/processing/statistics_generator.py
import pandas as pd
from typing import List, Dict, Any

def calculate_entity_statistics(entities: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Calcula estatísticas a partir das entidades extraídas pelo Spacy.
    """
    if not entities:
        return {"total_entities": 0, "entity_counts_by_type": {}, "top_entities": {}}

    # Usa Pandas para facilitar a agregação
    df = pd.DataFrame(entities)
    
    # 1. Contagem total de entidades
    total_entities = len(df)
    
    # 2. Contagem por tipo (ex: 50 PESSOAS, 30 LOCAIS)
    entity_counts_by_type = df['label'].value_counts().to_dict()
    
    # 3. Entidades mais comuns (ex: "Prefeitura de Brasília": 10 vezes)
    top_entities = df['text'].value_counts().head(10).to_dict()
    
    stats = {
        "total_entities": total_entities,
        "entity_counts_by_type": entity_counts_by_type,
        "top_entities": top_entities
    }
    
    print(f"Estatísticas: {stats}")
    return stats