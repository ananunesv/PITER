# Backend - Projeto P.I.T.E.R

Guia de configuração e execução do ambiente de desenvolvimento local para a equipe.

  - **Disciplina:** `MDS, Engenharia de Software`
  - **Professora/Orientadora:** `Carla`

-----

## 🛠️ Tecnologias

  - **Linguagem:** Python
  - **Framework:** FastAPI
  - **Validação de Dados:** Pydantic
  - **Servidor ASGI:** Uvicorn
  - **Testes:** Pytest, Pytest-Mock
  - **Qualidade de Código:** Pre-commit, Black, Flake8
  - **Análise de Dados:** Pandas

-----

## 🚀 Como Rodar o Projeto Localmente

Siga estes 4 passos para ter o projeto rodando na sua máquina.

### Passo 1: Pré-requisitos

Garanta que você tenha o básico instalado:

  - Ubuntu ou sistema similar (WSL no Windows funciona bem)
  - [Git](https://git-scm.com)
  - [Python 3.10+](https://www.python.org/downloads/)
  - [pip](https://pip.pypa.io/en/stable/)

-----

### Passo 2: Instalação

Clone o repositório, entre na pasta do backend, crie o ambiente virtual e instale as dependências.

```bash
# Clone o projeto
git clone https://github.com/unb-mds/Projeto-P.I.T.E.R.git
cd Projeto-P.I.T.E.R

# Entre na branch de desenvolvimento
# (Ajuste o nome da branch se necessário)
git checkout enviodadosapi

# --- Entre na pasta do backend ---
cd backend

# Crie e ative o ambiente virtual (dentro da pasta backend)
python3 -m venv venv

# Ativar no Linux/Mac:
source venv/bin/activate
# Ativar no Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Instale as dependências do projeto (do backend)
# (Isso inclui FastAPI, Uvicorn, Pandas, Pytest, Pytest-Mock, etc.)
pip install -r requirements.txt

# (Opcional, se for rodar o Spacy localmente)
# python -m spacy download pt_core_news_lg
```

-----

### Passo 3: Configuração do Ambiente

A API precisa de algumas variáveis de ambiente para funcionar.

1.  Dentro da pasta `backend`, crie um arquivo chamado `.env`.
2.  Copie o conteúdo de `.env.example` para o novo `.env`.
3.  Adicione as seguintes variáveis a ele (use os valores corretos para o seu ambiente):

<!-- end list -->

```env
# Exemplo de arquivo .env (dentro de backend/)
# URL onde seu serviço Spacy irá rodar (se for externo)
SPACY_API_URL="http://127.0.0.1:8080/ent"
```

-----

### Passo 4: Execução

Com tudo instalado e configurado, inicie o servidor FastAPI.

```bash
# Certifique-se de que você está na pasta 'backend'
# e que seu ambiente virtual (venv) está ativo.

# Execute o Uvicorn
# 'main:app' aponta para o objeto 'app' no arquivo 'main.py'
# '--reload' reinicia o servidor automaticamente quando você salva uma alteração
python3 -m uvicorn main:app --reload
```

O terminal deverá mostrar uma mensagem indicando que o servidor está rodando em `http://127.0.0.1:8000`.

### Exemplo de acesso aos dados via API

Com o servidor rodando, acesse no navegador:

**Endpoint de Análise (Pipeline de IA):**
`http://127.0.0.1:8000/analyze`

**Endpoint de Busca (Querido Diário):**
`http://127.0.0.1:8000/api/v1/gazettes?territory_ids=5208707&published_since=2024-02-19&published_until=2024-03-11&size=5`

-----

## 🧪 Testando o Projeto

O projeto usa `pytest` para testes de integração e unitários, e `pre-commit` para garantir a qualidade e formatação do código.

### 1\. Dependências de Teste

Todas as ferramentas necessárias (`pytest`, `pytest-mock`, `black`, `flake8`) já estão incluídas no arquivo `backend/requirements.txt`. A instalação no "Passo 2" já cuidou disso.

Temos também um arquivo `backend/pytest.ini` para garantir que o plugin `pytest-mock` (que fornece a fixture `mocker`) seja carregado corretamente.

### 2\. Executando os Testes

Os testes são feitos para serem executados a partir da pasta `backend`.

```bash
# Certifique-se de que você está na pasta 'backend'
# e que seu ambiente virtual (venv) está ativo.

# Execute o pytest com verbosidade e mostrando os prints
pytest -s -v
```

Isso descobrirá e executará todos os testes nas pastas `backend/tests/` (testes de API) e `backend/tests/processing/` (testes unitários).

### 3\. Automação de Qualidade (Pre-commit)

Nós usamos `pre-commit` com `Black` e `Flake8` para formatar e verificar seu código automaticamente *antes* de cada commit.

**Como configurar (apenas uma vez):**

```bash
# 1. Certifique-se de que 'pre-commit' está instalado (feito no Passo 2)

# 2. Navegue até a pasta RAIZ do projeto (Projeto-B.I.I.A)
cd .. 
# (Se você estava em 'backend', volte um nível)

# 3. Instale os hooks do git
pre-commit install
```

**Como funciona:**
Agora, toda vez que você rodar `git commit`:

1.  `black` será executado e formatará seus arquivos `.py` automaticamente.
2.  `flake8` será executado e verificará se há erros de lógica ou estilo.
3.  Se `black` formatar algum arquivo ou `flake8` encontrar um erro, o commit falhará.
4.  **Para corrigir:** Simplesmente adicione os arquivos formatados (`git add .`) e rode `git commit` novamente.

-----

[https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
Este site contém todos os tutoriais iniciais para rodar o fastAPI.