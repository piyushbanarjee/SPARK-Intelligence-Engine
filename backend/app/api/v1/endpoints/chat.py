import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db, chroma_client
from app.services.rag_service import index_case_evidence, query_case_chat

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

@router.post("/{case_id}/index")
def index_case(case_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        chunks_indexed = index_case_evidence(db, chroma_client, str(case_id))
        return {"status": "success", "chunks_indexed": chunks_indexed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{case_id}/chat")
def chat_with_case(case_id: uuid.UUID, chat_query: ChatQuery):
    try:
        answer, sources = query_case_chat(chroma_client, str(case_id), chat_query.query)
        return {"answer": answer, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
