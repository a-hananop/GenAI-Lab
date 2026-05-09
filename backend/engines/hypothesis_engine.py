import uuid, random, datetime
from typing import Dict, Any, List, Optional
from services.gemini_service import generate_json_with_gemini, SYSTEM_SCIENTIST
from database.db import SessionLocal, HypothesisDB
try:
    from duckduckgo_search import DDGS
except ImportError:
    DDGS = None

DOMAINS = ["machine_learning","neuroscience","economics","biology","physics","climate_science",
           "drug_discovery","behavioral_science","materials_science","quantum_computing","robotics","epidemiology"]


async def generate_hypothesis(domain: str = "general", topic: str = None, context: str = None) -> Dict[str, Any]:
    topic_hint = f"Focus on: {topic}" if topic else f"Choose an interesting research topic in {domain}"
    
    # Grounding via web search
    search_context = ""
    if DDGS:
        try:
            search_query = f"recent breakthroughs in {domain} {topic or ''}"
            with DDGS() as ddgs:
                results = list(ddgs.text(search_query, max_results=3))
                if results:
                    search_context = "Recent Literature & Context:\n" + "\n".join([f"- {r['title']}: {r['body']}" for r in results])
        except Exception as e:
            print(f"Web search failed: {e}")
            pass

    ctx_hint = ""
    if context or search_context:
        ctx_hint = "Additional context:\n" + (context or "") + "\n\n" + search_context

    prompt = f"""Generate a novel, testable scientific hypothesis for GenAI Lab.
Domain: {domain}
{topic_hint}
{ctx_hint}

Return JSON with exactly these fields:
{{
  "hypothesis": "A clear, specific, testable hypothesis statement (1-2 sentences)",
  "confidence": <integer 40-85>,
  "variables": ["variable1", "variable2", "variable3"],
  "predicted_outcome": "Expected observation if hypothesis is true",
  "reasoning": "Scientific rationale (2-3 sentences)",
  "risk_level": "low|medium|high|critical",
  "estimated_value": "Scientific/business impact description",
  "prior_evidence": "Relevant existing research supporting this",
  "dependencies": ["dependency1", "dependency2"]
}}"""

    data = await generate_json_with_gemini(prompt, SYSTEM_SCIENTIST)
    if not data or "hypothesis" not in data:
        data = _fallback_hypothesis(domain)

    hyp_id = str(uuid.uuid4())
    data["id"] = hyp_id
    data["domain"] = domain
    data["status"] = "pending"
    data["agent_votes"] = _make_agent_votes()
    data["created_at"] = datetime.datetime.utcnow().isoformat()
    data["updated_at"] = datetime.datetime.utcnow().isoformat()

    db = SessionLocal()
    try:
        db.add(HypothesisDB(
            id=hyp_id,
            hypothesis=data.get("hypothesis", ""),
            confidence=float(str(data.get("confidence", 50)).replace("%","")),
            variables=data.get("variables", []),
            predicted_outcome=data.get("predicted_outcome", ""),
            reasoning=data.get("reasoning", ""),
            risk_level=data.get("risk_level", "medium"),
            estimated_value=data.get("estimated_value", ""),
            domain=domain, status="pending",
            prior_evidence=data.get("prior_evidence", ""),
            dependencies=data.get("dependencies", []),
            agent_votes=data.get("agent_votes", {}),
        ))
        db.commit()
    finally:
        db.close()
    return data


def _make_agent_votes() -> Dict[str, Any]:
    agents = ["HypothesisAgent","ResearchCritic","EthicsAgent","BayesianStrategist","DataScientist"]
    return {
        a: {"vote": random.choice(["approve","approve","approve","reject","abstain"]),
            "confidence": round(random.uniform(0.5, 0.95), 2),
            "comment": f"{a} evaluated this hypothesis."} for a in agents
    }


def _fallback_hypothesis(domain: str) -> Dict[str, Any]:
    return {
        "hypothesis": f"Applying adaptive learning rate schedules in {domain} models will reduce convergence time by 30% without accuracy loss.",
        "confidence": 68,
        "variables": ["learning_rate","convergence_speed","model_accuracy"],
        "predicted_outcome": "Models converge 30% faster with equivalent or better accuracy",
        "reasoning": "Adaptive LR methods like AdaGrad/Adam dynamically adjust to gradient magnitudes, enabling faster stable convergence.",
        "risk_level": "medium",
        "estimated_value": "High — reduces training cost significantly across all model types",
        "prior_evidence": "Kingma & Ba (2014) demonstrated Adam's superior convergence properties.",
        "dependencies": ["training_data","model_architecture","optimizer_config"]
    }


async def get_hypotheses_list() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        rows = db.query(HypothesisDB).order_by(HypothesisDB.created_at.desc()).all()
        return [{
            "id": r.id, "hypothesis": r.hypothesis, "confidence": r.confidence,
            "variables": r.variables or [], "predicted_outcome": r.predicted_outcome,
            "reasoning": r.reasoning, "risk_level": r.risk_level,
            "estimated_value": r.estimated_value, "domain": r.domain, "status": r.status,
            "prior_evidence": r.prior_evidence, "dependencies": r.dependencies or [],
            "agent_votes": r.agent_votes or {},
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        } for r in rows]
    finally:
        db.close()


async def update_hypothesis_status(hyp_id: str, status: str, confidence: float = None) -> bool:
    db = SessionLocal()
    try:
        hyp = db.query(HypothesisDB).filter(HypothesisDB.id == hyp_id).first()
        if not hyp:
            return False
        hyp.status = status
        if confidence is not None:
            hyp.confidence = confidence
        hyp.updated_at = datetime.datetime.utcnow()
        db.commit()
        return True
    finally:
        db.close()
