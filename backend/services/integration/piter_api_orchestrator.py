# backend/services/integration/piter_api_orchestrator.py
from typing import Dict, Any

# --- Imports para a CLASSE e a FUNÇÃO ---
# (Remova o prefixo 'backend.')
from services.api.clients import querido_diario_client, spacy_api_client
from services.api.clients.querido_diario_client import FilterParams, QueridoDiarioClient # Adicionado QueridoDiarioClient aqui
from services.processing import data_cleaner, statistics_generator

# --- Definição da CLASSE ---
class PiterApiOrchestrator:
    def __init__(self):
        # Inicializa os clientes que a classe vai usar
        self.qd_client = QueridoDiarioClient()
        # Se precisar do Spacy na classe, inicialize aqui também
        # self.spacy_client = SpacyApiClient(base_url="http://127.0.0.1:8080") # Exemplo

    async def get_enriched_gazette_data(self, filters: FilterParams) -> Dict[str, Any]:
        """
        Método da classe para buscar diários (usado pelo endpoint /api/v1/gazettes).
        (Adapte esta lógica conforme a necessidade original do seu endpoint)
        """
        print(f"Orchestrator (classe): Buscando diários com filtros: {filters}")
        # Chama o método fetch_gazettes da instância do cliente
        gazette_data = await self.qd_client.fetch_gazettes(filters)

        # Aqui você poderia adicionar enriquecimento com Spacy se necessário para este endpoint
        # Exemplo:
        # if gazette_data and gazette_data.get("gazettes"):
        #     for gazette in gazette_data["gazettes"]:
        #         raw_text = gazette.get("excerpt", "")
        #         cleaned_text = data_cleaner.clean_text_for_ia(raw_text)
        #         if cleaned_text:
        #             entities = await spacy_api_client.extract_entities(cleaned_text) # Usa a função do módulo
        #             gazette["nlp_entities"] = entities # Adiciona entidades ao resultado

        return gazette_data

# --- Definição da FUNÇÃO (Standalone) ---
async def run_analysis_pipeline(territory_id: str, since: str, until: str) -> Dict[str, Any]:
    """
    Orquestra o pipeline completo de IA (usado pelo endpoint /analyze).
    """
    print("Iniciando pipeline de análise (função)...")

    # 1. Coleta de Dados - Usa a função do módulo do cliente
    gazette_data = await querido_diario_client.fetch_gazettes(territory_id, since, until)

    if not gazette_data or "gazettes" not in gazette_data or not gazette_data["gazettes"]:
        return {"error": "Nenhum diário encontrado."}

    # Pega o texto do primeiro diário
    raw_text = gazette_data["gazettes"][0].get("excerpt", "")

    # 2. Limpeza
    cleaned_text = data_cleaner.clean_text_for_ia(raw_text)

    if not cleaned_text:
        return {"error": "Texto do diário está vazio ou inválido."}

    # 3. Processamento de IA - Usa a função do módulo do cliente
    entities = await spacy_api_client.extract_entities(cleaned_text)

    # 4. Estatística
    statistics = statistics_generator.calculate_entity_statistics(entities)

    print("Pipeline finalizado (função).")

    return {
        "source_territory": territory_id,
        "period": f"{since} a {until}",
        "analysis_stats": statistics
    }