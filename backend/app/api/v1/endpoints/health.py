import time
import requests
import socket
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db, neo4j_driver
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def check_health(db: Session = Depends(get_db)):
    services_status = {}
    overall_status = "HEALTHY"
    status_code = status.HTTP_200_OK
    
    # 1. Test PostgreSQL
    start_time = time.time()
    try:
        db.execute(text("SELECT 1;"))
        latency = round((time.time() - start_time) * 1000, 2)
        services_status["postgres"] = {"status": "CONNECTED", "latency_ms": latency}
    except Exception as e:
        overall_status = "UNHEALTHY"
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        services_status["postgres"] = {"status": f"UNHEALTHY: {str(e)}", "latency_ms": None}

    # 2. Test Neo4j
    start_time = time.time()
    try:
        # Standard timeout for connections is used by default in driver.
        with neo4j_driver.session() as session:
            session.run("RETURN 1 AS ping")
        latency = round((time.time() - start_time) * 1000, 2)
        services_status["neo4j"] = {"status": "CONNECTED", "latency_ms": latency}
    except Exception as e:
        overall_status = "UNHEALTHY"
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        services_status["neo4j"] = {"status": f"UNHEALTHY: {str(e)}", "latency_ms": None}

    # 3. Test ChromaDB via TCP socket
    start_time = time.time()
    try:
        with socket.create_connection((settings.CHROMADB_HOST, settings.CHROMADB_PORT), timeout=3.0):
            pass
        latency = round((time.time() - start_time) * 1000, 2)
        services_status["chromadb"] = {"status": "CONNECTED", "latency_ms": latency}
    except Exception as e:
        overall_status = "UNHEALTHY"
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        services_status["chromadb"] = {"status": f"UNHEALTHY: {str(e)}", "latency_ms": None}

    response_body = {
        "status": overall_status,
        "services": services_status
    }
    
    return JSONResponse(status_code=status_code, content=response_body)
