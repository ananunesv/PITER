from typing import Dict, List
from ..clients.querido_diario_client import QueridoDiarioClient
from ...processing.statistics_generator import StatisticsGenerator

class RankingService:
    def __init__(self):
        self.qd_client = QueridoDiarioClient()
        self.stats_generator = StatisticsGenerator()

    async def get_state_municipalities_ranking(self, state_code: str, territory_ids: List[str], start_date: str, end_date: str, keywords: List[str]) -> Dict:
        """
        Obtém e compara os dados de diferentes municípios de um estado.
        
        Args:
            state_code (str): Código UF do estado (ex: SP, RJ, MG)
            territory_ids (List[str]): Lista de IDs dos territórios (municípios) para comparar
            start_date (str): Data inicial no formato YYYY-MM-DD
            end_date (str): Data final no formato YYYY-MM-DD
            keywords (List[str]): Lista de palavras-chave para busca
            
        Returns:
            Dict: Dicionário com estatísticas comparativas dos municípios
        """
        results = {}
        
        # Busca dados para cada município
        for territory_id in territory_ids:
            gazette_data = await self.qd_client.search_gazettes(
                territory_id=territory_id,
                start_date=start_date,
                end_date=end_date,
                keywords=keywords
            )
            
            # Processa os dados do município
            if gazette_data:
                municipality_stats = self.stats_generator.generate_statistics(gazette_data)
                results[territory_id] = {
                    "total_gazettes": len(gazette_data),
                    "statistics": municipality_stats,
                }
        
        # Calcula métricas comparativas
        if results:
            # Ordena municípios por número de publicações
            sorted_municipalities = sorted(
                results.items(),
                key=lambda x: x[1]["total_gazettes"],
                reverse=True
            )
            
            # Calcula médias e rankings
            total_municipalities = len(results)
            state_ranking = {
                "municipalities": results,
                "rankings": {
                    "by_publications": [
                        {
                            "territory_id": mun[0],
                            "total": mun[1]["total_gazettes"],
                            "rank": idx + 1
                        }
                        for idx, mun in enumerate(sorted_municipalities)
                    ],
                    "total_municipalities": total_municipalities,
                }
            }
            
            return state_ranking
        
        return {"municipalities": {}, "rankings": {"by_publications": [], "total_municipalities": 0}}