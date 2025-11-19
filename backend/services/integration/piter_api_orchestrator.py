# backend/services/integration/piter_api_orchestrator.py
import json
import os
from datetime import datetime
from typing import Dict, Any
from httpx import RequestError
from services.api.clients import querido_diario_client, spacy_api_client, gemini_client # <-- Adicionado gemini_client

# --- Imports ---
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

# --- FUNÇÃO AUXILIAR DE PERSISTÊNCIA (ATUALIZADA) ---
def save_results(data: Dict[str, Any]):
    """
    Salva o resultado JSON em dois lugares:
    1. No Frontend (para a aplicação web ler)
    2. No Backend/data_output (para debug e histórico local)
    """
    try:
        territory = data['meta']['source_territory']
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"analysis_{territory}_{timestamp}.json"

        # --- 1. Salvar no FRONTEND (public/data) ---
        # Sobe um nível (..) para sair do backend e entrar no frontend
        frontend_path = os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "public", "data"))
        os.makedirs(frontend_path, exist_ok=True)
        
        # Salva histórico no frontend
        with open(os.path.join(frontend_path, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        # Salva o 'latest.json' para o frontend consumir fácil
        with open(os.path.join(frontend_path, "latest_analysis.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ [FRONTEND] Dados salvos em: {frontend_path}")

        # --- 2. Salvar no BACKEND (data_output) ---
        # Salva na pasta local onde o script está rodando
        backend_path = os.path.abspath(os.path.join(os.getcwd(), "data_output"))
        os.makedirs(backend_path, exist_ok=True)

        with open(os.path.join(backend_path, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ [BACKEND] Cópia de segurança salva em: {backend_path}")
        
    except Exception as e:
        print(f"❌ [ERRO] Falha ao salvar arquivos: {e}")

# --- Definição da FUNÇÃO PRINCIPAL ---
async def run_analysis_pipeline(territory_id: str, since: str, until: str, keywords: str = None) -> Dict[str, Any]:
    """
    Orquestra o pipeline completo de IA e SALVA o resultado.
    """
    print(f"Iniciando pipeline de análise (keywords={keywords})...")

    # 1. Coleta de Dados
    try:
        gazette_data = await querido_diario_client.fetch_gazettes(
            territory_id, since, until, keywords=keywords
        )
    except RequestError as e:
        print(f"Erro ao conectar ao Querido Diário: {e}")
        return {"error": "Nenhum diário encontrado."}

    if not gazette_data or "gazettes" not in gazette_data or not gazette_data["gazettes"]:
        print("!!! API não retornou diários.")
        return {"error": "Nenhum diário encontrado."}

    # --- Agregação ---
    print(f"Agregando texto de {len(gazette_data['gazettes'])} diários...")
    all_raw_text_segments = []
    
    for gazette in gazette_data["gazettes"]:
        excerpt_list = gazette.get("excerpts", [])
        if excerpt_list:
            for text_segment in excerpt_list:
                if text_segment:
                    all_raw_text_segments.append(text_segment)

    if not all_raw_text_segments:
        return {"error": "Nenhum diário encontrado continha texto."}

    full_raw_text = " ".join(all_raw_text_segments)

    # 2. Limpeza
    cleaned_text = data_cleaner.pre_filter_spacy_input(full_raw_text)
    if not cleaned_text:
        return {"error": "Texto do diário está vazio ou inválido."}

    # 3. IA (SpaCy)
    print("Enviando texto limpo para o Spacy...")
    entities = await spacy_api_client.extract_entities(cleaned_text)

    # 4. Estatísticas
    print("Calculando estatísticas...")
    stats_gen = StatisticsGenerator()
    
    entity_stats = stats_gen.calculate_entity_statistics(entities)
    investment_stats = stats_gen.extract_investment_statistics(gazette_data["gazettes"])
    
    # Unir resultados
    final_statistics = {**entity_stats, **investment_stats}
    
    # Montar objeto final
    final_result = {
        "meta": {
            "source_territory": territory_id,
            "period": f"{since} a {until}",
            "search_keywords": keywords or "padrão",
            "generated_at": datetime.now().isoformat()
        },
        "data": final_statistics
    }
    # 5. Análise Qualitativa (IA Generativa)
    qualitative_analysis = {}
    if final_statistics.get("total_invested", 0) > 0:
        print("Investimento detectado! Acionando Agente de IA (Gemini)...")
        qualitative_analysis = await gemini_client.analyze_investment_context(cleaned_text) # ou full_raw_text
    
    # --- O PULO DO GATO: Montar o objeto FINAL incluindo a IA ---
    final_result = {
        "meta": {
            "source_territory": territory_id,
            "period": f"{since} a {until}",
            "search_keywords": str(keywords) if keywords else "padrão",
            "generated_at": datetime.now().isoformat()
        },
        "data": {
            **final_statistics,
            "qualitative_analysis": qualitative_analysis # <--- GARANTA QUE ISSO ESTÁ AQUI
        }
    }

    # --- PASSO 6: PERSISTÊNCIA ---
    save_results(final_result)
    
    print("Pipeline finalizado.")
    return final_result