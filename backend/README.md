# Backend - Projeto P.I.T.E.R

**P**rocurador de **I**nvestimentos em **T**ecnologia em **E**ducação **R**egional

Guia de configuração, arquitetura e execução do ambiente de desenvolvimento local para a equipe.

- **Disciplina:** `MDS, Engenharia de Software`
- **Professora/Orientadora:** `Carla`
- **Instituição:** UnB - Universidade de Brasília

---

##  Índice

- [Tecnologias](#️-tecnologias)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Pipeline de Dados](#-pipeline-de-dados)
- [Como Rodar o Projeto](#-como-rodar-o-projeto-localmente)
- [Endpoints da API](#️-endpoints-principais)
- [Histórico de Mudanças](#-histórico-de-mudanças)
- [Testes](#-testes)
- [Referências](#-referência)

---

##  Tecnologias

- **Linguagem:** Python 3.12
- **Framework Web:** FastAPI
- **Validação de Dados:** Pydantic
- **Servidor ASGI:** Uvicorn
- **Cliente HTTP:** HTTPX (async)
- **Análise de Dados:** Pandas
- **NLP:** spaCy (modelo `pt_core_news_sm`)
- **Testes:** Pytest, Pytest-Mock
- **Qualidade de Código:** Pre-commit, Black, Ruff

> AVISO: **Requisito:** Python **3.12** (spaCy não é compatível com Python 3.13+)

---

##  Arquitetura do Sistema

O backend segue uma **arquitetura em camadas** baseada no padrão **P.I.T.E.R** (inspirado em Clean Architecture):

```
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO                  │
│                      (FastAPI Routes)                       │
│                         main.py                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INTEGRAÇÃO                     │
│               (services/integration/)                       │
│          PiterApiOrchestrator + run_analysis_pipeline       │
│          • Orquestra chamadas entre serviços                │
│          • Coordena pipeline completo de análise            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│   CAMADA DE CLIENTES API   │  │  CAMADA DE PROCESSAMENTO │
│    (services/api/clients)  │  │   (services/processing)  │
│                            │  │                          │
│ • QueridoDiarioClient      │  │ • data_cleaner           │
│ • spacy_api_client         │  │ • statistics_generator   │
│                            │  │                          │
│ Integração com APIs        │  │ Limpeza e análise        │
│ externas                   │  │ de texto                 │
└────────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────────┐
                    │   CAMADA DE DADOS   │
                    │  (APIs Externas)    │
                    │                     │
                    │ • Querido Diário    │
                    │ • spaCy API         │
                    └─────────────────────┘
```

### Princípios Arquiteturais

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade única e bem definida
2. **Inversão de Dependências**: Camadas superiores não dependem de implementações de camadas inferiores
3. **Orquestração Centralizada**: `PiterApiOrchestrator` coordena a comunicação entre serviços
4. **Processamento Assíncrono**: Uso extensivo de `async/await` para melhor performance
5. **Validação de Dados**: Pydantic garante integridade dos dados em todas as camadas

---

##  Estrutura de Diretórios

```
backend/
├── main.py                          # Ponto de entrada da aplicação FastAPI
├── requirements.txt                 # Dependências do projeto
├── .env.example                     # Exemplo de variáveis de ambiente
│
├── services/                        # Lógica de negócio e serviços
│   │
│   ├── integration/                 #  CAMADA DE INTEGRAÇÃO
│   │   ├── __init__.py
│   │   └── piter_api_orchestrator.py
│   │       ├── PiterApiOrchestrator (classe)
│   │       │   └── get_enriched_gazette_data()
│   │       └── run_analysis_pipeline() (função)
│   │           • Pipeline completo: Coleta → Limpeza → IA → Estatísticas
│   │
│   ├── api/                         #  CAMADA DE API
│   │   ├── clients/                 # Clientes para APIs externas
│   │   │   ├── __init__.py
│   │   │   ├── querido_diario_client.py
│   │   │   │   ├── fetch_gazettes()          # Busca diários (com keywords!)
│   │   │   │   └── QueridoDiarioClient
│   │   │   │       ├── fetch_gazettes()
│   │   │   │       └── search_gazettes()     # Wrapper com keywords
│   │   │   └── spacy_api_client.py
│   │   │       └── extract_entities()        # Extração NER
│   │   │
│   │   └── ranking/                 # Sistema de ranking
│   │       ├── __init__.py
│   │       ├── routes.py            # POST /api/v1/ranking/state
│   │       └── ranking_service.py
│   │           └── get_state_municipalities_ranking()
│   │
│   └── processing/                  #  CAMADA DE PROCESSAMENTO
│       ├── __init__.py
│       ├── data_cleaner.py
│       │   ├── clean_text_for_ia()          # Limpeza básica
│       │   └── pre_filter_spacy_input()     # Pré-filtragem avançada
│       └── statistics_generator.py
│           └── StatisticsGenerator
│               ├── calculate_entity_statistics()
│               └── generate_statistics()
│
└── tests/                           # Testes automatizados
    ├── __init__.py
    ├── test_main_api.py
    ├── processing/
    │   ├── test_data_cleaner.py
    │   └── test_statistics_generator.py
    └── conftest.py
```

---

##  Pipeline de Dados

### 1. **Pipeline de Busca Simples** (`/api/v1/gazettes`)

```
1. Requisição HTTP (FastAPI)
   ↓
2. PiterApiOrchestrator.get_enriched_gazette_data()
   ↓
3. QueridoDiarioClient.fetch_gazettes()
   • Aplica keywords para filtrar resultados
   • Faz requisição à API do Querido Diário
   ↓
4. Retorna JSON com diários oficiais
```

### 2. **Pipeline de Análise Completa** (`/analyze`)

```
1. Requisição HTTP (FastAPI)
   ↓
2. run_analysis_pipeline()
   ↓
3. COLETA: querido_diario_client.fetch_gazettes()
   • Busca 50 diários do período especificado
   ↓
4. AGREGAÇÃO: Loop por todos os diários + excerpts
   • Junta todos os segmentos de texto
   ↓
5. LIMPEZA: data_cleaner.pre_filter_spacy_input()
   • Remove ruído, normaliza texto
   ↓
6. PROCESSAMENTO IA: spacy_api_client.extract_entities()
   • Extração de entidades nomeadas (NER)
   ↓
7. ESTATÍSTICAS: StatisticsGenerator.calculate_entity_statistics()
   • Calcula métricas, frequências, top entities
   ↓
8. Retorna JSON com análise completa
```

### 3. **Pipeline de Ranking** (`/api/v1/ranking/state`)

```
1. Requisição HTTP POST (FastAPI)
   • Body: {state_code, territory_ids[], start_date, end_date, keywords[]}
   ↓
2. RankingService.get_state_municipalities_ranking()
   ↓
3. Loop para cada território:
   │
   ├─► QueridoDiarioClient.search_gazettes()
   │   • Passa keywords para filtrar por categoria
   │   ↓
   │   fetch_gazettes(territory_id, dates, keywords)
   │   • API do Querido Diário retorna diários filtrados
   │   ↓
   └─► StatisticsGenerator.generate_statistics()
       • Calcula investimentos e categorias
   ↓
4. Ordena municípios por:
   • Total de publicações
   • Total investido
   ↓
5. Retorna JSON com ranking completo
```

---

##  Como Rodar o Projeto Localmente

### 1️⃣ Pré-requisitos

Garanta que você tenha o básico instalado:

- Windows, macOS ou Linux (no Windows, PowerShell recomendado)
- [Git](https://git-scm.com)
- [Python 3.12](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/)

---

### 2️⃣ Instalação

```bash
# Clone o projeto e entre na pasta principal
git clone https://github.com/unb-mds/Projeto-P.I.T.E.R.git
cd Projeto-P.I.T.E.R

# (Opcional) Troque para a branch de desenvolvimento
git checkout enviodadosapi

# Crie e ative o ambiente virtual (na raiz do projeto)
py -3.12 -m venv venv

# Ativar no Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Ativar no Linux/Mac:
# source venv/bin/activate

# Instale as dependências
pip install --upgrade pip
pip install -r backend/requirements.txt

# Baixe o modelo do spaCy (pt-BR)
python -m spacy download pt_core_news_sm
```

### 3️⃣ Configuração de Ambiente

Se necessário, crie o arquivo `.env` dentro da pasta `backend/`:

```bash
# backend/.env
SPACY_API_URL=http://localhost:8001  # (opcional, se usar spaCy API externa)
```

### 4️⃣ Execução do Servidor

**IMPORTANTE:** Rodar sempre a partir da **raiz do projeto**, não do diretório `backend/`.

```bash
# Defina o caminho do backend (somente no Windows PowerShell)
$env:PYTHONPATH = "$PWD"

# Inicie o servidor
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse a documentação interativa em:
 **http://127.0.0.1:8000/docs** (Swagger UI)
 **http://127.0.0.1:8000/redoc** (ReDoc)

---

##  Endpoints Principais

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `GET` | `/` | Status geral da API |  |
| `GET` | `/health` | Healthcheck básico |  |
| `GET` | `/api/v1/gazettes` | Consulta diários oficiais filtrados |  |
| `GET` | `/analyze` | Pipeline completo de IA (NLP + estatísticas) |  |
| `POST` | `/api/v1/ranking/state` | Ranking de municípios por investimento |  |

### Exemplos de Uso

#### 1. Buscar Diários Oficiais

```bash
GET http://127.0.0.1:8000/api/v1/gazettes?territory_ids=5208707&published_since=2024-02-19&published_until=2024-03-11&querystring=robótica&size=10
```

#### 2. Executar Pipeline de Análise

```bash
GET http://127.0.0.1:8000/analyze?territory_id=5208707&since=2024-01-01&until=2024-01-31
```

#### 3. Obter Ranking de Municípios

```bash
POST http://127.0.0.1:8000/api/v1/ranking/state
Content-Type: application/json

{
  "state_code": "52",
  "territory_ids": ["5208707", "5201405"],
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "keywords": ["robótica"]
}
```

---

##  Histórico de Mudanças

### v1.2.0 - Novembro 2025 (Ana)

####  **Implementação de Suporte a Keywords**

**Problema Identificado:**
- Frontend enviava keywords para filtrar buscas por categoria (robótica/software)
- Backend IGNORAVA completamente essas keywords
- Resultado: 7000+ diários irrelevantes retornados

**Mudanças Implementadas:**

1. **`querido_diario_client.py`** (linhas 10-31, 142-156)
   -  Modificado `fetch_gazettes()` para aceitar parâmetro `keywords` opcional
   -  Implementado conversão de lista de keywords para querystring
   -  Atualizado `search_gazettes()` para passar keywords ao invés de ignorá-las

2. **Otimização de Keywords no Frontend**
   -  Simplificado de termos compostos (`"robótica educacional"`) para termos simples (`"robótica"`)
   -  Resultado: Redução de **99.4%** no ruído (3624 → 21 diários para robótica)

**Impacto:**
-  Precisão dos resultados aumentada drasticamente
-  Redução de 83-99% no ruído de dados
-  Pipeline completa funcionando end-to-end

**Arquivos Modificados:**
```
backend/services/api/clients/querido_diario_client.py
frontend/hooks/useRanking.ts
frontend/hooks/useGazetteSearch.ts
frontend/components/organisms/ranking/SearchRanking.tsx
```

**Desenvolvido por:** Ana

---

### v1.1.0 - Novembro 2025 (Gulia, Morais, Rodrigo)

####  **Implementação Inicial do Sistema de Ranking**

**Funcionalidades Implementadas:**

1. **Sistema de Ranking de Municípios**
   -  Criado endpoint `POST /api/v1/ranking/state`
   -  Implementado `RankingService` para comparação entre territórios
   -  Rankings por publicações e por investimento total

2. **Integração com Querido Diário**
   -  `QueridoDiarioClient` para buscar diários oficiais
   -  Suporte a filtros de data e território
   -  Tratamento de erros HTTP e timeout

3. **Geração de Estatísticas**
   -  `StatisticsGenerator` para análise de entidades e valores
   -  Cálculo de investimentos totais
   -  Categorização de gastos

4. **Pipeline de Análise com IA**
   -  Função `run_analysis_pipeline()` para processamento completo
   -  Integração com spaCy para NLP
   -  Limpeza e pré-filtragem de texto

**Arquivos Criados:**
```
services/api/ranking/routes.py
services/api/ranking/ranking_service.py
services/api/clients/querido_diario_client.py
services/processing/statistics_generator.py
services/integration/piter_api_orchestrator.py
```

**Desenvolvido por:** Gulia, Morais, Rodrigo

---

### v1.0.0 - Outubro 2025 (Equipe)

####  **Implementação Inicial do Backend**

-  Estrutura base do projeto FastAPI
-  Configuração de ambiente Python 3.12
-  Integração com spaCy
-  Sistema de testes com Pytest
-  Configuração de qualidade de código (pre-commit, black, ruff)
-  Documentação inicial

**Desenvolvido por:** Equipe P.I.T.E.R

---

##  Testes

O projeto usa `pytest` para testes unitários e de integração.

### Executar Todos os Testes

```bash
# Na raiz do projeto, com o venv ativo
pytest -s -v
```

### Executar Testes Específicos

```bash
# Testes de processamento
pytest backend/tests/processing/ -v

# Teste específico
pytest backend/tests/test_main_api.py::test_health_check -v
```

### Estrutura de Testes

```
backend/tests/
├── test_main_api.py              # Testes dos endpoints principais
├── processing/
│   ├── test_data_cleaner.py      # Testes de limpeza de texto
│   └── test_statistics_generator.py  # Testes de estatísticas
└── conftest.py                   # Fixtures compartilhadas
```

---

##  Qualidade de Código

O repositório utiliza **Pre-commit**, **Black** e **Ruff** para manter a qualidade do código.

### Instalar Hooks

```bash
# Instalar os hooks do pre-commit
pre-commit install
```

### Rodar Manualmente

```bash
# Verificar todos os arquivos
pre-commit run --all-files

# Verificar apenas arquivos modificados
pre-commit run
```

### Ferramentas Configuradas

- **Black:** Formatação automática de código
- **Ruff:** Linter rápido para Python
- **Trailing Whitespace:** Remove espaços em branco desnecessários
- **End of File:** Garante linha vazia no final dos arquivos

---

##  Troubleshooting

### Erro: `ModuleNotFoundError: No module named 'backend'`

**Solução:** Execute o servidor a partir da **raiz do projeto**, não de `backend/`:

```bash
# ERRADO ERRADO
cd backend
python -m uvicorn main:app --reload

#  CORRETO
# (na raiz do projeto)
python -m uvicorn backend.main:app --reload
```

### Erro: `spaCy model not found`

**Solução:** Baixe o modelo do spaCy:

```bash
python -m spacy download pt_core_news_sm
```

### Servidor não aceita requisições do frontend

**Solução:** Verifique se o CORS está configurado corretamente em `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", ...],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

##  Referência

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [spaCy Documentation](https://spacy.io/)
- [Querido Diário API](https://queridodiario.ok.org.br/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Pytest Documentation](https://docs.pytest.org/)

---

##  Contribuidores

- **Ana** - Implementação de keywords e otimização de busca
- **Gulia** - Sistema de ranking e integração com APIs
- **Morais** - Pipeline de análise e processamento de dados
- **Rodrigo** - Estatísticas e geração de métricas
- **Equipe P.I.T.E.R** - Desenvolvimento contínuo

---

##  Licença

Este projeto está sob a licença definida no arquivo LICENSE na raiz do repositório.

---

**Desenvolvido com  pela equipe do Projeto P.I.T.E.R - UnB/FGA**
