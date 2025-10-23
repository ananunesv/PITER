# backend/services/processing/data_cleaner.py
import re

def clean_text_for_ia(text: str) -> str:
    """
    Limpa o texto antes de enviar para o Spacy.
    """
    if not text:
        return ""
        
    # Remove tags HTML (exemplo simples)
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Remove quebras de linha excessivas
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Limita o texto para 10000 caracteres para a IA não sobrecarregar
    return text[:10000]