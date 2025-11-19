# backend/services/integration/piter_api_orchestrator.py
from typing import Dict, Any
from httpx import RequestError

# --- Imports para a CLASSE e a FUNÇÃO ---
from services.api.clients import querido_diario_client, spacy_api_client
from services.api.clients.querido_diario_client import FilterParams, QueridoDiarioClient
from services.processing import data_cleaner
from services.processing.statistics_generator import StatisticsGenerator

# --- Definição da CLASSE ---
class PiterApiOrchestrator:
    def __init__(self):
        self.qd_client = QueridoDiarioClient()
    
    async def get_enriched_gazette_data(self, filters: FilterParams) -> Dict[str, Any]:
        print(f"Orchestrator (classe): Buscando diários com filtros: {filters}")
        gazette_data = await self.qd_client.fetch_gazettes(filters)
        return gazette_data

# --- Definição da FUNÇÃO (Standalone) ---
async def run_analysis_pipeline(territory_id: str, since: str, until: str) -> Dict[str, Any]:
    """
    Orquestra o pipeline completo de IA (usado pelo endpoint /analyze).
    PROCESSA TODOS OS DIÁRIOS E TODOS OS 'EXCERPTS' (PLURAL).
    """
    print("Iniciando pipeline de análise (função)...")

    # 1. Coleta de Dados
    try:
        gazette_data = await querido_diario_client.fetch_gazettes(territory_id, since, until)
    except RequestError as e:
        print(f"Erro ao conectar ao Querido Diário: {e}")
        return {"error": "Nenhum diário encontrado."}

    if not gazette_data or "gazettes" not in gazette_data or not gazette_data["gazettes"]:
        print("!!! API não retornou diários.")
        return {"error": "Nenhum diário encontrado."}

    # --- LÓGICA DE AGREGAÇÃO (CORRIGIDA) ---
    print(f"Agregando texto de {len(gazette_data['gazettes'])} diários...")
    all_raw_text_segments = []
    
    # Loop 1: Passa por cada diário (dos 50 baixados)
    for gazette in gazette_data["gazettes"]:
        
        # Procura a chave 'excerpts' (plural), que é uma lista
        excerpt_list = gazette.get("excerpts", []) # Pega a lista de textos
        
        if excerpt_list:
            # Loop 2: Passa por cada segmento de texto dentro da lista
            for text_segment in excerpt_list:
                if text_segment: # Garante que o segmento não é vazio
                    all_raw_text_segments.append(text_segment)

    if not all_raw_text_segments:
        print("!!! Nenhum dos diários encontrados continha texto no 'excerpts' (plural). Parando.")
        return {"error": "Nenhum diário encontrado continha texto."}

    # Junta todos os segmentos de texto em um bloco só
    full_raw_text = " ".join(all_raw_text_segments)
    # --- FIM DA MODIFICAÇÃO ---


    # 2. Limpeza e Pré-filtragem (agora do texto completo)
    print("\n" + "="*50)
    print(f"--- TEXTO BRUTO (COMBINADO) ---")
    print(full_raw_text[:1000] + "...") # Mostra os primeiros 1000 caracteres
    print("="*50 + "\n")
    
    cleaned_text = data_cleaner.pre_filter_spacy_input(full_raw_text) # Usa o texto combinado
    
    print(f"--- TEXTO PÓS-FILTRAGEM (LIMPO) ---")
    print(cleaned_text[:1000] + "...") # Mostra os primeiros 1000 caracteres
    print("="*50 + "\n")

    if not cleaned_text:
        print("!!! Texto limpo (combinado) ficou vazio. Parando o pipeline.")
        return {"error": "Texto do diário está vazio ou inválido."}

    # 3. Processamento de IA
    print("Enviando texto limpo para o Spacy...")
    entities = await spacy_api_client.extract_entities(cleaned_text)

    # 4. Estatística
    print("Calculando estatísticas...")
    stats_gen = StatisticsGenerator()
    statistics = stats_gen.calculate_entity_statistics(entities)

    print("Pipeline finalizado (função).")

    return {
        "source_territory": territory_id,
        "period": f"{since} a {until}",
        "analysis_stats": statistics
    }