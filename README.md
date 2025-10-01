# P.I.T.E.R - Plataforma de Integração e Transparência em Educação e Recursos

**Procurador de Investimentos em Tecnologia na Educação e Recursos**

Plataforma para busca e análise de diários oficiais municipais com foco em investimentos educacionais em tecnologia e robótica.

## 📚 Links Importantes

- **📖 Documentação**: [https://unb-mds.github.io/Projeto-P.I.T.E.R/](https://unb-mds.github.io/Projeto-P.I.T.E.R/)
- **🎨 Design (Figma)**: [https://www.figma.com/design/SrD9XAdENSImL4DVWmEZD5/Organização-MDS](https://www.figma.com/design/SrD9XAdENSImL4DVWmEZD5/Organiza%C3%A7%C3%A3o-MDS?node-id=0-1&t=0wOi8rZ1ZfIk7Juu-1)

---

## Arquitetura do Projeto

```
frontend/          # Next.js React Application
├── app/              # Next.js App Router
├── components/       # React Components (Atomic Design)
│   ├── atoms/        # Componentes básicos
│   ├── molecules/    # Componentes compostos
│   └── organisms/    # Componentes complexos
├── hooks/            # Custom React Hooks
├── types/            # TypeScript Types
├── package.json      # Frontend Dependencies
└── tailwind.config.js # Configuração TailwindCSS

backend/           # FastAPI Python API
├── services/         # Business Logic & External APIs
│   ├── api/clients/  # Clientes para APIs externas
│   └── integration/  # Orquestradores de integração
├── main.py           # FastAPI Application
├── requirements.txt  # Python Dependencies
└── venv/             # Virtual Environment

docker-compose.yml # Orquestração Local
```

---

## Como Executar o Projeto

### Pré-requisitos
- **Node.js** 18+ e **npm**
- **Python** 3.10+
- **Git**

### Execução Rápida (Recomendado)

#### 1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd B.I.I.A
```

#### 2. Inicie o Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# ou venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Em outro terminal, inicie o Frontend:
```bash
cd frontend
npm install
npm run dev
```

#### 4. Acesse a aplicação:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

---

### Opção Docker (Alternativa)
```bash
# Rodar tudo junto
docker-compose up

# Acessar:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

---

## Deploy

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

### Frontend (Vercel)
```bash
cd frontend
# Atualizar BACKEND_URL no vercel.json
vercel --prod
```

---

## Funcionalidades

### Busca de Diários Oficiais
- **Filtros Avançados**: Busca por município, categoria, período
- **Municípios de Goiás**: Foco em Goiânia e região metropolitana
- **Categorias**: Robótica educacional e software educativo
- **Integração**: API do Querido Diário para dados oficiais

### Análise Inteligente
- **Processamento NLP**: Análise de texto com spaCy (em desenvolvimento)
- **Extração de Dados**: Identificação automática de investimentos
- **Métricas**: Valores, programas e projetos educacionais

### Interface Moderna
- **Design Responsivo**: TailwindCSS com componentes atômicos
- **UX Otimizada**: Feedback visual e estados de carregamento
- **Acessibilidade**: Seguindo padrões web modernos

---

## Tecnologias Utilizadas

### Frontend (Next.js)
- **Next.js 14** com App Router
- **React 18** + TypeScript
- **TailwindCSS** para estilização
- **Atomic Design** para componentes
- **Custom Hooks** para lógica de estado

### Backend (FastAPI)
- **FastAPI** + Uvicorn
- **Python 3.10+**
- **Pydantic** para validação
- **httpx** para requisições HTTP
- **Integração** com Querido Diário API

---

## Fluxo de Dados

1. **Frontend** coleta filtros do usuário
2. **Backend** processa requisição e consulta Querido Diário API
3. **Orquestrador** enriquece dados com análise NLP (futuro)
4. **Frontend** exibe resultados formatados

---

## Estrutura do Projeto

```bash
B.I.I.A/
├── frontend/                 # Aplicação Next.js
│   ├── app/                 # App Router do Next.js
│   │   ├── page.tsx         # Página principal
│   │   └── globals.css      # Estilos globais
│   ├── components/          # Componentes React
│   │   ├── atoms/           # Botões, inputs básicos
│   │   ├── molecules/       # Forms, cards
│   │   └── organisms/       # Header, seções completas
│   ├── hooks/               # React Hooks customizados
│   │   └── useGazetteSearch.ts
│   └── types/               # Definições TypeScript
├── backend/                 # API FastAPI
│   ├── services/            # Lógica de negócio
│   │   ├── api/clients/     # Clientes para APIs externas
│   │   └── integration/     # Orquestradores
│   └── main.py             # Aplicação principal
└── docker-compose.yml      # Configuração Docker
```

---

## Configuração de Ambiente

### Backend (.env)
```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env
```

### Frontend (.env.local)
```bash
# Copie o arquivo de exemplo
cp frontend/.env.local.example frontend/.env.local

# Configure a URL do backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deploy em Produção

O projeto está configurado para deploy independente:

- **Frontend**: Vercel
- **Backend**: Vercel, Railway, Heroku
- **Docker**: Qualquer plataforma que suporte containers

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

---

## Equipe

Desenvolvido como parte do projeto de Métodos de Desenvolvimento de Software (MDS) da Universidade de Brasília (UnB).