from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from neo4j import GraphDatabase
import chromadb

from app.core.config import settings

# PostgreSQL Initialization
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    connect_args={"connect_timeout": 3}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Neo4j Initialization
neo4j_driver = GraphDatabase.driver(
    settings.NEO4J_URI, 
    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
)

# ChromaDB Initialization
chroma_client = chromadb.HttpClient(
    host=settings.CHROMADB_HOST, 
    port=settings.CHROMADB_PORT
)
