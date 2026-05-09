from fastapi import APIRouter
from services.research_loop import run_research_loop, get_loop_history, get_loop_status
from database.db import SessionLocal, HypothesisDB, ExperimentDB, SimulationDB, MemoryDB, TokenUsageDB
from sqlalchemy.sql import func

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
router_loop = APIRouter(prefix="/api/research-loop", tags=["research-loop"])

@router.get("/stats")
async def stats():
    db = SessionLocal()
    try:
        total_h = db.query(HypothesisDB).count()
        approved_h = db.query(HypothesisDB).filter(HypothesisDB.status=="approved").count()
        total_e = db.query(ExperimentDB).count()
        completed_e = db.query(ExperimentDB).filter(ExperimentDB.status=="completed").count()
        total_s = db.query(SimulationDB).count()
        total_m = db.query(MemoryDB).count()
        recent_h = db.query(HypothesisDB).order_by(HypothesisDB.created_at.desc()).limit(10).all()
        conf_evo = [{"label":f"H{i+1}","confidence":round(h.confidence,1)} for i,h in enumerate(reversed(recent_h))]
        domains_raw = db.query(HypothesisDB.domain).all()
        domain_counts = {}
        for (d,) in domains_raw:
            if d: domain_counts[d] = domain_counts.get(d,0)+1
            
        total_tokens = db.query(func.sum(TokenUsageDB.total_tokens)).scalar() or 0
        estimated_cost = (total_tokens / 1000000) * 0.35
        
        return {
            "total_hypotheses":total_h,"approved_hypotheses":approved_h,
            "total_experiments":total_e,"completed_experiments":completed_e,
            "total_simulations":total_s,"total_memories":total_m,
            "success_rate":round(completed_e/max(total_e,1)*100,1),
            "avg_confidence":round(sum(h.confidence for h in recent_h)/max(len(recent_h),1),1) if recent_h else 0,
            "confidence_evolution":conf_evo,
            "domain_distribution":[{"domain":k,"count":v} for k,v in domain_counts.items()],
            "research_loop":get_loop_status(),
            "total_tokens": total_tokens,
            "estimated_cost": estimated_cost,
            "system_health":{"hypothesis_engine":"online","experiment_engine":"online",
                             "simulation_engine":"online","memory_engine":"online","gemini_api":"connected"}
        }
    finally:
        db.close()

@router_loop.post("/trigger")
async def trigger():
    return await run_research_loop()

@router_loop.get("/history")
async def history():
    return await get_loop_history()

@router_loop.get("/status")
async def status():
    return get_loop_status()
