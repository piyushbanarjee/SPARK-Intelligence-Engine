import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import case, documents, notes, ai_copilot
from seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if database file exists, if not, seed it.
    db_file = "./spark.db"
    if not os.path.exists(db_file):
        print("Database not found. Initializing and seeding...")
        seed_db()
    else:
        print("Database already exists. Skipping seed.")
    yield
    # Cleanup on shutdown can go here if needed

app = FastAPI(
    title="SPARK Intelligence System API",
    description="Backend API for the SPARK case management dashboard.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], # Allow explicit and all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(case.router, prefix="/api/case", tags=["case"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(ai_copilot.router, prefix="/api/copilot", tags=["ai_copilot"])

@app.get("/")
def root():
    return {"message": "SPARK Intelligence System API is running. Access /docs for Swagger UI."}
