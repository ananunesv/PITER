from fastapi import APIRouter, HTTPException
from typing import List
from .ranking_service import RankingService
from pydantic import BaseModel

router = APIRouter()
ranking_service = RankingService()

class RankingRequest(BaseModel):
    state_code: str
    territory_ids: List[str]
    start_date: str
    end_date: str
    keywords: List[str]

@router.post("/ranking/state")
async def get_state_ranking(request: RankingRequest):
    """
    Endpoint para obter o ranking de municípios de um estado.
    
    Args:
        request (RankingRequest): Objeto com os parâmetros da requisição
        
    Returns:
        Dict: Ranking e estatísticas dos municípios
    """
    try:
        result = await ranking_service.get_state_municipalities_ranking(
            state_code=request.state_code,
            territory_ids=request.territory_ids,
            start_date=request.start_date,
            end_date=request.end_date,
            keywords=request.keywords
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))