# backend/tests/processing/test_data_cleaner.py
import pytest

# Importa a função que queremos testar
# (Como rodamos pytest da pasta 'backend', o import começa em 'services')
try:
    from services.processing.data_cleaner import clean_text_for_ia
except ImportError:
    print("\nErro: Não foi possível importar 'clean_text_for_ia' de 'services.processing.data_cleaner'.")
    print("Certifique-se que você está rodando pytest da pasta 'backend'.")
    # Tenta um import alternativo (caso o path esteja diferente)
    from backend.services.processing.data_cleaner import clean_text_for_ia


# --- Testes Unitários para a função clean_text_for_ia ---

def test_clean_text_removes_html():
    """Testa se as tags HTML são removidas."""
    raw_text = "<html><p>Olá <b>mundo</b>!</p></html>"
    # A função substitui HTML por espaço, depois comprime os espaços
    expected = "Olá mundo !"
    assert clean_text_for_ia(raw_text) == expected

def test_clean_text_normalizes_whitespace():
    """Testa se múltiplos espaços, quebras de linha e tabs são normalizados."""
    raw_text = "Texto    com \n muitos \t espaços."
    expected = "Texto com muitos espaços."
    assert clean_text_for_ia(raw_text) == expected

def test_clean_text_empty_string():
    """Testa se uma string vazia retorna uma string vazia."""
    raw_text = ""
    expected = ""
    assert clean_text_for_ia(raw_text) == expected

def test_clean_text_none_input():
    """Testa se a entrada None retorna uma string vazia (coberto pelo 'if not text')."""
    raw_text = None
    expected = ""
    assert clean_text_for_ia(raw_text) == expected

def test_clean_text_truncation():
    """Testa se o texto é truncado no limite (10000 caracteres)."""
    long_text = "a" * 10001
    expected = "a" * 10000
    
    cleaned = clean_text_for_ia(long_text)
    assert len(cleaned) == 10000
    assert cleaned == expected

def test_clean_text_no_changes_needed():
    """Testa se um texto já limpo permanece igual."""
    raw_text = "Este é um texto limpo e normal."
    expected = "Este é um texto limpo e normal."
    assert clean_text_for_ia(raw_text) == expected