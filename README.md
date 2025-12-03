# P.I.T.E.R - Plataforma de Integração e Transparência em Educação e Recursos

**Procurador de Investimentos em Tecnologia na Educacao e Recursos**

Plataforma para busca e analise de diarios oficiais municipais com foco em investimentos educacionais em tecnologia e robotica.

## Links Importantes

- Documentacao: https://unb-mds.github.io/Projeto-P.I.T.E.R/
- Design (Figma): https://www.figma.com/design/SrD9XAdENSImL4DVWmEZD5/Organizacao-MDS

---

## Arquitetura do Projeto

```
Projeto-P.I.T.E.R/
├── frontend/                 # Aplicacao Next.js
│   ├── app/                  # App Router do Next.js
│   │   ├── page.tsx          # Pagina principal
│   │   ├── dashboard_pesquisa/  # Dashboard de analise
│   │   ├── compare/          # Comparacao de municipios
│   │   └── ranking/          # Ranking de investimentos
│   ├── components/           # Componentes React (Atomic Design)
│   │   ├── atoms/            # Componentes basicos
│   │   ├── molecules/        # Componentes compostos
│   │   └── organisms/        # Componentes complexos
│   ├── hooks/                # Custom React Hooks
│   ├── services/             # Servicos de integracao
│   └── types/                # Definicoes TypeScript
│
├── backend/                  # API FastAPI
│   ├── services/             # Logica de negocio
│   │   ├── api/clients/      # Clientes para APIs externas
│   │   │   ├── querido_diario_client.py  # API Querido Diario
│   │   │   ├── gemini_client.py          # Google Gemini (IA)
│   │   │   └── spacy_api_client.py       # Processamento NLP
│   │   ├── processing/       # Processamento de dados
│   │   └── integration/      # Orquestradores
│   ├── data_output/          # Dados salvos das analises
│   ├── main.py               # Aplicacao principal
│   └── requirements.txt      # Dependencias Python
│
└── docker-compose.yml        # Orquestracao Docker
```

---

## Pre-requisitos

- Node.js 18+ e npm
- Python 3.10+
- Git
- Docker (opcional, para execucao simplificada)

---

## Como Executar (Manual)

### 1. Clone o repositorio

```bash
git clone https://github.com/unb-mds/Projeto-P.I.T.E.R.git
cd Projeto-P.I.T.E.R
```

### 2. Configure o Backend (Terminal 1)

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
source venv/bin/activate          # Linux/Mac
# ou venv\Scripts\activate        # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar chave do Gemini (opcional, para analise por IA)
echo "GEMINI_API_KEY=sua_chave_aqui" > .env

# Iniciar servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 3. Configure o Frontend (Terminal 2)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor
npm run dev
```

### 4. Acesse a aplicacao

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8001 |
| Documentacao API | http://localhost:8001/docs |

---

## Como Executar (Docker)

Docker instala todas as dependencias automaticamente e funciona em qualquer sistema operacional.

### 1. Instalar Docker

- Windows/macOS: Baixe o Docker Desktop em https://www.docker.com/products/docker-desktop
- Linux (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuario ao grupo docker (evita usar sudo)
sudo usermod -aG docker $USER
newgrp docker
```

Verificar instalacao:
```bash
docker --version
docker-compose --version
```

### 2. Executar o Projeto

```bash
# Primeira vez (constroi as imagens)
docker-compose up --build

# Proximas vezes
docker-compose up

# Executar em background
docker-compose up -d
```

A primeira execucao pode levar 5-10 minutos para baixar as imagens e instalar dependencias.

### 3. Comandos Uteis do Docker

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um servico especifico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar servicos
docker-compose stop

# Parar e remover containers
docker-compose down

# Reconstruir apos mudar dependencias
docker-compose up --build

# Ver status dos containers
docker-compose ps
```

---

## Funcionalidades

### Busca de Diarios Oficiais
- Filtros por municipio, categoria e periodo
- Municipios de Goias (Goiania, Aparecida de Goiania, Anapolis, Brasilia)
- Categorias: Robotica educacional e Software
- Integracao com API do Querido Diario

### Dashboard de Analise
- Graficos de investimentos por periodo (mes ou ano)
- Grafico de pizza por subcategoria
- Visualizacao de total investido

### Comparacao de Municipios
- Comparativo lado a lado de dois municipios
- Grafico de barras comparativo
- Diferenca percentual de investimentos

### Ranking de Subcategorias
- Top 3 subcategorias mais investidas
- Grafico horizontal de investimentos
- Links para fontes oficiais

### Analise por IA (Gemini)
- Geracao de relatorio em PDF
- Analise qualitativa do contexto
- Identificacao de objeto, justificativa, fornecedor e marca/modelo

---

## Tecnologias Utilizadas

### Frontend
- Next.js 14 com App Router
- React 18 + TypeScript
- TailwindCSS
- Recharts (graficos)
- Lucide React (icones)

### Backend
- FastAPI + Uvicorn
- Python 3.10+
- Google Gemini API (analise por IA)
- spaCy (processamento NLP)
- httpx (requisicoes HTTP)

### APIs Externas
- Querido Diario: Dados de diarios oficiais
- Google Gemini: Analise qualitativa por IA

---

## Configuracao de Ambiente

### Backend (.env)

```bash
# Criar arquivo .env no diretorio backend
GEMINI_API_KEY=sua_chave_do_google_ai_studio
```

Para obter a chave do Gemini:
1. Acesse https://aistudio.google.com/
2. Clique em "Get API Key"
3. Crie uma nova chave ou use uma existente

### Frontend (.env.local)

```bash
# Criar arquivo .env.local no diretorio frontend
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## Problemas Comuns

### Erro "Failed to fetch" ao fazer busca

Verifique se o backend esta rodando:
```bash
lsof -ti:8001
```

Se nao estiver, inicie o backend conforme as instrucoes acima.

### Frontend mostrando versao antiga

```bash
# Pare o servidor e limpe o cache
cd frontend
rm -rf .next
npm run dev
```

### Porta ja em uso

```bash
# Matar processo na porta especifica
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8001 | xargs kill -9  # Backend
```

---

## Deploy

O projeto pode ser deployado em:

- Frontend: Vercel, Netlify
- Backend: Railway, Render, Heroku
- Docker: Qualquer plataforma que suporte containers

Para deploy no Vercel:
```bash
# Frontend
cd frontend
vercel --prod

# Backend (Railway recomendado)
cd backend
railway up
```

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo `LICENSE` para detalhes.

---

## Equipe

Desenvolvido como parte do projeto de Metodos de Desenvolvimento de Software (MDS) da Universidade de Brasilia (UnB).
