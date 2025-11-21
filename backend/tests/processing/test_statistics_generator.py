# backend/tests/processing/test_statistics_generator.py
import pytest
import pandas as pd
from typing import List, Dict, Any

# Importa a classe que queremos testar
# (Como rodamos pytest da pasta 'backend', o import começa em 'services')
try:
    from services.processing.statistics_generator import StatisticsGenerator
except ImportError:
    print("\nErro: Não foi possível importar 'StatisticsGenerator'.")
    # Tenta um import alternativo
    from backend.services.processing.statistics_generator import StatisticsGenerator


# --- Testes Unitários para a classe StatisticsGenerator ---

@pytest.fixture
def stats_gen():
    """Cria uma fixture (instância reutilizável) do StatisticsGenerator."""
    return StatisticsGenerator()

def test_stats_gen_com_lista_vazia(stats_gen):
    """Testa se a função retorna zeros/vazios quando a lista de entidades é vazia."""
    entities: List[Dict[str, str]] = []
    
    expected_stats = {
        "total_entities": 0,
        "entity_counts_by_type": {},
        "top_entities": {}
    }
    
    statistics = stats_gen.calculate_entity_statistics(entities)
    assert statistics == expected_stats

def test_stats_gen_com_lista_simples(stats_gen):
    """Testa o cálculo básico com uma lista simples de entidades."""
    entities = [
        {"text": "Prefeitura", "label": "ORG"},
        {"text": "Brasília", "label": "LOC"}
    ]
    
    expected_stats = {
        "total_entities": 2,
        "entity_counts_by_type": {"ORG": 1, "LOC": 1},
        "top_entities": {"Prefeitura": 1, "Brasília": 1}
    }
    
    statistics = stats_gen.calculate_entity_statistics(entities)
    assert statistics == expected_stats

def test_stats_gen_com_entidades_duplicadas(stats_gen):
    """Testa a contagem correta de entidades e tipos duplicados."""
    entities = [
        {"text": "Prefeitura", "label": "ORG"},
        {"text": "Brasília", "label": "LOC"},
        {"text": "Prefeitura", "label": "ORG"}, # Duplicado
        {"text": "Prefeitura", "label": "ORG"}, # Triplicado
        {"text": "Pedro", "label": "PER"}
    ]
    
    expected_stats = {
        "total_entities": 5, # Contagem total de itens na lista
        "entity_counts_by_type": {"ORG": 3, "LOC": 1, "PER": 1}, # Contagem por tipo
        "top_entities": {"Prefeitura": 3, "Brasília": 1, "Pedro": 1} # Contagem por texto
    }
    
    statistics = stats_gen.calculate_entity_statistics(entities)
    assert statistics == expected_stats

def test_stats_gen_top_10_limite(stats_gen):
    """Testa se o 'top_entities' é limitado a 10."""
    entities = []
    for i in range(15):
        entities.append({"text": f"Entidade_{i}", "label": "MISC"})
    
    statistics = stats_gen.calculate_entity_statistics(entities)
    
    assert statistics["total_entities"] == 15
    assert len(statistics["top_entities"]) == 10 # Deve ser 10, não 15

def test_stats_gen_com_dados_mal_formados(stats_gen):
    """Testa como a função lida com dicionários sem as chaves 'label' ou 'text'."""
    # O código refatorado agora filtra dados mal-formados
    entities = [
        {"text": "Prefeitura", "label": "ORG"},
        {"foo": "bar"}, # Dicionário mal formado - será filtrado
        {"text": "Brasília", "label": None}, # Label ausente - será filtrado
        {"label": "PER"} # Texto ausente - será filtrado
    ]

    statistics = stats_gen.calculate_entity_statistics(entities)

    # total_entities é calculado pela soma dos counts de labels válidos
    # Pandas conta ORG (1) + PER (1) = 2
    assert statistics["total_entities"] == 2

    # Pandas conta labels válidos (não-None), mesmo sem texto associado
    # ORG (Prefeitura) e PER (sem texto) são contados
    assert statistics["entity_counts_by_type"] == {"ORG": 1, "PER": 1}

    # value_counts() em 'text' conta apenas textos válidos (não-None)
    # "Prefeitura" e "Brasília" têm texto válido
    assert statistics["top_entities"] == {"Prefeitura": 1, "Brasília": 1}