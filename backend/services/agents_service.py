import random, datetime
from typing import Dict, Any, List
from services.gemini_service import generate_json_with_gemini, SYSTEM_SCIENTIST

AGENTS = [
    {"id":"hypothesis_agent","name":"Hypothesis Agent","role":"Generates novel scientific hypotheses","icon":"🧬","color":"#8B5CF6"},
    {"id":"experiment_planner","name":"Experiment Planner","role":"Designs optimal experiments","icon":"🔬","color":"#06B6D4"},
    {"id":"simulation_agent","name":"Simulation Agent","role":"Executes simulations and models","icon":"⚡","color":"#F59E0B"},
    {"id":"data_scientist","name":"Data Scientist","role":"Statistical analysis and insights","icon":"📊","color":"#10B981"},
    {"id":"rl_optimizer","name":"RL Optimization Agent","role":"Reinforcement learning strategies","icon":"🤖","color":"#EF4444"},
    {"id":"bayesian_strategist","name":"Bayesian Strategist","role":"Probabilistic reasoning","icon":"📐","color":"#3B82F6"},
    {"id":"research_critic","name":"Research Critic","role":"Challenges assumptions, improves methodology","icon":"🔍","color":"#EC4899"},
    {"id":"ethics_agent","name":"Ethics & Safety Agent","role":"Evaluates risk and compliance","icon":"🛡️","color":"#14B8A6"},
    {"id":"memory_agent","name":"Memory Agent","role":"Maintains long-term research memory","icon":"🧠","color":"#A855F7"},
    {"id":"decision_agent","name":"Decision-Making Agent","role":"Final synthesis and action selection","icon":"⚖️","color":"#F97316"},
]


def get_agents_status() -> List[Dict[str, Any]]:
    return [{**a, "status":random.choice(["active","active","active","idle","thinking"]),
             "tasks_completed":random.randint(5,150), "confidence":round(random.uniform(0.72,0.97),2),
             "last_action":f"Processed at {datetime.datetime.utcnow().strftime('%H:%M:%S')} UTC"} for a in AGENTS]


async def run_agent_debate(topic: str, directive: str = "") -> Dict[str, Any]:
    names = [a["name"] for a in AGENTS]
    directive_prompt = f'\n\nLead Scientist Directive (YOU MUST CONSIDER THIS): "{directive}"' if directive else ""
    prompt = f"""Simulate a rigorous scientific debate among 10 AI research agents about:
"{topic}"{directive_prompt}

Agents: {', '.join(names)}

Return JSON:
{{
  "topic": "{topic}",
  "debate_rounds": [
    {{"agent":"Agent Name","message":"2-3 sentence scientific perspective","confidence":0.85,"vote":"approve|reject|abstain"}},
    ... (one entry per agent, all 10)
  ],
  "consensus": "Final consensus decision (1-2 sentences)",
  "winning_strategy": "The agreed best approach",
  "dissenting_opinions": ["Any notable disagreement"],
  "confidence_score": 0.82
}}"""

    data = await generate_json_with_gemini(prompt, SYSTEM_SCIENTIST)
    if not data or "debate_rounds" not in data:
        data = _fallback_debate(topic)

    color_map = {a["name"]:a["color"] for a in AGENTS}
    for r in data.get("debate_rounds",[]):
        r["timestamp"] = datetime.datetime.utcnow().isoformat()
        r["color"] = color_map.get(r.get("agent",""),"#8B5CF6")
    return data


def _fallback_debate(topic: str) -> Dict[str, Any]:
    return {
        "topic": topic,
        "debate_rounds": [{"agent":a["name"],"message":f"From a {a['role'].lower()} perspective, this requires careful experimental validation with rigorous controls.","confidence":round(random.uniform(0.65,0.95),2),"vote":random.choice(["approve","approve","approve","reject","abstain"]),"color":a["color"],"timestamp":datetime.datetime.utcnow().isoformat()} for a in AGENTS],
        "consensus":"Majority voted to proceed with further investigation using Bayesian optimization.",
        "winning_strategy":"Bayesian optimization with multi-arm bandit exploration phase.",
        "dissenting_opinions":["Research Critic suggests more control variables are needed"],
        "confidence_score":0.78,
    }
