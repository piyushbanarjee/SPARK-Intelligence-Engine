import uuid
import hashlib
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db, neo4j_driver
from app.core.config import settings
from app.models.core import Case, User, Evidence
from app.schemas.core import EvidenceResponse
from app.services.extraction_service import process_evidence

router = APIRouter()

@router.post("/{case_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    case_id: uuid.UUID,
    uploader_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate case
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Validate user
    user = db.get(User, uploader_id)
    if not user:
        raise HTTPException(status_code=404, detail="Uploader not found")

    # Read and hash file
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Save file to disk
    case_dir = Path(settings.UPLOAD_DIR) / "cases" / str(case_id)
    case_dir.mkdir(parents=True, exist_ok=True)
    
    saved_filename = f"{file_hash}_{file.filename}"
    filepath = case_dir / saved_filename
    
    with open(filepath, "wb") as f:
        f.write(content)

    # Save to DB
    db_evidence = Evidence(
        case_id=case_id,
        uploader_id=uploader_id,
        filename=file.filename,
        filepath=str(filepath),
        file_hash=file_hash
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    
    return db_evidence

@router.get("/{case_id}/evidence", response_model=List[EvidenceResponse])
def list_evidence(case_id: uuid.UUID, db: Session = Depends(get_db)):
    # Validate case exists
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    result = db.execute(select(Evidence).where(Evidence.case_id == case_id))
    return result.scalars().all()

@router.post("/evidence/{evidence_id}/extract")
def extract_evidence(evidence_id: uuid.UUID, db: Session = Depends(get_db)):
    evidence = db.get(Evidence, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
        
    try:
        stats = process_evidence(db, neo4j_driver, evidence_id)
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
