from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import health, users, cases, evidence, chat
from app.core.database import engine
from app.models.core import Base

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(title="S.P.A.R.K. Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["Cases"])
app.include_router(evidence.router, prefix="/api/v1/cases", tags=["Evidence"])
app.include_router(chat.router, prefix="/api/v1/cases", tags=["Chat"])
