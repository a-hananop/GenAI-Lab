from fastapi import APIRouter, HTTPException
from engines.analysis_engine import analyze_experiment

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.get("/{experiment_id}")
async def get_analysis(experiment_id: str):
    result = await analyze_experiment(experiment_id)
    if "error" in result:
        raise HTTPException(404, result["error"])
    return result
