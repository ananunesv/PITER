print("Carregando main...")
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.integration.piter_api_orchestrator import PiterApiOrchestrator
from services.api.clients.querido_diario_client import FilterParams
from services.integration.piter_api_orchestrator import run_analysis_pipeline
from typing import Dict, Any
import uvicorn


app = FastAPI(
    title="P.I.T.E.R API",
    description="Plataforma de Integração e Transparência em Educação e Recursos",
    version="1.0.0"
)

# CORS para permitir frontend separado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PiterApiOrchestrator()

@app.get("/")
async def read_root():
    return {
        "project": "P.I.T.E.R",
        "status": "Online",
        "description": "API para consulta de diários oficiais municipais"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/api/v1/gazettes")
async def get_gazettes(
    territory_ids: str = Query(..., description="Código IBGE do município"),
    published_since: str = Query(None, description="Data inicial (YYYY-MM-DD)"),
    published_until: str = Query(None, description="Data final (YYYY-MM-DD)"),
    querystring: str = Query(None, description="Palavra-chave para busca"),
    size: int = Query(5, description="Quantidade de resultados", ge=1, le=100),
):
    """
    Endpoint principal para buscar e enriquecer diários oficiais.
    Retorna dados do Querido Diário com possível análise NLP.
    """
    try:
        filters = FilterParams(
            territory_ids=territory_ids,
            published_since=published_since,
            published_until=published_until,
            querystring=querystring,
            size=size
        )

        enriched_gazettes = await orchestrator.get_enriched_gazette_data(filters)
        return enriched_gazettes

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
@app.get("/analyze", response_model=Dict[str, Any])
async def analyze_gazettes(
    territory_id: str = "5300108",  # Ex: Brasília (DF)
    since: str = "2024-01-01",      # Data de início
    until: str = "2024-01-05"       # Data de fim
):
    """
    Dispara o pipeline de automação de IA para filtrar dados e criar estatísticas.
    """
    # 1. Chama o orquestrador (Tópico 1)
    # O FastAPI vai "esperar" (await) o pipeline terminar
    analysis_results = await run_analysis_pipeline(
        territory_id=territory_id,
        since=since,
        until=until
    )
    
    # 2. Retorna os resultados como JSON
    return analysis_results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)