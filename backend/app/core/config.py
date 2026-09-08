import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Load from project root .env
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    DB_HOST: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int
    DATABASE_URL: str
    
    NEO4J_URI: str
    NEO4J_USER: str
    NEO4J_PASSWORD: str
    
    CHROMADB_HOST: str
    CHROMADB_PORT: int
    
    OLLAMA_BASE_URL: str
    UPLOAD_DIR: str

    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
