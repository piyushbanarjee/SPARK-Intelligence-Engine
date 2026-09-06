import asyncio
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[schemas.DocumentBase])
def get_documents(db: Session = Depends(get_db)):
    docs = db.query(models.Document).all()
    return docs

@router.post("/upload", response_model=schemas.DocumentBase)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Simulate processing time
    await asyncio.sleep(1)
    
    # Generate mock document metadata
    doc_id = str(uuid.uuid4())
    new_doc = models.Document(
        id=doc_id,
        name=file.filename,
        type=file.content_type or "application/octet-stream",
        size="Unknown", # Real implementation would calculate size
        status="Processed",
        classification="Unclassified",
        date=datetime.now().strftime("%Y-%m-%d")
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return new_doc
