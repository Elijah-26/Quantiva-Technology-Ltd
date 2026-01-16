#!/bin/bash

# API Testing Script for Report Run System
# Usage: ./test-api.sh

set -e

BASE_URL="http://localhost:3000"
SCHEDULE_ID="test_schedule_$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=========================================="
echo "🧪 Testing Report Run API"
echo "=========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Schedule ID: $SCHEDULE_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: POST First Run
echo "----------------------------------------"
echo "Test 1: POST /api/report-run (First Run)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/report-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"schedule_id\": \"$SCHEDULE_ID\",
    \"industry\": \"Technology & Software\",
    \"sub_niche\": \"AI-powered CRM software\",
    \"frequency\": \"weekly\",
    \"run_at\": \"$TIMESTAMP\",
    \"is_first_run\": true,
    \"final_report\": \"<h1>Test Report #1</h1><p>This is the first test report.</p>\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
sleep 1

# Test 2: POST Subsequent Run
echo "----------------------------------------"
echo "Test 2: POST /api/report-run (Subsequent Run)"
echo "----------------------------------------"

TIMESTAMP2=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/report-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"schedule_id\": \"$SCHEDULE_ID\",
    \"industry\": \"Technology & Software\",
    \"sub_niche\": \"AI-powered CRM software\",
    \"frequency\": \"weekly\",
    \"run_at\": \"$TIMESTAMP2\",
    \"is_first_run\": false,
    \"final_report\": \"<h1>Test Report #2</h1><p>This is the second test report.</p>\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
sleep 1

# Test 3: GET Reports
echo "----------------------------------------"
echo "Test 3: GET /api/reports/:schedule_id"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/reports/$SCHEDULE_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
  
  # Check if we got 2 executions
  EXEC_COUNT=$(echo "$BODY" | jq '.total_executions')
  if [ "$EXEC_COUNT" = "2" ]; then
    echo -e "\n${GREEN}✓ Verified: 2 executions found${NC}"
  else
    echo -e "\n${YELLOW}⚠ Warning: Expected 2 executions, found $EXEC_COUNT${NC}"
  fi
else
  echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
sleep 1

# Test 4: Validation Error
echo "----------------------------------------"
echo "Test 4: Validation Error (Missing Fields)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/report-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"schedule_id\": \"$SCHEDULE_ID\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓ Correctly returned 400${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 400, got $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
sleep 1

# Test 5: Invalid Frequency
echo "----------------------------------------"
echo "Test 5: Validation Error (Invalid Frequency)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/report-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"schedule_id\": \"$SCHEDULE_ID\",
    \"industry\": \"Technology\",
    \"sub_niche\": \"AI\",
    \"frequency\": \"hourly\",
    \"run_at\": \"$TIMESTAMP\",
    \"is_first_run\": false,
    \"final_report\": \"Test\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓ Correctly returned 400${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 400, got $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
sleep 1

# Test 6: Method Not Allowed
echo "----------------------------------------"
echo "Test 6: Method Not Allowed (GET on POST endpoint)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/report-run")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "405" ]; then
  echo -e "${GREEN}✓ Correctly returned 405${NC} (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 405, got $HTTP_CODE${NC}"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ All tests passed!${NC}"
echo "=========================================="
echo ""
echo "Test schedule ID: $SCHEDULE_ID"
echo "Check the data directory for stored files:"
echo "  - data/schedules/$SCHEDULE_ID.json"
echo "  - data/executions/$SCHEDULE_ID.json"
echo ""

