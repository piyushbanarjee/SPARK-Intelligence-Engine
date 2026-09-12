import requests
import json
import uuid
import re
from sqlalchemy.orm import Session
import models

def extract_and_store_entities(db: Session, case_id: uuid.UUID, text: str):
    prompt = f"""
    Analyze the following text from a criminal investigation.
    Extract key entities (person, organization, location, phone) and relationships between them.
    Output valid JSON in exactly this format, nothing else:
    {{
        "entities": [
            {{"id": "e1", "name": "John Doe", "type": "person", "risk": "high"}},
            {{"id": "e2", "name": "123 Main St", "type": "location", "risk": "medium"}}
        ],
        "relationships": [
            {{"source": "e1", "target": "e2", "label": "LIVES_AT"}}
        ]
    }}

    Text to analyze:
    {text}
    """
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=120.0
        )
        response.raise_for_status()
        data = response.json()
        
        # Clean the response just in case the LLM wrapped it in markdown code blocks
        content = data.get("response", "")
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        
        parsed = json.loads(content)
        id_map = {}
        
        # 1. Save extracted Entities to DB
        for e in parsed.get("entities", []):
            db_entity = models.Entity(
                case_id=case_id,
                name=e.get("name"),
                type=e.get("type", "unknown").lower(),
                risk=e.get("risk", "medium").lower()
            )
            db.add(db_entity)
            db.flush() # Flush to assign a UUID before committing
            id_map[e.get("id")] = db_entity.id
            
        # 2. Save extracted Relationships using the mapped UUIDs
        for r in parsed.get("relationships", []):
            source_local = r.get("source")
            target_local = r.get("target")
            
            if source_local in id_map and target_local in id_map:
                db_rel = models.Relationship(
                    case_id=case_id,
                    source_id=id_map[source_local],
                    target_id=id_map[target_local],
                    label=r.get("label", "RELATED_TO").upper()
                )
                db.add(db_rel)
                
        db.commit()
    except Exception as e:
        print(f"Failed to extract entities: {e}")
        db.rollback()