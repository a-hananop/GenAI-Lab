from fastapi import APIRouter, HTTPException
from engines.hypothesis_engine import generate_hypothesis, get_hypotheses_list, update_hypothesis_status
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/hypotheses", tags=["hypotheses"])

class HypothesisCreate(BaseModel):
    domain: str = "general"
    topic: Optional[str] = None
    context: Optional[str] = None

@router.post("/generate")
async def create_hypothesis(body: HypothesisCreate):
    try:
        return await generate_hypothesis(domain=body.domain, topic=body.topic, context=body.context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_hypotheses():
    return await get_hypotheses_list()

@router.put("/{hyp_id}/approve")
async def approve(hyp_id: str):
    ok = await update_hypothesis_status(hyp_id, "approved")
    if not ok: raise HTTPException(404, "Not found")
    return {"success": True, "status": "approved"}

@router.put("/{hyp_id}/reject")
async def reject(hyp_id: str):
    ok = await update_hypothesis_status(hyp_id, "rejected")
    if not ok: raise HTTPException(404, "Not found")
    return {"success": True, "status": "rejected"}

@router.put("/{hyp_id}/status")
async def set_status(hyp_id: str, status: str, confidence: float = None):
    ok = await update_hypothesis_status(hyp_id, status, confidence)
    if not ok: raise HTTPException(404, "Not found")
    return {"success": True}
