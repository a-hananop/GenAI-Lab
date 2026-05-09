from fastapi import APIRouter, HTTPException
from engines.experiment_engine import design_experiment, get_experiments_list
from database.db import SessionLocal, ExperimentDB
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/experiments", tags=["experiments"])

class ExperimentCreate(BaseModel):
    hypothesis_id: str
    methodology: Optional[str] = None

@router.post("/create")
async def create_experiment(body: ExperimentCreate):
    try:
        return await design_experiment(body.hypothesis_id, body.methodology)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_experiments():
    return await get_experiments_list()

@router.get("/{exp_id}")
async def get_experiment(exp_id: str):
    db = SessionLocal()
    try:
        exp = db.query(ExperimentDB).filter(ExperimentDB.id == exp_id).first()
        if not exp: raise HTTPException(404, "Not found")
        return {"id":exp.id,"hypothesis_id":exp.hypothesis_id,"name":exp.name,
                "methodology":exp.methodology,"objective":exp.objective,
                "control_group":exp.control_group or {},"test_group":exp.test_group or {},
                "variables":exp.variables or [],"metrics":exp.metrics or [],
                "status":exp.status,"cost_estimate":exp.cost_estimate,
                "ethical_score":exp.ethical_score,"reproducibility_score":exp.reproducibility_score,
                "success_threshold":exp.success_threshold,"failure_conditions":exp.failure_conditions or [],
                "time_horizon":exp.time_horizon,"required_resources":exp.required_resources or [],
                "results":exp.results,"agent_discussion":exp.agent_discussion or [],
                "created_at":exp.created_at.isoformat() if exp.created_at else None}
    finally:
        db.close()
