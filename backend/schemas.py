from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# --- Evidence Schemas ---
class EvidenceCreate(BaseModel):
    file_name: str
    file_path: str
    extracted_text: Optional[str] = None

class Evidence(BaseModel):
    id: UUID
    case_id: UUID
    file_name: str
    file_path: str
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Note Schemas ---
class NoteCreate(BaseModel):
    content: str

class Note(BaseModel):
    id: UUID
    case_id: UUID
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Case Schemas ---
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Case(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CaseWithDetails(Case):
    notes: List[Note] = []
    evidences: List[Evidence] = []
    
    model_config = ConfigDict(from_attributes=True)

