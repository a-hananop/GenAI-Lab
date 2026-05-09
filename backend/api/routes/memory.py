from fastapi import APIRouter, Query
from engines.memory_engine import store_memory, search_memory, get_all_memories, get_knowledge_graph
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/memory", tags=["memory"])

class MemCreate(BaseModel):
    memory_type: str; title: str; content: str
    tags: Optional[List[str]] = []
    outcome: Optional[str] = "neutral"
    confidence_at_time: Optional[float] = 0.5

@router.post("/store")
async def add_memory(body: MemCreate):
    return await store_memory(body.memory_type, body.title, body.content, body.tags, body.outcome, body.confidence_at_time)

@router.get("/search")
async def search(q: str = Query(""), limit: int = 10):
    return await search_memory(q, limit)

@router.get("/graph")
async def graph():
    return await get_knowledge_graph()

@router.get("")
async def list_memories(memory_type: str = None):
    return await get_all_memories(memory_type)
