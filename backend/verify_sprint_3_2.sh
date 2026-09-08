#!/bin/bash

echo "1. Creating test_evidence.txt locally..."
echo "This is test evidence for SPARK." > test_evidence.txt

echo "Creating a user and case for the upload..."
USER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "EVID_U1", "role": "ANALYST", "password": "pass"}')
USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$USER_ID" ]; then
    echo "Failed to create/extract user."
    exit 1
fi

CASE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/cases/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Evidence Test Case", "status": "OPEN", "description": "Testing evidence ingestion.", "lead_investigator_id": "'$USER_ID'"}')
CASE_ID=$(echo $CASE_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

echo "User ID: $USER_ID"
echo "Case ID: $CASE_ID"

echo -e "\n2. Uploading test_evidence.txt to the Case..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/cases/$CASE_ID/evidence \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "uploader_id=$USER_ID" \
  -F "file=@test_evidence.txt")
echo $UPLOAD_RESPONSE

echo -e "\n\n3. Fetching the list of evidence for the case..."
curl -s -X GET http://localhost:8000/api/v1/cases/$CASE_ID/evidence

echo -e "\n\nVerification Complete."
