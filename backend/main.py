from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn

# Imports dos serviços
from services.integration.piter_api_orchestrator import PiterApiOrchestrator, run_analysis_pipeline
from services.api.clients.querido_diario_client import FilterParams
from services.api.ranking import ranking_router

app = FastAPI(
    title="P.I.T.E.R API",
    description="Plataforma de Integração e Transparência em Educação e Recursos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PiterApiOrchestrator()

# Registrar routers
app.include_router(ranking_router)

@app.get("/")
async def read_root():
    return {"project": "P.I.T.E.R", "status": "Online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/api/v1/gazettes")
async def get_gazettes(
    territory_ids: str = Query(..., description="Código IBGE do município"),
    published_since: str = Query(None, description="Data inicial"),
    published_until: str = Query(None, description="Data final"),
    querystring: str = Query(None, description="Palavra-chave"),
    size: int = Query(5, description="Quantidade"),
):
    try:
        filters = FilterParams(
            territory_ids=territory_ids,
            published_since=published_since,
            published_until=published_until,
            querystring=querystring,
            size=size
        )
        return await orchestrator.get_enriched_gazette_data(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analyze", response_model=Dict[str, Any])
async def analyze_gazettes(
    territory_id: str = "5300108",
    since: str = "2024-01-01",
    until: str = "2024-01-05",
    # --- CORREÇÃO AQUI: Usamos Query(None) explicitamente ---
    keywords: str = Query(None, description="Palavra-chave para filtro")
):
    """
    Dispara o pipeline de automação de IA.
    """
    # Garante que keywords seja None se não for passado (evita Ellipsis)
    kw_value = keywords if keywords and keywords is not ... else None
    
    return await run_analysis_pipeline(
        territory_id=territory_id,
        since=since,
        until=until,
        keywords=kw_value
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
