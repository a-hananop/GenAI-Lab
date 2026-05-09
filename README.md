# GenAI Lab — Autonomous AI Experimentation Engine

## 🚀 Quick Start

### Step 1 — Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Or double-click **`start_backend.bat`**

### Step 2 — Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Or double-click **`start_frontend.bat`**

### Step 3 — Open Browser
→ **http://localhost:5173**

---

## 🧱 Project Structure
```
GenAI Lab/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── .env                       # Gemini API key
│   ├── database/db.py             # SQLAlchemy models
│   ├── engines/
│   │   ├── hypothesis_engine.py   # Gemini hypothesis generation
│   │   ├── experiment_engine.py   # Auto experiment design
│   │   ├── simulation_engine.py   # 6 simulation types
│   │   ├── analysis_engine.py     # Statistical analysis + XAI
│   │   └── memory_engine.py       # Semantic memory + knowledge graph
│   ├── services/
│   │   ├── gemini_service.py      # Gemini API integration
│   │   ├── agents_service.py      # 10 AI agents + debate
│   │   └── research_loop.py       # Autonomous research loop
│   └── api/routes/                # All REST endpoints
│
└── frontend/
    └── src/
        ├── pages/                 # 8 full pages
        ├── components/            # Layout, UI, Charts
        ├── store/useStore.js      # Zustand state
        └── services/api.js        # Axios API layer
```

## 🔑 API Key
Pre-configured: `AIzaSyD1st0kJBx7ipOGWz5jRA6dHfkkwvPFLp4`

## 📡 API Docs
Visit `http://localhost:8000/docs` for interactive Swagger documentation.
