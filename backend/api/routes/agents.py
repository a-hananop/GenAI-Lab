from fastapi import APIRouter
from services.agents_service import get_agents_status, run_agent_debate
from pydantic import BaseModel

router = APIRouter(prefix="/api/agents", tags=["agents"])

class DebateReq(BaseModel):
    topic: str
    directive: str = ""

@router.get("/status")
async def status():
    return get_agents_status()

@router.post("/debate")
async def debate(body: DebateReq):
    return await run_agent_debate(body.topic, body.directive)
