# 🔭 GenAI Lab — Autonomous AI Experimentation Engine

**GenAI Lab** is a state-of-the-art, full-stack autonomous AI research platform. It leverages the power of Gemini AI and a multi-agent system to automate the entire scientific method—from hypothesis generation to experimental design, simulation, and statistical analysis.

---

## 🚀 Key Features

- **🧠 Autonomous Research Loop**: A self-driving research engine that generates hypotheses and refines them through iterative experimentation.
- **🤖 Agent Council**: 10 specialized AI agents (e.g., Lead Scientist, Ethical Reviewer, Data Analyst) that debate research topics to provide multi-perspective insights.
- **🧪 Experiment Center**: Design and track detailed experimental protocols based on approved hypotheses.
- **⚡ Simulation Runner**: Execute 6 different types of simulations in real-time to validate scientific theories.
- **📈 Analysis & Insights**: Advanced statistical analysis with XAI (Explainable AI) to visualize confidence levels and domain distributions.
- **🕸️ Memory Vault**: A semantic knowledge graph that stores research data and visualizes relationships between concepts using vector embeddings.
- **💬 AI Lab Assistant**: A floating, context-aware support bot powered by Gemini to assist users in navigating the lab.
- **📄 Research Reports**: Automatically generated, structured scientific reports summarizing lab findings.

---

## 🛠️ Technology Stack

- **Backend**: Python (FastAPI), SQLAlchemy (SQLite), Google Generative AI (Gemini Flash).
- **Frontend**: React.js, Vite, Framer Motion (Animations), Lucide React (Icons), Recharts (Charts), Zustand (State Management).
- **Visualization**: React Force Graph for interactive 2D knowledge graphs.

---

## 🧱 Project Structure

```text
GenAI Lab/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── .env                       # API Configuration (Excluded from Git)
│   ├── database/db.py             # SQLAlchemy models & SQLite initialization
│   ├── engines/
│   │   ├── hypothesis_engine.py   # AI hypothesis generation logic
│   │   ├── experiment_engine.py   # Protocol design engine
│   │   ├── simulation_engine.py   # 6-type simulation runner
│   │   ├── analysis_engine.py     # Statistics & Confidence metrics
│   │   └── memory_engine.py       # Semantic memory & Knowledge Graph
│   ├── services/
│   │   ├── gemini_service.py      # Core Gemini API integration
│   │   ├── agents_service.py      # Multi-agent debate logic
│   │   └── research_loop.py       # Autonomous loop orchestration
│   └── api/routes/                # REST API Endpoints
│
└── frontend/
    ├── src/
    │   ├── components/            # Layout (Sidebar, Header) & UI (SupportBot, StatCards)
    │   ├── pages/                 # 8 Full Research Pages
    │   ├── store/useStore.js      # Global application state
    │   └── services/api.js        # Axios API integration
    └── index.css                  # Global Premium Design System
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.9+
- Gemini API Key

### Step 1: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` folder:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
5. Start the server:
   ```bash
   python main.py
   ```

### Step 2: Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Documentation
Once the backend is running, you can access the interactive Swagger documentation at:
**http://localhost:8000/docs**

---

## 🛡️ Security
This project uses a `.gitignore` file to ensure that sensitive information (like your `.env` API keys) and local databases are never uploaded to public repositories. **Never share your `.env` file.**

---

## 📄 License
This project is for educational and research purposes as part of the GenAI Lab initiative.
