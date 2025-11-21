# backend/check_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Erro: GEMINI_API_KEY não encontrada no .env")
    exit()

genai.configure(api_key=api_key)

print("🔍 Buscando modelos disponíveis...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Modelo disponível: {m.name}")
except Exception as e:
    print(f"❌ Erro ao listar modelos: {e}")