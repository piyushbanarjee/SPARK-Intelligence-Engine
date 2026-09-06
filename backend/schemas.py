import json
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, field_validator

# We need custom validation to handle JSON string storage in SQLite
# and parse it back to Python lists/dicts for Pydantic models.

class CaseInfoBase(BaseModel):
    id: str
    code: str
    name: str
    type: str
    unit: str
    lead: str
    victim: str
    suspect: str
    scene: str
    dateOpened: str
    dateClosed: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    id: str
    name: str
    type: str
    size: str
    status: str
    classification: str
    date: str

    model_config = ConfigDict(from_attributes=True)

class EntityBase(BaseModel):
    id: str
    code: str
    name: str
    type: str
    aliases: List[str]
    risk: int
    lastSeen: str
    classification: str
    x: int
    y: int
    summary: str
    sourceRefs: List[str]

    @field_validator('aliases', mode='before')
    @classmethod
    def parse_aliases(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator('sourceRefs', mode='before')
    @classmethod
    def parse_sourceRefs(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = ConfigDict(from_attributes=True)

class GraphEdgeBase(BaseModel):
    id: str
    from_node: str
    to_node: str
    label: str
    style: str
    date: str
    context: str

    model_config = ConfigDict(from_attributes=True)

class TimelineEventBase(BaseModel):
    id: str
    date: str
    time: str
    title: str
    source: str
    category: str
    conflict: bool
    conflictNote: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CaseNoteBase(BaseModel):
    title: str
    category: str
    priority: str
    author: str
    content: str
    refs: List[str]

class CaseNoteCreate(CaseNoteBase):
    pass

class CaseNoteResponse(CaseNoteBase):
    id: str
    pinned: bool
    timestamp: str

    @field_validator('refs', mode='before')
    @classmethod
    def parse_refs(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = ConfigDict(from_attributes=True)
