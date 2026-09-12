import graph
import re
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from ocr import extract_text_from_image
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import pypdf
import docx
import io

import models
import schemas
from database import engine, get_db
import chat
from extraction import extract_and_store_entities

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SPARK API")
app.include_router(chat.router)
app.include_router(graph.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NLP Extraction Engine ---
def extract_entities(text: str):
    """Basic extraction to populate graph. Upgrade this with an LLM later."""
    entities = []
    # Find names (Two capitalized words)
    names = set(re.findall(r'\b[A-Z][a-z]+\s[A-Z][a-z]+\b', text))
    for name in names:
        if name.lower() not in ["the central", "this is"]: # basic filters
            entities.append({"name": name, "type": "person", "risk": "high"})
    return entities

# --- Routes ---

@app.post("/api/v1/cases/", response_model=schemas.Case)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    db_case = models.Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@app.get("/api/v1/cases/", response_model=List[schemas.Case])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Case).offset(skip).limit(limit).all()

@app.post("/api/v1/cases/{case_id}/evidence/", response_model=schemas.Evidence)
async def create_evidence(case_id: UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    file_bytes = await file.read()
    filename_lower = file.filename.lower()
    
    if filename_lower.endswith('.txt'):
        extracted_text = file_bytes.decode('utf-8', errors='ignore')
    elif filename_lower.endswith('.pdf'):
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = "\n".join(page.extract_text() for page in pdf_reader.pages if page.extract_text())
    elif filename_lower.endswith('.docx'):
        doc = docx.Document(io.BytesIO(file_bytes))
        extracted_text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
    else:
        extracted_text = extract_text_from_image(file_bytes)
    
    # Save Evidence
    db_evidence = models.Evidence(
        case_id=case_id,
        file_name=file.filename,
        file_path=f"/storage/{file.filename}",
        extracted_text=extracted_text
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    
    # Trigger AI Extraction Pipeline
    if extracted_text and extracted_text.strip():
        extract_and_store_entities(db, case_id, extracted_text)
        
    return db_evidence

@app.get("/api/v1/cases/{case_id}/evidence/")
def read_evidence(case_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.Evidence).filter(models.Evidence.case_id == case_id).all()

@app.get("/api/v1/cases/{case_id}/registry/")
def read_registry(case_id: UUID, db: Session = Depends(get_db)):
    # Connects to the Registry tab in your UI
    entities = db.query(models.Entity).filter(models.Entity.case_id == case_id).all()
    return [{"id": str(e.id), "name": e.name, "type": e.type, "risk": e.risk} for e in entities]

@app.post("/api/v1/cases/{case_id}/notes/")
def create_note(case_id: UUID, note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(**note.model_dump(), case_id=case_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.get("/api/v1/cases/{case_id}/notes/")
def read_notes(case_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.Note).filter(models.Note.case_id == case_id).all()