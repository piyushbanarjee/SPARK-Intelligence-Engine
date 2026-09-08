import os
import requests
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.core import Evidence
from app.core.config import settings

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def index_case_evidence(db_session: Session, chroma_client, case_id: str):
    # Fetch extracted evidence for the case
    result = db_session.execute(
        select(Evidence).where(
            Evidence.case_id == case_id,
            Evidence.status == "EXTRACTED"
        )
    )
    evidences = result.scalars().all()
    
    if not evidences:
        return 0

    # Get or create collection
    collection = chroma_client.get_or_create_collection(name=f"case_{case_id}")

    total_chunks = 0
    
    for ev in evidences:
        if not os.path.exists(ev.filepath):
            continue
            
        with open(ev.filepath, "r", encoding="utf-8") as f:
            text = f.read()
            
        chunks = chunk_text(text, chunk_size=500, overlap=50)
        
        # Prepare for ChromaDB
        ids = [f"{ev.id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"evidence_id": str(ev.id), "filename": ev.filename} for _ in chunks]
        
        if chunks:
            collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            total_chunks += len(chunks)
            
    return total_chunks

def query_case_chat(chroma_client, case_id: str, query_text: str):
    collection_name = f"case_{case_id}"
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except Exception:
        return "No indexed evidence found for this case.", []

    results = collection.query(
        query_texts=[query_text],
        n_results=3
    )
    
    retrieved_chunks = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    
    sources = set()
    for meta in metadatas:
        sources.add(meta.get("filename", "Unknown"))
        
    context = "\n\n".join(retrieved_chunks)
    
    prompt = f"""Use the following evidence to answer the question. If the answer is not in the evidence, say "I don't know based on the provided evidence".

Evidence context:
{context}

Question:
{query_text}

Answer:"""

    # Call local Ollama
    ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(ollama_url, json=payload, timeout=60)
        response.raise_for_status()
        answer = response.json().get("response", "No response generated.")
    except Exception as e:
        answer = f"Error communicating with LLM: {str(e)}"
        
    return answer, list(sources)
