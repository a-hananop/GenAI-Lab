import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from services.groq_service import generate_json_with_llm, SYSTEM_SCIENTIST

async def main():
    print("GROQ API KEY:", os.getenv("GROQ_API_KEY"))
    prompt = "Generate a scientific hypothesis for testing machine learning convergence."
    data = await generate_json_with_llm(prompt, SYSTEM_SCIENTIST)
    print("RESULT:", data)

if __name__ == "__main__":
    asyncio.run(main())
