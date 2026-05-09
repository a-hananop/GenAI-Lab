from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from engines.simulation_engine import run_simulation, get_simulations_list
from database.db import SessionLocal, SimulationDB
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json

router = APIRouter(prefix="/api/simulations", tags=["simulations"])

class SimCreate(BaseModel):
    experiment_id: str
    sim_type: str
    parameters: Optional[Dict[str, Any]] = {}
    iterations: Optional[int] = 500

@router.get("/types")
async def sim_types():
    return [
        {"id":"monte_carlo","name":"Monte Carlo","description":"Random sampling convergence"},
        {"id":"bayesian","name":"Bayesian Optimization","description":"Gaussian Process surrogate"},
        {"id":"genetic_algorithm","name":"Genetic Algorithm","description":"Evolutionary optimization"},
        {"id":"reinforcement_learning","name":"Reinforcement Learning","description":"Q-learning reward optimization"},
        {"id":"ab_test","name":"A/B Test","description":"Two-group statistical comparison"},
        {"id":"multi_arm_bandit","name":"Multi-Arm Bandit","description":"Exploration-exploitation strategy"},
    ]

@router.get("")
async def list_sims():
    return await get_simulations_list()

@router.post("/run")
async def run_sim(body: SimCreate):
    try:
        return await run_simulation(body.experiment_id, body.sim_type, body.parameters or {}, body.iterations or 500)
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/{sim_id}")
async def get_sim(sim_id: str):
    db = SessionLocal()
    try:
        sim = db.query(SimulationDB).filter(SimulationDB.id == sim_id).first()
        if not sim: raise HTTPException(404, "Not found")
        return {"id":sim.id,"experiment_id":sim.experiment_id,"sim_type":sim.sim_type,
                "parameters":sim.parameters or {},"iterations":sim.iterations,
                "status":sim.status,"progress":sim.progress,"results":sim.results,
                "insights":sim.insights,"convergence_data":sim.convergence_data or [],
                "created_at":sim.created_at.isoformat() if sim.created_at else None,
                "completed_at":sim.completed_at.isoformat() if sim.completed_at else None}
    finally:
        db.close()

@router.websocket("/ws/{session_id}")
async def ws_simulation(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        params = json.loads(data)
        async def cb(progress: float, value: float):
            try:
                await websocket.send_json({"type":"progress","progress":round(progress,3),"value":round(value,4)})
            except Exception:
                pass
        result = await run_simulation(
            params.get("experiment_id","demo"), params.get("sim_type","monte_carlo"),
            params.get("parameters",{}), params.get("iterations",300), cb)
        await websocket.send_json({"type":"complete","result":result})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try: await websocket.send_json({"type":"error","message":str(e)})
        except Exception: pass
