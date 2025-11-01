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

def pre_filter_spacy_input(raw_text: str) -> str:
    """
    Algoritmo de pré-filtragem avançado para limpar texto ANTES de enviar ao Spacy.
    Remove "juncos" comuns de diários oficiais que confundem o NER.
    (Versão Corrigida 3)
    """
    if not raw_text:
        return ""

    # 1. Limpeza básica inicial (HTML)
    text = re.sub(r'<[^>]+>', ' ', raw_text)

    # 2. Padrões de regex
    # Padrões que removem a LINHA INTEIRA se casarem
    full_line_junk_patterns = re.compile(
        r'^(Página \d+ de \d+)$'
        r'|^(Diário Oficial (do Município|Nº)[\s\d\w]+)$'
        r'|^(Assinado Digitalmente (por|via):.*)$'
        r'|^(\d{1,2}[/\.]\d{1,2}[/\.]\d{2,4})$'
        # --- CORREÇÃO 1 (Junk Patterns): ---
        # Remove linhas que COMEÇAM com 3+ pontos/hifens/etc.
        r'|^\s*[\.\-\_=\*]{3,}.*$' 
        r'|^(Publique-se|Cumpra-se|Resolve:)$'
        , re.IGNORECASE
    )

    # Padrões que removem SÓ O PADRÃO (partes da linha)
    partial_junk_patterns = re.compile(
        r'\bArt\. \d+º?'
        r'|\b§ \d+º?'
        r'|\bInciso [IVXLCDM]+\b'
        r'|\d{3}\.\d{3}\.\d{3}-\d{2}'
        r'|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
        r'|\b[A-Fa-f0-9]{20,}\b'
        r'|Data: \d{1,2}[/\.]\d{1,2}[/\.]\d{2,4}'
        # (Removido o removedor parcial de '...' daqui, pois o full_line deve pegar)
        , re.IGNORECASE
    )

    cleaned_lines = []
    for line in text.splitlines():
        # 3. Remove espaços em branco no início/fim
        line = line.strip()

        # 4. Pular linhas que ficaram vazias
        if not line:
            continue

        # 5. Pular linhas que SÃO lixo (linha inteira)
        if full_line_junk_patterns.match(line):
            continue
            
        # 6. Pular linhas que são SÓ MAIÚSCULAS (cabeçalhos)
        if (line.upper() == line) and any(c.isalpha() for c in line) and len(line) < 100:
            continue

        # 7. Remover PARTES de lixo da linha
        line = partial_junk_patterns.sub('', line)
        
        # 8. Limpar espaços de novo
        line = line.strip()

        # --- CORREÇÃO 2 (HTML/Espaços): ---
        # Reduz o filtro de comprimento para não descartar "Texto com"
        if len(line) < 15: # <-- Reduzido de 15 para 5
            continue

        # 10. Se a linha sobreviveu, adicione
        cleaned_lines.append(line)

    # 11. Juntar e finalizar
    final_text = " ".join(cleaned_lines)
    final_text = re.sub(r'\s+', ' ', final_text).strip()
    
    return final_text[:10000]