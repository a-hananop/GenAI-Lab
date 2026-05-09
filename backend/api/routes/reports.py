from fastapi import APIRouter
from database.db import SessionLocal, HypothesisDB, ExperimentDB, SimulationDB
from services.gemini_service import generate_with_gemini, SYSTEM_SCIENTIST
import datetime

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/generate")
async def generate_report():
    db = SessionLocal()
    try:
        total_h = db.query(HypothesisDB).count()
        total_e = db.query(ExperimentDB).count()
        total_s = db.query(SimulationDB).filter(SimulationDB.status=="completed").count()
        approved = db.query(HypothesisDB).filter(HypothesisDB.status=="approved").count()
        recent_h = db.query(HypothesisDB).order_by(HypothesisDB.created_at.desc()).limit(5).all()
        recent_e = db.query(ExperimentDB).order_by(ExperimentDB.created_at.desc()).limit(5).all()

        summary = f"Hypotheses: {total_h}, Experiments: {total_e}, Completed Simulations: {total_s}. Top topics: {', '.join([h.hypothesis[:40] for h in recent_h[:3]])}"
        prompt = f"Generate a structured AI research report for GenAI Lab. Stats: {summary}. Include executive summary, key findings, top hypothesis analysis, and recommended next steps. Be scientific and specific."
        narrative = await generate_with_gemini(prompt, SYSTEM_SCIENTIST)

        return {
            "generated_at":datetime.datetime.utcnow().isoformat(),
            "title":"GenAI Lab Autonomous Research Report",
            "statistics":{"total_hypotheses":total_h,"total_experiments":total_e,
                         "completed_simulations":total_s,"approval_rate":round(approved/max(total_h,1)*100,1)},
            "top_hypotheses":[{"id":h.id,"hypothesis":h.hypothesis[:120],"confidence":h.confidence,"domain":h.domain} for h in recent_h],
            "recent_experiments":[{"id":e.id,"name":e.name,"methodology":e.methodology,"status":e.status} for e in recent_e],
            "narrative":narrative,
        }
    finally:
        db.close()
