#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def main():
    print("1. Creating test evidence text locally...")
    with open("test_extraction.txt", "w") as f:
        f.write("John Doe met with the Apex Corporation in New York.")
        
    print("\nCreating a user and case for the upload...")
    user_res = requests.post(f"{BASE_URL}/users/", json={
        "badge_number": "NER_U1",
        "role": "ANALYST",
        "password": "pass"
    })
    
    if user_res.status_code == 400 and "already registered" in user_res.text:
        print("User already exists, attempting to proceed...")
        # Since we can't easily fetch user by badge in standard routes, just generate random badge
        import uuid
        user_res = requests.post(f"{BASE_URL}/users/", json={
            "badge_number": f"NER_U_{uuid.uuid4().hex[:6]}",
            "role": "ANALYST",
            "password": "pass"
        })
        
    user_id = user_res.json()["id"]
    
    case_res = requests.post(f"{BASE_URL}/cases/", json={
        "title": "NER Test Case",
        "status": "OPEN",
        "lead_investigator_id": user_id
    })
    case_id = case_res.json()["id"]
    
    print(f"User ID: {user_id}")
    print(f"Case ID: {case_id}")

    print("\n2. Uploading test_extraction.txt to the Case...")
    with open("test_extraction.txt", "rb") as f:
        files = {"file": ("test_extraction.txt", f)}
        data = {"uploader_id": user_id}
        upload_res = requests.post(f"{BASE_URL}/cases/{case_id}/evidence", files=files, data=data)
        
    evidence_id = upload_res.json()["id"]
    print(f"Evidence ID: {evidence_id}")
    
    print("\n3. Triggering the /extract endpoint...")
    # Give it a second if needed, though local DB is fast
    time.sleep(1)
    extract_res = requests.post(f"{BASE_URL}/cases/evidence/{evidence_id}/extract")
    print(f"Extraction Response Status: {extract_res.status_code}")
    print(json.dumps(extract_res.json(), indent=2))
    
    print("\n4. Querying Neo4j directly...")
    from neo4j import GraphDatabase
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "spark_graph_password_2026"))
    
    with driver.session() as session:
        result = session.run("MATCH (e:Entity)-[r:APPEARS_IN]->(d:Document) RETURN e.name, e.label, d.filename")
        print("\n--- Extracted Entities in Neo4j ---")
        for record in result:
            print(f"Entity: {record['e.name']} ({record['e.label']}) -> Document: {record['d.filename']}")
            
    print("\nVerification Complete.")

if __name__ == "__main__":
    main()
