import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class CaseInfo(Base):
    __tablename__ = "case_info"
    id = Column(String, primary_key=True, index=True)
    code = Column(String)
    name = Column(String)
    type = Column(String)
    unit = Column(String)
    lead = Column(String)
    victim = Column(String)
    suspect = Column(String)
    scene = Column(String)
    dateOpened = Column(String)
    dateClosed = Column(String, nullable=True)
    status = Column(String)

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    size = Column(String)
    status = Column(String)
    classification = Column(String)
    date = Column(String)

class Entity(Base):
    __tablename__ = "entities"
    id = Column(String, primary_key=True, index=True)
    code = Column(String)
    name = Column(String)
    type = Column(String)
    aliases = Column(String) # Stored as JSON string
    risk = Column(Integer)
    lastSeen = Column(String)
    classification = Column(String)
    x = Column(Integer)
    y = Column(Integer)
    summary = Column(String)
    sourceRefs = Column(String) # Stored as JSON string

class GraphEdge(Base):
    __tablename__ = "graph_edges"
    id = Column(String, primary_key=True, index=True)
    from_node = Column(String)
    to_node = Column(String)
    label = Column(String)
    style = Column(String)
    date = Column(String)
    context = Column(String)

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(String, primary_key=True, index=True)
    date = Column(String)
    time = Column(String)
    title = Column(String)
    source = Column(String)
    category = Column(String)
    conflict = Column(Boolean)
    conflictNote = Column(String, nullable=True)

class CaseNote(Base):
    __tablename__ = "case_notes"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    priority = Column(String)
    pinned = Column(Boolean, default=False)
    timestamp = Column(String)
    author = Column(String)
    content = Column(String)
    refs = Column(String) # Stored as JSON string
