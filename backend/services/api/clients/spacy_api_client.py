# backend/services/api/clients/spacy_api_client.py
import spacy
from typing import List, Dict, Any

# Tenta carregar o modelo
try:
    nlp = spacy.load("pt_core_news_sm")
except IOError:
    print("="*50)
    print("AVISO: Modelo 'pt_core_news_sm' não encontrado.")
    print("Instalando modelo automaticamente...")
    import os
    os.system("python -m spacy download pt_core_news_sm")
    nlp = spacy.load("pt_core_news_sm")
    print("="*50)

async def extract_entities(text: str) -> List[Dict[str, str]]:
    """
    Processa o texto e extrai entidades relevantes (ORG, LOC, PER, MISC).
    """
    if not nlp:
        return []

    # Limite de segurança
    if len(text) > 1000000:
        text = text[:1000000]

    try:
        doc = nlp(text)
        
        entities = []
        for ent in doc.ents:
            # Filtro de qualidade:
            # 1. Ignorar entidades muito curtas (ex: "A", "1")
            # 2. Focar em tipos que nos interessam
            if len(ent.text) > 2 and ent.label_ in ["ORG", "LOC", "PER", "MISC"]:
                entities.append({
                    "text": ent.text.strip(),
                    "label": ent.label_
                })
        
        return entities
            
    except Exception as e:
        print(f"Erro no processamento spaCy: {e}")
        return []

# Classe Wrapper (para compatibilidade com código existente)
class SpacyApiClient:
    def __init__(self, base_url=None):
        pass
        
    async def extract_entities(self, text: str):
        return await extract_entities(text)