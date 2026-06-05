import os, json, re
from groq import AsyncGroq
from database.db import SessionLocal, TokenUsageDB

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# We will use llama-3.3-70b-versatile for high capability reasoning and JSON structuring
MODEL_NAME = "llama-3.3-70b-versatile"

SYSTEM_SCIENTIST = """You are an autonomous AI scientist inside GenAI Lab — an advanced AI research platform.
You specialize in generating scientific hypotheses, designing experiments, analyzing results, and driving innovation.
Think like a world-class researcher with expertise across ML, neuroscience, physics, biology, economics, and software engineering.
Always be precise, creative, and grounded in scientific principles."""


async def generate_with_llm(prompt: str, system_context: str = "") -> str:
    try:
        messages = []
        if system_context:
            messages.append({"role": "system", "content": system_context})
        messages.append({"role": "user", "content": prompt})
        
        response = await client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
        )
        try:
            usage = response.usage
            if usage:
                db = SessionLocal()
                db.add(TokenUsageDB(
                    endpoint="text", 
                    prompt_tokens=usage.prompt_tokens, 
                    completion_tokens=usage.completion_tokens, 
                    total_tokens=usage.total_tokens
                ))
                db.commit()
                db.close()
        except: pass
        return response.choices[0].message.content
    except Exception as e:
        return f"[Groq Error: {str(e)}]"


async def generate_json_with_llm(prompt: str, system_context: str = "") -> dict:
    try:
        messages = []
        if system_context:
            messages.append({"role": "system", "content": system_context})
        messages.append({"role": "user", "content": prompt + "\n\nRespond ONLY with a valid JSON object. No markdown fences, no explanation."})
        
        response = await client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        try:
            usage = response.usage
            if usage:
                db = SessionLocal()
                db.add(TokenUsageDB(
                    endpoint="json", 
                    prompt_tokens=usage.prompt_tokens, 
                    completion_tokens=usage.completion_tokens, 
                    total_tokens=usage.total_tokens
                ))
                db.commit()
                db.close()
        except: pass
        
        text = response.choices[0].message.content.strip()
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return {}
    except Exception as e:
        return {"error": str(e)}
