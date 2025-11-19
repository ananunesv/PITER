# backend/services/api/clients/spacy_api_client.py
import spacy
from typing import List, Dict, Any

# Carrega o modelo de português (instalado no Passo 1)
# Isso pode levar alguns segundos na primeira vez que a API for chamada
try:
    nlp = spacy.load("pt_core_news_sm")
except IOError:
    print("="*50)
    print("ERRO: Modelo 'pt_core_news_sm' do Spacy não encontrado.")
    print("Execute: python3 -m spacy download pt_core_news_sm")
    print("="*50)
    nlp = None

async def extract_entities(text: str) -> List[Dict[str, str]]:
    """
    Processa o texto localmente usando o Spacy e extrai entidades (NER).
    """
    if not nlp:
        print("Spacy não foi carregado. Retornando 0 entidades.")
        return []

    # Limita o texto para 1 milhão de chars (limite padrão do Spacy)
    # Textos muito longos podem estourar a memória
    if len(text) > 1000000:
        print(f"Texto truncado para 1M de caracteres (tinha {len(text)})")
        text = text[:1000000]

    print("Processando texto com Spacy localmente...")
    
    try:
        # Processa o documento
        doc = nlp(text)
        
        # Extrai as entidades
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        
        print(f"Spacy (local): Extraídas {len(entities)} entidades.")
        return entities
            
    except Exception as e:
        import traceback
        print(f"Erro inesperado ao processar com Spacy local: {e}")
        traceback.print_exc()
        return []

# Mantenha a classe SpacyApiClient se você a usa em outro lugar,
# mas a função acima é o que o 'run_analysis_pipeline' está usando.
class SpacyApiClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    # ... (resto da classe) ...