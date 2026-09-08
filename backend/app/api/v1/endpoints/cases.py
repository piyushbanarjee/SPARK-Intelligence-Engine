import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.core import Case
from app.schemas.core import CaseCreate, CaseResponse

router = APIRouter()

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    db_case = Case(
        title=case_in.title,
        status=case_in.status,
        description=case_in.description,
        lead_investigator_id=case_in.lead_investigator_id
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    result = db.execute(select(Case))
    return result.scalars().all()

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: uuid.UUID, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
