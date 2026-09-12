import requests
import chromadb
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

import models
from database import get_db

router = APIRouter()
chroma_client = chromadb.PersistentClient(path="./chroma_db")

class ChatRequest(BaseModel):
    prompt: str

@router.post("/api/v1/cases/{case_id}/chat/")
def chat_with_evidence(case_id: UUID, request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Fetch all Evidence for the case
    evidences = db.query(models.Evidence).filter(models.Evidence.case_id == case_id).all()
    
    if not evidences:
        context_text = "No evidence available for this case."
    else:
        # 2. Upsert extracted text into ChromaDB
        collection = chroma_client.get_or_create_collection(name=f"case_{case_id}")
        
        documents = []
        ids = []
        
        for ev in evidences:
            if ev.extracted_text:
                documents.append(ev.extracted_text)
                ids.append(str(ev.id))
        
        if documents:
            collection.upsert(
                documents=documents,
                ids=ids
            )
            
            # 3. Query ChromaDB
            results = collection.query(
                query_texts=[request.prompt],
                n_results=3
            )
            
            retrieved_docs = results.get("documents", [[]])[0]
            context_text = "\n\n".join(retrieved_docs) if retrieved_docs else "No relevant context found."
        else:
            context_text = "No text extracted from the evidence."

    # 4. Construct unified prompt
    unified_prompt = f"Context:\n{context_text}\n\nQuestion:\n{request.prompt}"
    
    # 5. Send to Ollama
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": unified_prompt,
                "stream": False
            },
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return {"response": data.get("response", "")}
    except Exception:
        # Fallback to prevent UI crash
        return {"response": "System Error: Llama 3.2 offline"}

