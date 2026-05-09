import uuid, random, datetime
from engines.hypothesis_engine import generate_hypothesis
from engines.experiment_engine import design_experiment
from engines.simulation_engine import run_simulation
from engines.memory_engine import store_memory
from database.db import SessionLocal, ResearchLoopDB

loop_count = 0
is_running = False

SIM_MAP = {
    "A/B Test":"ab_test","Bayesian Optimization":"bayesian","Monte Carlo Simulation":"monte_carlo",
    "Multi-Arm Bandit":"multi_arm_bandit","Reinforcement Learning":"reinforcement_learning",
    "Genetic Algorithm":"genetic_algorithm","Digital Twin":"monte_carlo",
}


async def run_research_loop():
    global loop_count, is_running
    if is_running:
        return {"status":"already_running"}
    is_running = True
    loop_count += 1
    loop_id = str(uuid.uuid4())
    try:
        domain = random.choice(["machine_learning","neuroscience","economics","biology","physics","climate_science"])
        hyp = await generate_hypothesis(domain=domain)
        hyp_id = hyp.get("id")

        exp = await design_experiment(hyp_id)
        exp_id = exp.get("id")

        sim_type = SIM_MAP.get(exp.get("methodology","Monte Carlo Simulation"),"monte_carlo")
        sim = await run_simulation(exp_id, sim_type, {}, iterations=150)

        success = sim.get("results",{}).get("success", False)
        outcome = "success" if success else "failure"

        await store_memory(
            memory_type="experiment",
            title=f"Loop #{loop_count}: {hyp.get('hypothesis','')[:60]}",
            content=f"Domain: {domain}\nHypothesis: {hyp.get('hypothesis','')}\nOutcome: {outcome}\nInsights: {sim.get('insights','')}",
            tags=[domain, exp.get("methodology",""), outcome],
            outcome=outcome,
            confidence=hyp.get("confidence",50)/100,
            related_ids=[hyp_id, exp_id],
        )

        db = SessionLocal()
        try:
            db.add(ResearchLoopDB(
                id=loop_id, loop_number=loop_count,
                hypothesis_id=hyp_id, experiment_id=exp_id,
                simulation_id=sim.get("id"), outcome=outcome,
                insights=sim.get("insights",""),
                improvement_suggestions=["Refine variables","Increase sample size","Try alternate methodology"],
            ))
            db.commit()
        finally:
            db.close()

        return {"loop_id":loop_id,"loop_number":loop_count,"hypothesis_id":hyp_id,
                "experiment_id":exp_id,"outcome":outcome,"insights":sim.get("insights",""),
                "timestamp":datetime.datetime.utcnow().isoformat()}
    finally:
        is_running = False


async def get_loop_history():
    db = SessionLocal()
    try:
        rows = db.query(ResearchLoopDB).order_by(ResearchLoopDB.created_at.desc()).limit(20).all()
        return [{"id":r.id,"loop_number":r.loop_number,"hypothesis_id":r.hypothesis_id,
                 "experiment_id":r.experiment_id,"outcome":r.outcome,"insights":r.insights,
                 "improvement_suggestions":r.improvement_suggestions or [],
                 "created_at":r.created_at.isoformat() if r.created_at else None} for r in rows]
    finally:
        db.close()


def get_loop_status():
    return {"is_running":is_running,"loops_completed":loop_count}
