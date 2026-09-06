from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.get("/info", response_model=schemas.CaseInfoBase)
def get_case_info(db: Session = Depends(get_db)):
    case_info = db.query(models.CaseInfo).first()
    if not case_info:
        raise HTTPException(status_code=404, detail="Case info not found")
    return case_info

@router.get("/timeline", response_model=List[schemas.TimelineEventBase])
def get_timeline(db: Session = Depends(get_db)):
    events = db.query(models.TimelineEvent).all()
    return events

@router.get("/registry", response_model=List[schemas.EntityBase])
def get_registry(db: Session = Depends(get_db)):
    entities = db.query(models.Entity).all()
    return entities

@router.get("/graph", response_model=List[schemas.GraphEdgeBase])
def get_graph(db: Session = Depends(get_db)):
    edges = db.query(models.GraphEdge).all()
    return edges
