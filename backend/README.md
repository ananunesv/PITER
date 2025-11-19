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
- [Testes e Qualidade](#-testes-e-qualidade)
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
│          PiterApiOrchestrator + run\_analysis\_pipeline       │
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
│ • QueridoDiarioClient      │  │ • data\_cleaner           │
│ • spacy\_api\_client         │  │ • statistics\_generator   │
│                            │  │                          │
│ Integração com APIs        │  │ Limpeza e análise        │
│ externas                   │  │ de texto                 │
└────────────────────────────┘  └──────────────────────────┘
│                   │
└─────────┬─────────┘
▼
┌─────────────────────┐
│    CAMADA DE DADOS  │
│   (APIs Externas)   │
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
├── main.py                         \# Ponto de entrada da aplicação FastAPI
├── requirements.txt                \# Dependências do projeto
├── .env.example                    \# Exemplo de variáveis de ambiente
│
├── services/                       \# Lógica de negócio e serviços
│   │
│   ├── integration/                \#  CAMADA DE INTEGRAÇÃO
│   │   ├── **init**.py
│   │   └── piter\_api\_orchestrator.py
│   │       ├── PiterApiOrchestrator (classe)
│   │       │   └── get\_enriched\_gazette\_data()
│   │       └── run\_analysis\_pipeline() (função)
│   │           • Pipeline completo: Coleta → Limpeza → IA → Estatísticas
│   │
│   ├── api/                        \#  CAMADA DE API
│   │   ├── clients/                \# Clientes para APIs externas
│   │   │   ├── **init**.py
│   │   │   ├── querido\_diario\_client.py
│   │   │   │   ├── fetch\_gazettes()          \# Busca diários (com keywords\!)
│   │   │   │   └── QueridoDiarioClient
│   │   │   │       ├── fetch\_gazettes()
│   │   │   │       └── search\_gazettes()     \# Wrapper com keywords
│   │   │   └── spacy\_api\_client.py
│   │   │       └── extract\_entities()        \# Extração NER
│   │   │
│   │   └── ranking/                  \# Sistema de ranking
│   │       ├── **init**.py
│   │       ├── routes.py             \# POST /api/v1/ranking/state
│   │       └── ranking\_service.py
│   │           └── get\_state\_municipalities\_ranking()
│   │
│   └── processing/                  \#  CAMADA DE PROCESSAMENTO
│       ├── **init**.py
│       ├── data\_cleaner.py
│       │   ├── clean\_text\_for\_ia()          \# Limpeza básica
│       │   └── pre\_filter\_spacy\_input()     \# Pré-filtragem avançada
│       └── statistics\_generator.py
│           └── StatisticsGenerator
│               ├── calculate\_entity\_statistics()
│               └── generate\_statistics()
│
└── tests/                           \# Testes automatizados
├── **init**.py
├── test\_main\_api.py
├── processing/
│   ├── test\_data\_cleaner.py
│   └── test\_statistics\_generator.py
└── conftest.py

```

---

##  Pipeline de Dados

### 1. **Pipeline de Busca Simples** (`/api/v1/gazettes`)

```

1.  Requisição HTTP (FastAPI)
    ↓
2.  PiterApiOrchestrator.get\_enriched\_gazette\_data()
    ↓
3.  QueridoDiarioClient.fetch\_gazettes()
    • Aplica keywords para filtrar resultados
    • Faz requisição à API do Querido Diário
    ↓
4.  Retorna JSON com diários oficiais

<!-- end list -->

```

### 2. **Pipeline de Análise Completa** (`/analyze`)

```

1.  Requisição HTTP (FastAPI)
    ↓
2.  run\_analysis\_pipeline()
    ↓
3.  COLETA: querido\_diario\_client.fetch\_gazettes()
    • Busca 50 diários do período especificado (com keyword fixa)
    ↓
4.  AGREGAÇÃO: Loop por todos os diários + excerpts
    • Junta todos os segmentos de texto de todos os diários
    ↓
5.  LIMPEZA: data\_cleaner.pre\_filter\_spacy\_input()
    • Remove ruído (cabeçalhos, rodapés, regex)
    ↓
6.  PROCESSAMENTO IA: spacy\_api\_client.extract\_entities()
    • Extração de entidades nomeadas (NER) localmente
    ↓
7.  ESTATÍSTICAS: StatisticsGenerator.calculate\_entity\_statistics()
    • Calcula métricas, frequências, top entities
    ↓
8.  Retorna JSON com análise completa

<!-- end list -->

````

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
git clone [https://github.com/unb-mds/Projeto-P.I.T.E.R.git](https://github.com/unb-mds/Projeto-P.I.T.E.R.git)
cd Projeto-P.I.T.E.R

# (Opcional) Troque para a branch de desenvolvimento
git checkout enviodadosapi

# Crie e ative o ambiente virtual (na raiz do projeto)
python3 -m venv venv  # Ou 'py -3.12 -m venv venv' no Windows

# Ativar no Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Ativar no Linux/Mac:
# source venv/bin/activate

# Instale as dependências (apontando para a pasta backend)
pip install -r backend/requirements.txt

# Baixe o modelo do spaCy (pt-BR) - Versão Small
# NOTA: Usamos o link direto para evitar erros 404 comuns
pip install [https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz](https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz)
````

### 3️⃣ Configuração de Ambiente

Se necessário, crie o arquivo `.env` dentro da pasta `backend/`:

```bash
# backend/.env
# (Opcional) Se usar serviço externo. O padrão agora é rodar local (embutido).
SPACY_API_URL=http://localhost:8001 
```

### 4️⃣ Execução do Servidor

**IMPORTANTE:** Rodar sempre a partir da **raiz do projeto**, usando o modo de módulo (`-m`).

```bash
# Inicie o servidor (estando na pasta raiz Projeto-P.I.T.E.R)
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse a documentação interativa em:
**http://127.0.0.1:8000/docs** (Swagger UI)

-----

## Endpoints Principais

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `GET` | `/` | Status geral da API |  |
| `GET` | `/health` | Healthcheck básico |  |
| `GET` | `/api/v1/gazettes` | Consulta diários oficiais filtrados |  |
| `GET` | `/analyze` | Pipeline completo de IA (NLP + estatísticas) |  |
| `POST` | `/api/v1/ranking/state` | Ranking de municípios por investimento |  |

-----

## Testes e Qualidade

O projeto usa `pytest` para testes unitários e de integração, e `pre-commit` para automação de qualidade.

### 1\. Executar Testes

Os testes devem ser executados a partir da pasta `backend` para que os imports relativos funcionem corretamente.

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Garanta que o venv está ativo

# 3. Rode os testes
pytest -s -v
```

Isso executará:

  * **Testes de Integração:** (`tests/test_main_api.py`) - Verificam se os endpoints da API funcionam (com mocks).
  * **Testes Unitários:** (`tests/processing/`) - Verificam a lógica de limpeza de dados e cálculo de estatísticas.

### 2\. Qualidade de Código (Pre-commit)

Utilizamos `Black` (formatação) e `Ruff` (linting) via pre-commit.

**Instalação (uma vez):**

```bash
# Na raiz do projeto
pre-commit install
```

**Uso:**
Toda vez que você fizer `git commit`, as ferramentas rodarão automaticamente. Se houver erros ou formatações, o commit será bloqueado. Corrija (ou adicione os arquivos formatados com `git add`) e tente comitar novamente.

-----

## Histórico de Mudanças

### v1.2.0 - Novembro 2025 (Ana)

#### **Implementação de Suporte a Keywords**

  * Modificado `fetch_gazettes()` para aceitar parâmetro `keywords`.
  * Resultado: Redução de **99.4%** no ruído.

### v1.1.0 - Novembro 2025 (Gulia, Morais, Rodrigo)

#### **Implementação Inicial do Sistema de Ranking**

  * Sistema de Ranking de Municípios.
  * Integração com Querido Diário.
  * Geração de Estatísticas e Pipeline de IA.

### v1.0.0 - Outubro 2025 (Equipe)

#### **Implementação Inicial do Backend**

  * Estrutura base FastAPI, spaCy, Pytest.

-----

## Troubleshooting

### Erro: `ModuleNotFoundError: No module named 'backend'`

**Solução:** Execute o servidor a partir da **raiz do projeto**:
`python -m uvicorn backend.main:app --reload`

### Erro: `spaCy model not found` (Erro 404)

**Solução:** O comando automático pode falhar. Instale via link direto:
`pip install https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz`

-----

## Licença

Este projeto está sob a licença definida no arquivo LICENSE na raiz do repositório.

-----

**Desenvolvido com  pela equipe do Projeto P.I.T.E.R - UnB/FGA**
