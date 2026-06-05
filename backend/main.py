import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import init_db
from api.routes.hypotheses import router as hyp_r
from api.routes.experiments import router as exp_r
from api.routes.simulations import router as sim_r
from api.routes.agents import router as agents_r
from api.routes.memory import router as mem_r
from api.routes.analysis import router as ana_r
from api.routes.dashboard import router as dash_r, router_loop
from api.routes.reports import router as rep_r
from api.routes.support import router as sup_r

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✅ GenAI Lab Backend Ready on http://localhost:8000")
    yield

app = FastAPI(
    title="GenAI Lab API", 
    description="Autonomous AI Experimentation Engine", 
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "GenAI Lab", "version": "1.0.0"}

app.include_router(hyp_r)
app.include_router(exp_r)
app.include_router(sim_r)
app.include_router(agents_r)
app.include_router(mem_r)
app.include_router(ana_r)
app.include_router(dash_r)
app.include_router(router_loop)
app.include_router(rep_r)
app.include_router(sup_r)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
