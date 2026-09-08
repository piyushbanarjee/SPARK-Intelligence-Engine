import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from typing import List, Optional

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    badge_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    role: Mapped[str] = mapped_column(String)
    password_hash: Mapped[str] = mapped_column(String)

    cases: Mapped[List["Case"]] = relationship("Case", back_populates="lead_investigator", foreign_keys="Case.lead_investigator_id")
    case_notes: Mapped[List["CaseNote"]] = relationship("CaseNote", back_populates="author", foreign_keys="CaseNote.author_id")
    uploaded_evidence: Mapped[List["Evidence"]] = relationship("Evidence", back_populates="uploader", foreign_keys="Evidence.uploader_id")

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="OPEN")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    lead_investigator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    lead_investigator: Mapped["User"] = relationship("User", back_populates="cases", foreign_keys=[lead_investigator_id])
    
    notes: Mapped[List["CaseNote"]] = relationship("CaseNote", back_populates="case", cascade="all, delete-orphan", foreign_keys="CaseNote.case_id")
    evidence: Mapped[List["Evidence"]] = relationship("Evidence", back_populates="case", cascade="all, delete-orphan", foreign_keys="Evidence.case_id")

class CaseNote(Base):
    __tablename__ = "case_notes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"))
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    case: Mapped["Case"] = relationship("Case", back_populates="notes", foreign_keys=[case_id])
    author: Mapped["User"] = relationship("User", back_populates="case_notes", foreign_keys=[author_id])

class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"))
    uploader_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String)
    filepath: Mapped[str] = mapped_column(String)
    file_hash: Mapped[str] = mapped_column(String)
    upload_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String, default="PENDING_EXTRACTION")

    case: Mapped["Case"] = relationship("Case", back_populates="evidence", foreign_keys=[case_id])
    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_evidence", foreign_keys=[uploader_id])
