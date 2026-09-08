import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    badge_number: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

# Case Note Schemas
class CaseNoteBase(BaseModel):
    content: str

class CaseNoteCreate(CaseNoteBase):
    author_id: uuid.UUID
    case_id: uuid.UUID

class CaseNoteResponse(CaseNoteBase):
    id: uuid.UUID
    case_id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Case Schemas
class CaseBase(BaseModel):
    title: str
    status: str = "OPEN"
    description: Optional[str] = None

class CaseCreate(CaseBase):
    lead_investigator_id: uuid.UUID

class CaseResponse(CaseBase):
    id: uuid.UUID
    lead_investigator_id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Evidence Schemas
class EvidenceBase(BaseModel):
    filename: str
    filepath: str
    file_hash: str
    status: str = "PENDING_EXTRACTION"

class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    case_id: uuid.UUID
    uploader_id: uuid.UUID
    upload_time: datetime
    model_config = ConfigDict(from_attributes=True)
