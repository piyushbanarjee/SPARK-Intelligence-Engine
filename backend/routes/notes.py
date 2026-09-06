import uuid
import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.CaseNoteResponse])
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(models.CaseNote).all()
    return notes

@router.post("/", response_model=schemas.CaseNoteResponse)
def create_note(note: schemas.CaseNoteCreate, db: Session = Depends(get_db)):
    note_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    new_note = models.CaseNote(
        id=note_id,
        title=note.title,
        category=note.category,
        priority=note.priority,
        author=note.author,
        content=note.content,
        refs=json.dumps(note.refs),
        timestamp=timestamp,
        pinned=False
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return new_note

@router.put("/{note_id}/pin", response_model=schemas.CaseNoteResponse)
def toggle_pin(note_id: str, db: Session = Depends(get_db)):
    note = db.query(models.CaseNote).filter(models.CaseNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note.pinned = not note.pinned
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(models.CaseNote).filter(models.CaseNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
