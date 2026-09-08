#!/bin/bash

echo "1. Creating a User..."
USER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "12345", "role": "LEAD", "password": "secretpassword"}')
echo $USER_RESPONSE

# Extract user ID
USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo -e "\nUser ID: $USER_ID"

if [ -z "$USER_ID" ]; then
    echo "Failed to extract user ID. Exiting."
    exit 1
fi

echo -e "\n2. Creating a Case assigned to that User..."
CASE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/cases/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Operation Midnight", "status": "OPEN", "description": "Investigation into midnight anomalies.", "lead_investigator_id": "'$USER_ID'"}')
echo $CASE_RESPONSE

echo -e "\n\n3. Fetching the list of Cases..."
curl -s -X GET http://localhost:8000/api/v1/cases/
echo -e "\n\nVerification Complete."
