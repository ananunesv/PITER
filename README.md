# P.I.T.E.R - Plataforma de Integração e Transparência em Educação e Recursos

**Arquitetura Limpa e Separada** - Frontend Next.js + Backend FastAPI

---

## 🏗️ Nova Arquitetura

```
📁 frontend/          # Next.js React Application
├── app/              # Next.js App Router
├── components/       # React Components (Atomic Design)
├── hooks/            # Custom React Hooks
├── types/            # TypeScript Types
├── package.json      # Frontend Dependencies
└── Dockerfile        # Frontend Container

📁 backend/           # FastAPI Python API
├── services/         # Business Logic & External APIs
├── main.py           # FastAPI Application
├── requirements.txt  # Python Dependencies
└── Dockerfile        # Backend Container

📄 docker-compose.yml # Orquestração Local
```

---

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)
```bash
# Rodar tudo junto
docker-compose up

# Acessar:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Opção 2: Desenvolvimento Separado

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deploy

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

## 📋 Features

- **Separação Clara**: Frontend e Backend independentes
- **API Única**: FastAPI consolidada com CORS configurado
- **Deploy Independente**: Cada parte pode ser deployed separadamente
- **Docker Ready**: Containers prontos para produção
- **TypeScript**: Frontend totalmente tipado
- **Documentação Auto**: Swagger/ReDoc automático no backend

---

## 🔄 Fluxo de Dados

1. **Frontend** faz requests para `/api/*`
2. **Next.js** redireciona para Backend via proxy
3. **Backend** processa e retorna dados
4. **Frontend** renderiza com React + Chart.js

---

## 🛠️ Tecnologias

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Chart.js
- Axios

**Backend:**
- FastAPI + Uvicorn
- Python 3.10+
- Pydantic
- httpx
- python-jose

---

## ⚙️ Configuração

Copie os arquivos de exemplo:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Ajuste as URLs conforme necessário.