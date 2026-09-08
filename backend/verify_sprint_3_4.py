import requests
import time
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def check_res(res, step_name):
    if res.status_code not in [200, 201]:
        print(f"\n[ERROR] {step_name} failed with HTTP Status: {res.status_code}")
        try:
            print(f"Backend Error Message:\n{json.dumps(res.json(), indent=2)}")
        except Exception:
            print(f"Response text: {res.text}")
        sys.exit(1)
    return res.json()

print("--- S.P.A.R.K. END-TO-END PIPELINE TEST ---")

print("\n1. Creating User and Case (PostgreSQL)...")
user_payload = {"badge_number": f"RAG_{int(time.time())}", "role": "LEAD", "password": "test"}
user_res = check_res(requests.post(f"{BASE_URL}/users/", json=user_payload), "User Creation")
user_id = user_res['id']

case_payload = {"title": "Endgame Investigation", "status": "OPEN", "description": "Testing the full pipeline.", "lead_investigator_id": user_id}
case_res = check_res(requests.post(f"{BASE_URL}/cases/", json=case_payload), "Case Creation")
case_id = case_res['id']

print(f"\n2. Uploading Evidence to Case {case_id} (Disk + PostgreSQL)...")
with open("final_evidence.txt", "w") as f:
    f.write("During the surveillance operation on Tuesday, John Doe was seen meeting with the executives of the Apex Corporation in New York to discuss the midnight anomalies.")

with open("final_evidence.txt", "rb") as f:
    files = {"file": ("final_evidence.txt", f, "text/plain")}
    data = {"uploader_id": user_id}
    evidence_res = check_res(requests.post(f"{BASE_URL}/cases/{case_id}/evidence", files=files, data=data), "Evidence Upload")
evidence_id = evidence_res['id']

print(f"\n3. Extracting Entities (spaCy -> Neo4j)...")
# Auto-discover correct extraction route path
extract_paths = [
    f"{BASE_URL}/evidence/{evidence_id}/extract",
    f"{BASE_URL}/cases/evidence/{evidence_id}/extract",
    f"{BASE_URL}/evidence/extract/{evidence_id}"
]

ext_res = None
for path in extract_paths:
    res = requests.post(path)
    if res.status_code in [200, 201]:
        ext_res = res.json()
        print(f"   Successfully hit route: {path}")
        break

if not ext_res:
    print(f"\n[ERROR] Entity Extraction failed across all known paths.")
    sys.exit(1)

print(f"   Entities found: {ext_res.get('stats', {}).get('entities_found', 0)}")

print("\n4. Indexing Text Chunks (ChromaDB)...")
index_res = check_res(requests.post(f"{BASE_URL}/cases/{case_id}/index"), "ChromaDB Indexing")
print(f"   Chunks indexed: {index_res.get('chunks_indexed', 0)}")

print("\n5. Querying local Llama 3.2 via Ollama...")
query_payload = {"query": "Who did John Doe meet with, and where?"}
print(f"   Question: {query_payload['query']}")

start_time = time.time()
chat_res = check_res(requests.post(f"{BASE_URL}/cases/{case_id}/chat", json=query_payload), "LLM Chat")
elapsed = time.time() - start_time

print(f"\n--- LLM Response (Took {elapsed:.2f}s) ---")
print(chat_res.get('response', json.dumps(chat_res, indent=2)))
print("\n--- Sources Cited ---")
print(chat_res.get('sources', []))