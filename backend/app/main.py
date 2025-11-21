from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.integration.piter_api_orchestrator import PiterApiOrchestrator
from services.api.clients.querido_diario_client import FilterParams
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
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

# logger básico (usado neste módulo)
logger = logging.getLogger(__name__)
if not logger.handlers:
    # configura handler simples caso o logger ainda não possua
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# ===== Envio de dados do frontend (Issue #65) =====
class EnvioDadosPayload(BaseModel):
    titulo: str = Field(..., min_length=1)
    descricao: Optional[str] = None
    fonte: Optional[str] = None
    metadados: Optional[Dict[str, Any]] = None  # flexível p/ extras (ex.: sprint, usuário, etc.)


@app.post("/api/v1/enviar-dados", tags=["integração"])
async def enviar_dados(payload: EnvioDadosPayload):
    """
    Recebe dados do frontend (Next.js) e confirma o recebimento.
    Ponto de integração futura com o Orquestrador (persistência, filas, etc).
    """
    try:
        logger.info(
            "POST /api/v1/enviar-dados",
            extra={"titulo": payload.titulo, "fonte": payload.fonte}
        )

        # 👉 Se/quando quiser integrar com o orquestrador:
        # result = await orchestrator.process_submission(payload.model_dump())

        return {
            "status": "accepted",
            "mensagem": "Dados recebidos com sucesso!",
            "dados": payload.model_dump(),
        }
    except Exception as e:
        logger.exception("Erro no /api/v1/enviar-dados")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
# ===== fim Issue #65 =====

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)