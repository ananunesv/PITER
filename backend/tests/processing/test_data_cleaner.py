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
    
try:
    from services.processing.data_cleaner import clean_text_for_ia, pre_filter_spacy_input
except ImportError:
    # Tenta um import alternativo
    from backend.services.processing.data_cleaner import clean_text_for_ia, pre_filter_spacy_input


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
    
    
def test_pre_filter_removes_junk_patterns():
    """Testa se os padrões de "lixo" (cabeçalhos, rodapés, etc.) são removidos."""
    raw_text = """
    Diário Oficial Nº 1234
    Página 5 de 10
    Este é o conteúdo real que deve permanecer.
    Assinado Digitalmente por: Autoridade
    ...linha pontilhada...
    """
    # A função deve remover as linhas de lixo e juntar as válidas
    expected = "Este é o conteúdo real que deve permanecer."
    assert pre_filter_spacy_input(raw_text) == expected

def test_pre_filter_removes_short_lines():
    """Testa se linhas muito curtas (provavelmente ruído) são descartadas."""
    raw_text = """
    Esta é uma linha longa e válida que deve ser mantida.
    OK
    Continua...
    Esta é outra linha longa e válida.
    """
    # A função junta as linhas válidas com um espaço
    expected = "Esta é uma linha longa e válida que deve ser mantida. Esta é outra linha longa e válida."
    assert pre_filter_spacy_input(raw_text) == expected

def test_pre_filter_removes_all_caps_headers():
    """Testa se linhas em maiúsculas (cabeçalhos) são descartadas."""
    raw_text = """
    DECRETO Nº 456
    O PREFEITO MUNICIPAL, no uso de suas atribuições, resolve:
    SECRETARIA DE FINANÇAS
    Art. 1º Fica nomeado o Sr. João da Silva.
    PUBLIQUE-SE
    """
    # "DECRETO Nº 456" e "SECRETARIA DE FINANÇAS" (maiúsculas) são removidos.
    # "PUBLIQUE-SE" (padrão de lixo) é removido.
    # "Art. 1º" (padrão de lixo) é removido da linha.
    expected = "O PREFEITO MUNICIPAL, no uso de suas atribuições, resolve: Fica nomeado o Sr. João da Silva."
    assert pre_filter_spacy_input(raw_text) == expected

def test_pre_filter_handles_html_e_espacos():
    """Testa a limpeza básica de HTML e espaços."""
    raw_text = "<p> Texto    com <b>espaços</b> extras.   </p>"
    expected = "Texto com espaços extras."
    assert pre_filter_spacy_input(raw_text) == expected

def test_pre_filter_pipeline_completo():
    """Testa uma combinação de todas as regras."""
    raw_text = """
    <p><b>DIÁRIO OFICIAL DO MUNICÍPIO</b></p>
    Data: 01/01/2025
    
    Art. 1º Esta é a primeira linha útil.
    
    Linha curta
    
    Esta é a segunda linha útil.
    CPF: 123.456.789-00
    ========
    """
    # "DIÁRIO OFICIAL..." (maiúsculo) -> removido
    # "Data: 01/01/2025" (regex de data no início) -> removido
    # "Art. 1º" (regex) -> removido da linha
    # "Linha curta" (len < 15) -> removida
    # "CPF..." (regex) -> removido
    # "========" (regex) -> removido
    
    expected = "Esta é a primeira linha útil. Esta é a segunda linha útil."
    assert pre_filter_spacy_input(raw_text) == expected