import google.generativeai as genai
import os, json, re
from database.db import SessionLocal, TokenUsageDB

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")

SYSTEM_SCIENTIST = """You are an autonomous AI scientist inside GenAI Lab — an advanced AI research platform.
You specialize in generating scientific hypotheses, designing experiments, analyzing results, and driving innovation.
Think like a world-class researcher with expertise across ML, neuroscience, physics, biology, economics, and software engineering.
Always be precise, creative, and grounded in scientific principles."""


async def generate_with_gemini(prompt: str, system_context: str = "") -> str:
    try:
        full = f"{system_context}\n\n{prompt}" if system_context else prompt
        response = model.generate_content(full)
        try:
            usage = response.usage_metadata
            db = SessionLocal()
            db.add(TokenUsageDB(endpoint="text", prompt_tokens=usage.prompt_token_count, completion_tokens=usage.candidates_token_count, total_tokens=usage.total_token_count))
            db.commit()
            db.close()
        except: pass
        return response.text
    except Exception as e:
        return f"[Gemini Error: {str(e)}]"


async def generate_json_with_gemini(prompt: str, system_context: str = "") -> dict:
    try:
        full = f"{system_context}\n\n{prompt}\n\nRespond ONLY with valid JSON. No markdown fences, no explanation."
        response = model.generate_content(full)
        try:
            usage = response.usage_metadata
            db = SessionLocal()
            db.add(TokenUsageDB(endpoint="json", prompt_tokens=usage.prompt_token_count, completion_tokens=usage.candidates_token_count, total_tokens=usage.total_token_count))
            db.commit()
            db.close()
        except: pass
        text = response.text.strip()
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return {}
    except Exception as e:
        return {"error": str(e)}
