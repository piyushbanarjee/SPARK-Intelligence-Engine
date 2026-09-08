import os
import spacy
from sqlalchemy.orm import Session
from app.models.core import Evidence

# Load the spaCy model globally to avoid loading it on every request
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback to downloading if not present (not recommended in prod, but helpful here)
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def process_evidence(db_session: Session, neo4j_driver, evidence_id):
    # 1. Fetch Evidence
    evidence = db_session.get(Evidence, evidence_id)
    if not evidence:
        raise ValueError("Evidence not found")

    # 2. Read file contents
    if not os.path.exists(evidence.filepath):
        raise FileNotFoundError(f"File not found: {evidence.filepath}")
        
    with open(evidence.filepath, "r", encoding="utf-8") as f:
        text = f.read()

    # 3. Run spaCy NLP
    doc = nlp(text)
    
    # Filter entities for PERSON, ORG, GPE, LOC
    allowed_labels = {"PERSON", "ORG", "GPE", "LOC"}
    extracted_entities = []
    
    # Use a set to avoid duplicating relationships for the same entity in one document
    seen_entities = set()
    
    for ent in doc.ents:
        if ent.label_ in allowed_labels:
            # Normalize name (strip whitespace, etc.)
            name = ent.text.strip()
            if not name:
                continue
                
            entity_key = (name, ent.label_)
            if entity_key not in seen_entities:
                seen_entities.add(entity_key)
                extracted_entities.append({"name": name, "label": ent.label_})

    # 4. Open Neo4j session and run Cypher
    doc_id = str(evidence.id)
    filename = evidence.filename
    
    with neo4j_driver.session() as session:
        # Create Document node
        session.run(
            "MERGE (d:Document {id: $doc_id}) SET d.filename = $filename",
            doc_id=doc_id,
            filename=filename
        )
        
        if extracted_entities:
            # Create Entity nodes and relationships
            cypher_query = """
            MATCH (d:Document {id: $doc_id})
            UNWIND $entities AS ent
            MERGE (e:Entity {name: ent.name, label: ent.label})
            MERGE (e)-[:APPEARS_IN]->(d)
            """
            session.run(
                cypher_query,
                doc_id=doc_id,
                entities=extracted_entities
            )

    # 5. Update Evidence status in PostgreSQL
    evidence.status = "EXTRACTED"
    db_session.commit()

    # 6. Return stats
    return {
        "entities_found": len(extracted_entities),
        "document_id": doc_id,
        "status": "EXTRACTED"
    }
