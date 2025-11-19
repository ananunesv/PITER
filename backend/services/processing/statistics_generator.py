# backend/services/processing/statistics_generator.py
import re
from typing import List, Dict, Any

try:
    import pandas as pd
except Exception:
    pd = None

# --- MAPEAMENTO DE OURO: RADAR DE TECNOLOGIA EDUCACIONAL ---
# Estas são as palavras-chave que categorizam o investimento.
CATEGORY_MAP = {
    "Hardware & Equipamentos": [
        "computador", "computadores", "notebook", "notebooks", "laptop", 
        "tablet", "tablets", "chromebook", "desktop", "impressora", 
        "projetor", "datashow", "lousa digital", "monitor", "tela interativa",
        "nobreak", "estabilizador", "servidor", "laboratório de informática"
    ],
    "Conectividade & Rede": [
        "internet", "wi-fi", "wifi", "banda larga", "fibra óptica", 
        "link de dados", "roteador", "switch", "cabeamento", "rede lógica", 
        "acesso à internet", "ponto de acesso", "access point"
    ],
    "Software & Licenças": [
        "licença de software", "sistema de gestão", "aplicativo", "app", 
        "plataforma digital", "ambiente virtual", "ava", "google workspace", 
        "microsoft office", "antivírus", "sistema acadêmico", "software educativo",
        "jogos digitais", "gamificação"
    ],
    "Infraestrutura Tecnológica": [
        "ar condicionado", "refrigeração", "climatização", # <-- Adicionado
        "instalação elétrica", "adequação de sala", "cabeamento",
        "segurança eletrônica", "cftv", "câmeras", "monitoramento" # <-- Adicionado
    ],
    "Robótica & Cultura Maker": [
        "robótica", "kit de robótica", "arduino", "lego education", "cultura maker", 
        "impressora 3d", "filamento", "cortadora a laser", "programação", 
        "componentes eletrônicos", "scratch", "micro:bit"
    ],
    "Infraestrutura Tecnológica": [
        "ar condicionado para laboratório", "instalação elétrica", "adequação de sala",
        "segurança da informação", "suporte técnico", "manutenção de computadores",
        "formação tecnológica", "capacitação em tecnologia"
    ]
}

class StatisticsGenerator:
    """
    Gerador de estatísticas focado em Tecnologia Educacional.
    """

    def __init__(self):
        pass

    def generate_statistics(self, gazette_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if isinstance(gazette_data, dict) and 'gazettes' in gazette_data:
            gazettes_list = gazette_data.get('gazettes') or []
        else:
            gazettes_list = gazette_data or []

        if not gazettes_list:
            return self._get_empty_stats()

        # Metadados básicos
        df = pd.DataFrame(gazettes_list) if pd is not None else None
        stats = {
            "total_gazettes": len(gazettes_list),
            "date_range": {
                "start": (df['date'].min() if df is not None and 'date' in df.columns else None),
                "end": (df['date'].max() if df is not None and 'date' in df.columns else None)
            }
        }

        # 1. Estatísticas de Entidades (NLP do Spacy)
        entities_stats = self.calculate_entity_statistics(self._extract_entities(gazettes_list))
        stats.update(entities_stats)

        # 2. Estatísticas Financeiras (Foco em EdTech)
        investment_stats = self.extract_investment_statistics(gazettes_list)
        stats.update(investment_stats)

        return stats

    def extract_investment_statistics(self, gazettes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extrai valores monetários e categoriza em áreas de tecnologia educacional.
        """
        total_invested = 0.0
        category_totals = {cat: 0.0 for cat in CATEGORY_MAP.keys()}
        category_totals["Outros (Não categorizado)"] = 0.0

        # Regex para capturar valores monetários (R$ 1.000,00 ou 1.000,00)
        money_re = re.compile(r"(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})")

        for gazette in gazettes:
            text_content = ""
            # Prioriza excerpts (onde a busca encontrou os termos)
            if "excerpts" in gazette and gazette["excerpts"]:
                if isinstance(gazette["excerpts"], list):
                    text_content = "\n".join([str(e) for e in gazette["excerpts"] if e])
                else:
                    text_content = str(gazette["excerpts"])
            elif "excerpt" in gazette:
                 text_content = str(gazette["excerpt"])
            
            if not text_content:
                continue

            matches = money_re.finditer(text_content)
            
            for match in matches:
                value_str = match.group(1)
                
                # Limpeza do valor
                try:
                    clean_value = float(value_str.replace('.', '').replace(',', '.'))
                except ValueError:
                    continue

                # Filtro de valor: Ignora valores irrisórios (< 100) ou astronômicos (> 50 milhões)
                # Isso ajuda a filtrar erros de leitura ou valores irrelevantes.
                if clean_value < 100 or clean_value > 50000000: 
                    continue

                # --- Categorização ---
                # Pega 200 caracteres antes e depois do valor para contexto
                start_index = match.start()
                end_index = match.end()
                context_window = text_content[max(0, start_index - 200) : min(len(text_content), end_index + 200)].lower()
                
                found_category = "Outros (Não categorizado)"
                
                for category, keywords in CATEGORY_MAP.items():
                    for keyword in keywords:
                        if keyword in context_window:
                            found_category = category
                            break 
                    if found_category != "Outros (Não categorizado)":
                        break

                # Só somamos ao total se foi categorizado em Tecnologia OU se quisermos rastrear tudo
                # Aqui, somamos tudo, mas você verá claramente o que é Tech e o que é resto.
                total_invested += clean_value
                category_totals[found_category] += clean_value

        # Formatação final
        total_invested = round(total_invested, 2)
        category_totals = {k: round(v, 2) for k, v in category_totals.items() if v > 0}
        sorted_categories = dict(sorted(category_totals.items(), key=lambda item: item[1], reverse=True))

        return {
            "total_invested": total_invested,
            "investments_by_category": sorted_categories
        }

    def calculate_entity_statistics(self, entities: List[Dict[str, str]]) -> Dict[str, Any]:
        if not entities:
            return {"entity_counts_by_type": {}, "top_entities": {}, "total_entities": 0}

        if pd is not None:
            df = pd.DataFrame(entities)
            # Conta tipos (ORG, LOC, PER)
            counts = df['label'].value_counts().to_dict() if 'label' in df.columns else {}
            # Conta entidades mais frequentes (Ex: "Secretaria de Educação")
            top = df['text'].value_counts().head(10).to_dict() if 'text' in df.columns else {}
        else:
            counts = {}
            top = {}

        return {
            "entity_counts_by_type": counts,
            "top_entities": top,
            "total_entities": sum(counts.values())
        }
    
    def _extract_entities(self, gazette_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        all_entities = []
        for gazette in gazette_data:
            # Tenta pegar entidades pré-processadas se houver, ou ignora se não
            # (O processamento real do Spacy acontece no Orchestrator antes de chamar isso)
            pass 
        return all_entities # Placeholder, pois o orchestrator passa as entidades separadamente

    def _get_empty_stats(self):
        return {
            "total_gazettes": 0,
            "total_invested": 0.0,
            "investments_by_category": {},
            "entity_counts_by_type": {},
            "top_entities": {}
        }