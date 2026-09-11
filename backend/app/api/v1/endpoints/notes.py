import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.core import Case, CaseNote
from app.schemas.core import CaseNoteCreate, CaseNoteResponse

router = APIRouter()

@router.post("/{case_id}/notes/", response_model=CaseNoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    case_id: str, 
    note_in: CaseNoteCreate, 
    db: Session = Depends(get_db)
):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    db_note = CaseNote(
        case_id=case_id,
        author_id=note_in.author_id,
        content=note_in.content
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/{case_id}/notes/", response_model=List[CaseNoteResponse])
def get_notes(
    case_id: str, 
    db: Session = Depends(get_db)
):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    result = db.execute(select(CaseNote).where(CaseNote.case_id == case_id))
    return result.scalars().all()
