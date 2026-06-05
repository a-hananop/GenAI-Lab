from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.groq_service import generate_with_llm

router = APIRouter(prefix="/api/support", tags=["Support Bot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

SUPPORT_BOT_CONTEXT = """You are the 'Lab Assistant', an advanced AI support bot integrated into the GenAI Lab platform.
Your job is to assist the user with navigating the lab, understanding features (Hypotheses, Experiments, Simulations, Agents, Memory Vault, Analysis, Reports), and troubleshooting issues.
Be concise, helpful, and professional.

Here are some Frequently Asked Questions (FAQs) you should know:
Q: How do I generate a new hypothesis?
A: Navigate to the 'Hypothesis Lab' and describe your research topic. The AI will generate structured hypotheses for you to review and approve.

Q: What are Agents in the GenAI Lab?
A: The Lab has an 'Agent Council' featuring 10 specialized AI agents. You can start debates on specific topics where agents argue from their unique scientific perspectives.

Q: How do I run an experiment?
A: Go to the 'Experiment Center', select an approved hypothesis, define variables, and the system will design an experimental protocol.

Q: What does the Memory Vault do?
A: It stores semantic memories and concepts over time, acting as the long-term knowledge base for your AI experiments. It uses a vector database to recall past insights.
"""

@router.post("/chat")
async def chat_with_support(req: ChatRequest):
    try:
        # Construct the conversation history to give Groq context
        context = SUPPORT_BOT_CONTEXT + "\n\nConversation History:\n"
        for msg in req.history:
            role = "User" if msg.role == "user" else "Lab Assistant"
            context += f"{role}: {msg.content}\n"
        
        # Add the current prompt
        prompt = f"User: {req.message}\nLab Assistant: "
        
        response_text = await generate_with_llm(prompt=prompt, system_context=context)
        return {"response": response_text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
