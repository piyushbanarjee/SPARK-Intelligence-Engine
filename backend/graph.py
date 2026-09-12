from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

import models
from database import get_db

router = APIRouter()

@router.get("/api/v1/cases/{case_id}/graph/")
def get_graph_data(case_id: UUID, db: Session = Depends(get_db)):
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")

    nodes = []
    links = []
    case_id_str = str(db_case.id)

    # 1. Central Case Node
    nodes.append({
        "id": case_id_str,
        "name": db_case.title,
        "group": "case"
    })

    # 2. Evidence Nodes & Links
    evidences = db.query(models.Evidence).filter(models.Evidence.case_id == case_id).all()
    for ev in evidences:
        ev_id_str = str(ev.id)
        nodes.append({
            "id": ev_id_str,
            "name": ev.file_name,
            "group": "evidence"
        })
        links.append({
            "source": ev_id_str,
            "target": case_id_str
        })

    # 3. Note Nodes & Links
    notes = db.query(models.Note).filter(models.Note.case_id == case_id).all()
    for note in notes:
        note_id_str = str(note.id)
        label = note.content[:30] + "..." if len(note.content) > 30 else note.content
        nodes.append({
            "id": note_id_str,
            "name": label,
            "group": "note"
        })
        links.append({
            "source": note_id_str,
            "target": case_id_str
        })

        # Add this to the end of get_graph_data() before the return statement

    # 4. Extract Entity Nodes
    entities = db.query(models.Entity).filter(models.Entity.case_id == case_id).all()
    for ent in entities:
        ent_id_str = str(ent.id)
        nodes.append({
            "id": ent_id_str,
            "name": ent.name,
            "group": "entity",
            "type": ent.type,
            "risk": ent.risk
        })
        
    # 5. Extract Complex Entity Relationships
    # (Checking for hasattr handles cases if models.Relationship isn't migrated yet)
    if hasattr(models, 'Relationship'):
        relationships = db.query(models.Relationship).filter(models.Relationship.case_id == case_id).all()
        for rel in relationships:
            links.append({
                "source": str(rel.source_id),
                "target": str(rel.target_id),
                "label": rel.label
            })
            
    return {"nodes": nodes, "links": links}