# backend/scripts/run_pipeline_automation.py
import asyncio
import sys
import os

# Adiciona o diretório pai (backend) ao path para conseguir importar os services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.integration.piter_api_orchestrator import run_analysis_pipeline
from datetime import datetime, timedelta

async def main():
    print("🤖 Iniciando automação do P.I.T.E.R...")
    
    # Configuração da Busca (Você pode mudar isso ou ler de variáveis de ambiente)
    territory_id = "5300108" # Brasília (Exemplo)
    
    # Define o período: Últimos 30 dias
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    # Keywords para o Radar (Pode ser uma lista que você itera)
    keywords_list = ["tecnologia educação", "robótica", "computador", "tablet"]
    
    for keyword in keywords_list:
        print(f"\n--- Processando keyword: {keyword} ---")
        result = await run_analysis_pipeline(
            territory_id=territory_id,
            since=str(start_date),
            until=str(end_date),
            keywords=keyword
        )
        
        if "error" in result:
            print(f"⚠️ Aviso: {result['error']}")
        else:
            print(f"✅ Sucesso! Investimento encontrado: R$ {result['data'].get('total_invested', 0)}")

if __name__ == "__main__":
    asyncio.run(main())# backend/scripts/run_pipeline_automation.py
import asyncio
import sys
import os

# Adiciona o diretório pai (backend) ao path para conseguir importar os services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.integration.piter_api_orchestrator import run_analysis_pipeline
from datetime import datetime, timedelta

async def main():
    print("🤖 Iniciando automação do P.I.T.E.R...")
    
    # Configuração da Busca (Você pode mudar isso ou ler de variáveis de ambiente)
    territory_id = "5300108" # Brasília (Exemplo)
    
    # Define o período: Últimos 30 dias
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    # Keywords para o Radar (Pode ser uma lista que você itera)
    keywords_list = ["tecnologia educação", "robótica", "computador", "tablet"]
    
    for keyword in keywords_list:
        print(f"\n--- Processando keyword: {keyword} ---")
        result = await run_analysis_pipeline(
            territory_id=territory_id,
            since=str(start_date),
            until=str(end_date),
            keywords=keyword
        )
        
        if "error" in result:
            print(f"⚠️ Aviso: {result['error']}")
        else:
            print(f"✅ Sucesso! Investimento encontrado: R$ {result['data'].get('total_invested', 0)}")

if __name__ == "__main__":
    asyncio.run(main())