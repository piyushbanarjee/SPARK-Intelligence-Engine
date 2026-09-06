import os
from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from google.genai import types

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str

SYSTEM_PROMPT = "You are SPARK Neural Copilot assisting Lead Inspector Arjun Mehta on Case #CF-2026-017 (Rohan Kapoor Homicide). Keep answers tactical, bulleted, and precise."

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        # Fallback if API key is not set to prevent UI crashes during demo
        return ChatResponse(
            response="[OFFLINE MODE] Neural Copilot is currently offline. Please configure GEMINI_API_KEY to access active intelligence."
        )
        
    try:
        client = genai.Client(api_key=api_key)
        
        # In a real app, you might want to maintain conversation history
        # Here we just generate a response for the single query
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=request.query,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            )
        )
        return ChatResponse(response=response.text)
        
    except Exception as e:
        # Fallback for any API errors
        return ChatResponse(
            response=f"[ERROR] Neural Copilot encountered an anomaly: {str(e)}"
        )
