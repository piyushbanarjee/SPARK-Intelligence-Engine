import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    evidences = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="case", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="case", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="case", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    file_name = Column(String)
    file_path = Column(String)
    extracted_text = Column(Text)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="evidences")

class Note(Base):
    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="notes")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    name = Column(String)
    type = Column(String) # person, location, organization
    risk = Column(String, default="medium")
    
    case = relationship("Case", back_populates="entities")

    # Add this under your Entity class
class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    source_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"))
    target_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"))
    label = Column(String) # e.g., "OWNED_BY", "SEEN_AT", "CONTACTED"

    case = relationship("Case", back_populates="relationships")
    source = relationship("Entity", foreign_keys=[source_id])
    target = relationship("Entity", foreign_keys=[target_id])