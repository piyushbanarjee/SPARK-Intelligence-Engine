from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.core import User
from app.schemas.core import UserCreate, UserResponse

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user with badge_number exists
    existing = db.execute(select(User).where(User.badge_number == user_in.badge_number)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Badge number already registered")
        
    # TODO: Hash password using passlib when it's integrated
    db_user = User(
        badge_number=user_in.badge_number,
        role=user_in.role,
        password_hash=user_in.password # Plain storage for now
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
