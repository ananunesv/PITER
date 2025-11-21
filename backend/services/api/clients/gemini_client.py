# backend/services/api/clients/gemini_client.py
import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv
import re

# Carrega as variáveis do arquivo .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    print("⚠️ AVISO: GEMINI_API_KEY não encontrada no .env")

def get_best_gemini_model():
    """
    Busca dinamicamente o melhor/mais recente modelo 'Flash' disponível na conta.
    Se falhar, retorna um fallback seguro.
    """
    try:
        # Lista todos os modelos disponíveis
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                # Filtra apenas modelos da família Gemini
                if 'gemini' in m.name.lower():
                    available_models.append(m.name)
        
        # 1. Preferência: Versões Flash mais novas (2.5, 2.0, 1.5...)
        # A lógica aqui procura strings como 'gemini-2.5-flash', 'gemini-1.5-flash'
        # e tenta ordenar para pegar a maior versão.
        flash_models = [m for m in available_models if 'flash' in m.lower() and 'legacy' not in m.lower()]
        
        if flash_models:
            # Ordena reverso para tentar pegar 2.5 antes de 1.5, etc.
            # (Uma ordenação alfabética simples geralmente funciona bem para versões: 2.5 > 1.5)
            flash_models.sort(reverse=True)
            
            # Tenta pegar o primeiro que não seja 'experimental' ou 'preview' se possível,
            # mas se só tiver preview (comum em lançamentos novos), pega ele mesmo.
            chosen_model = flash_models[0]
            print(f"🤖 Modelo de IA selecionado automaticamente: {chosen_model}")
            return genai.GenerativeModel(chosen_model)

        # 2. Fallback: Se não achar Flash, pega qualquer Gemini Pro
        pro_models = [m for m in available_models if 'pro' in m.lower()]
        if pro_models:
            pro_models.sort(reverse=True)
            print(f"⚠️ Flash não encontrado. Usando Pro: {pro_models[0]}")
            return genai.GenerativeModel(pro_models[0])

    except Exception as e:
        print(f"⚠️ Erro ao listar modelos ({e}). Usando fallback fixo.")

    # 3. Último recurso: Se a listagem falhar (erro de rede, etc), usa um fixo que sabemos que existe hoje.
    return genai.GenerativeModel('gemini-2.5-flash')


async def analyze_investment_context(text: str) -> Dict[str, Any]:
    """
    Usa o Gemini para fazer uma análise qualitativa do texto do diário.
    """
    if not api_key:
        return {"error": "API Key não configurada"}
    
    if not text or len(text) < 50:
        return {"analysis": "Texto insuficiente para análise."}

    # --- MUDANÇA AQUI: Usa a função dinâmica em vez de nome fixo ---
    model = get_best_gemini_model()
    # --------------------------------------------------------------

    prompt = f"""
    Você é um especialista em análise de licitações públicas e tecnologia educacional.
    Analise o seguinte trecho de um Diário Oficial e extraia informações sobre investimentos.
    
    TEXTO:
    "{text[:30000]}"
    
    TAREFA:
    Responda estritamente no formato JSON com os seguintes campos:
    - "resumo_objeto": O que está sendo comprado? (Máx 1 frase)
    - "justificativa": Qual o motivo ou destino da compra? (Ex: "Para escolas rurais", "Modernização de laboratórios")
    - "fornecedor": Nome da empresa vencedora (se houver).
    - "marca_modelo": Há menção de marca/modelo específico? (Sim/Não e qual).
    
    Se não encontrar alguma informação, preencha com "Não identificado".
    Não use markdown (sem ```json), retorne apenas o JSON puro.
    """

    try:
        response = model.generate_content(prompt)
        result_text = response.text.replace("```json", "").replace("```", "").strip()
        
        import json
        try:
            return json.loads(result_text)
        except json.JSONDecodeError:
            return {"raw_analysis": result_text}

    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        return {"error": f"Falha na análise qualitativa: {str(e)}"}