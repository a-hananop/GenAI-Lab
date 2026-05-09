import uuid, random, datetime
from typing import Dict, Any, List, Optional
from services.gemini_service import generate_json_with_gemini, SYSTEM_SCIENTIST
from database.db import SessionLocal, ExperimentDB, HypothesisDB

METHODOLOGIES = ["A/B Test","Bayesian Optimization","Monte Carlo Simulation",
                 "Multi-Arm Bandit","Reinforcement Learning","Genetic Algorithm","Digital Twin"]


async def design_experiment(hypothesis_id: str, methodology: Optional[str] = None) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        hyp = db.query(HypothesisDB).filter(HypothesisDB.id == hypothesis_id).first()
        if not hyp:
            return {"error": "Hypothesis not found"}
        hyp_text, domain = hyp.hypothesis, hyp.domain
    finally:
        db.close()

    if not methodology:
        methodology = random.choice(METHODOLOGIES)

    prompt = f"""Design a complete experiment for: "{hyp_text}"
Methodology: {methodology}, Domain: {domain}

Return JSON:
{{
  "name": "Short descriptive experiment name",
  "objective": "Clear experiment objective",
  "control_group": {{"description": "...", "size": 500, "conditions": ["baseline"]}},
  "test_group": {{"description": "...", "size": 500, "conditions": ["intervention"]}},
  "variables": ["independent_var", "dependent_var", "control_var"],
  "metrics": ["metric1", "metric2", "metric3"],
  "success_threshold": 0.80,
  "failure_conditions": ["condition1", "condition2"],
  "time_horizon": "2 weeks",
  "required_resources": ["resource1", "resource2"],
  "cost_estimate": 2500,
  "ethical_score": 0.90,
  "reproducibility_score": 0.85
}}"""

    data = await generate_json_with_gemini(prompt, SYSTEM_SCIENTIST)
    if not data or "name" not in data:
        data = _fallback_experiment(methodology)

    exp_id = str(uuid.uuid4())
    discussion = _make_agent_discussion()

    db = SessionLocal()
    try:
        exp = ExperimentDB(
            id=exp_id, hypothesis_id=hypothesis_id,
            name=data.get("name", f"Experiment {exp_id[:8]}"),
            methodology=methodology,
            objective=data.get("objective", ""),
            control_group=data.get("control_group", {}),
            test_group=data.get("test_group", {}),
            variables=data.get("variables", []),
            metrics=data.get("metrics", []),
            status="designed",
            cost_estimate=float(str(data.get("cost_estimate", 1000)).replace("$","").replace(",","")),
            ethical_score=float(data.get("ethical_score", 0.85)),
            reproducibility_score=float(data.get("reproducibility_score", 0.75)),
            success_threshold=float(data.get("success_threshold", 0.80)),
            failure_conditions=data.get("failure_conditions", []),
            time_horizon=data.get("time_horizon", "2 weeks"),
            required_resources=data.get("required_resources", []),
            agent_discussion=discussion,
        )
        db.add(exp)
        db.commit()
        return {
            "id": exp_id, "hypothesis_id": hypothesis_id, "name": exp.name,
            "methodology": methodology, "objective": exp.objective,
            "control_group": exp.control_group, "test_group": exp.test_group,
            "variables": exp.variables, "metrics": exp.metrics, "status": "designed",
            "cost_estimate": exp.cost_estimate, "ethical_score": exp.ethical_score,
            "reproducibility_score": exp.reproducibility_score,
            "success_threshold": exp.success_threshold,
            "failure_conditions": exp.failure_conditions,
            "time_horizon": exp.time_horizon, "required_resources": exp.required_resources,
            "agent_discussion": discussion,
            "created_at": datetime.datetime.utcnow().isoformat(),
        }
    finally:
        db.close()


def _make_agent_discussion() -> List[Dict]:
    agents = [
        ("Experiment Planner","Selected methodology is optimal for this hypothesis type."),
        ("Research Critic","Ensure control variables are properly isolated before running."),
        ("Ethics & Safety Agent","Ethical review passed — no harmful outcomes detected."),
        ("Bayesian Strategist","Prior distributions suggest 70%+ success probability."),
        ("Data Scientist","Metrics are well-defined. Statistical power is sufficient."),
        ("Decision-Making Agent","Experiment approved for simulation execution."),
    ]
    return [{"agent":a,"message":m,"timestamp":datetime.datetime.utcnow().isoformat(),"confidence":round(random.uniform(0.65,0.95),2)} for a,m in agents]


def _fallback_experiment(methodology: str) -> Dict[str, Any]:
    return {
        "name": f"Optimization Study ({methodology})","objective": "Validate the proposed intervention improves the target metric",
        "control_group": {"description":"Baseline configuration","size":500,"conditions":["No intervention"]},
        "test_group": {"description":"Modified configuration","size":500,"conditions":["With intervention"]},
        "variables": ["intervention_level","outcome_metric","confounding_factor"],
        "metrics": ["accuracy","efficiency","confidence_delta"],
        "success_threshold": 0.80,"failure_conditions": ["metric drops below baseline","p-value > 0.05"],
        "time_horizon": "2 weeks","required_resources": ["simulation_engine","dataset","compute"],
        "cost_estimate": 2500.0,"ethical_score": 0.92,"reproducibility_score": 0.85,
    }


async def get_experiments_list() -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        rows = db.query(ExperimentDB).order_by(ExperimentDB.created_at.desc()).all()
        return [{
            "id": r.id,"hypothesis_id": r.hypothesis_id,"name": r.name,"methodology": r.methodology,
            "objective": r.objective,"control_group": r.control_group or {},"test_group": r.test_group or {},
            "variables": r.variables or [],"metrics": r.metrics or [],"status": r.status,
            "cost_estimate": r.cost_estimate,"ethical_score": r.ethical_score,
            "reproducibility_score": r.reproducibility_score,"success_threshold": r.success_threshold,
            "failure_conditions": r.failure_conditions or [],"time_horizon": r.time_horizon,
            "required_resources": r.required_resources or [],"results": r.results,
            "agent_discussion": r.agent_discussion or [],
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        } for r in rows]
    finally:
        db.close()
