import httpx
from typing import List, Dict, Any

SPACY_API_URL = "http://127.0.0.1:8080/ent"

async def extract_entities(text: str) -> List[Dict[str, str]]:
    """
    Envia um texto para a API do Spacy e extrai entidades (NER).
    """
    # Se você não tem uma API Spacy, você pode rodar o Spacy aqui:
    # import spacy
    # nlp = spacy.load("pt_core_news_sm")
    # doc = nlp(text)
    # return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(SPACY_API_URL, data=text.encode('utf-8'))
            response.raise_for_status()
            
            entities = response.json().get("ents", [])
            print(f"Spacy: Extraídas {len(entities)} entidades.")
            return entities
            
    except httpx.RequestError as e:
        print(f"Erro ao conectar com a API do Spacy: {e}")
        # Retorna uma lista vazia em caso de falha
        return []

class SpacyApiClient:
    def __init__(self, base_url):
        self.base_url = base_url

    def analyze_text(self, text: str):
        response = httpx.post(f"{self.base_url}/analyze", json={"text": text})
        response.raise_for_status()
        return response.json()