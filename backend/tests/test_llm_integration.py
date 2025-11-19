# backend/tests/test_llm_integration.py
import pytest
import os
from services.api.clients import gemini_client

# Este teste só roda se houver uma API KEY configurada, para não falhar no CI/CD sem querer
@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="Requer GEMINI_API_KEY no .env")
@pytest.mark.asyncio
async def test_gemini_simple_analysis():
    """
    Testa se o Gemini consegue receber um texto e devolver o JSON esperado.
    """
    print("\n🤖 Testando conexão com o Gemini...")
    
    # Texto fictício de um diário oficial
    fake_text = """
    EXTRATO DE CONTRATO Nº 10/2024.
    Objeto: Aquisição de 50 notebooks para os laboratórios de informática das escolas municipais.
    Valor Total: R$ 250.000,00.
    Vencedor: Tech Solutions LTDA.
    Justificativa: Modernização tecnológica da rede de ensino fundamental.
    """
    
    # Chama a função do seu cliente
    result = await gemini_client.analyze_investment_context(fake_text)
    
    print(f"Resposta da IA: {result}")
    
    # Verificações
    assert isinstance(result, dict)
    assert "error" not in result
    assert "resumo_objeto" in result
    # A IA deve identificar que são notebooks/computadores
    assert "notebook" in str(result).lower() or "computador" in str(result).lower()
    
    print("✅ Conexão com Gemini bem-sucedida!")