# Backend - Projeto P.I.T.E.R

Guia de configuração e execução do ambiente de desenvolvimento local para a equipe.

- **Disciplina:** `MDS, Engenharia de Software`
- **Professora/Orientadora:** `Carla`

---

## 🛠️ Tecnologias

- **Linguagem:** Python
- **Framework:** FastAPI
- **Validação de Dados:** Pydantic
- **Servidor ASGI:** Uvicorn
- **Análise de Dados:** Pandas
- **NLP:** spaCy (modelo `pt_core_news_sm`)
- **Testes:** Pytest, Pytest-Mock
- **Qualidade de Código:** Pre-commit, Black, Ruff

> ⚠️ **Requisito:** Python **3.12** (spaCy não é compatível com Python 3.13+)

---

## 🚀 Como Rodar o Projeto Localmente

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

3️⃣ Configuração de ambiente

Se necessário, crie o arquivo .env dentro da pasta backend/:

# backend/.env
SPACY_API_URL=

4️⃣ Execução do servidor

É importante rodar o servidor a partir da raiz do projeto.

# Defina o caminho do backend (somente no Windows PowerShell)
$env:PYTHONPATH = "$PWD\backend"

# Inicie o servidor
uvicorn backend.main:app --reload


Acesse a documentação interativa em:
👉 http://127.0.0.1:8000/docs

5️⃣ Endpoints principais
Endpoint	Descrição
/	Verifica o status geral da API
/health	Healthcheck básico
/analyze	Executa o pipeline de IA (NLP + estatísticas)
/api/v1/gazettes	Consulta os diários oficiais via Querido Diário

Exemplo:

http://127.0.0.1:8000/api/v1/gazettes?territory_ids=5208707&published_since=2024-02-19&published_until=2024-03-11&size=5

🧪 Testes

O projeto usa pytest para testes unitários e de integração.

# Na raiz do projeto, com o venv ativo
pytest -s -v


Os testes estão localizados em backend/tests/.

🧹 Qualidade de Código

O repositório utiliza Pre-commit, Black e Ruff.

# Instalar os hooks
pre-commit install

# Rodar manualmente (opcional)
pre-commit run --all-files

📚 Referência

FastAPI Documentation

spaCy Documentation