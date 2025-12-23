#!/bin/bash

# SOS Service Refactor - Verification Checklist
# Run this script to verify all changes are in place

echo "🔍 SOS Service Refactor - Verification Report"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Function to check file content
check_file_contains() {
  local file=$1
  local pattern=$2
  local description=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description"
    echo "  File: $file"
    echo "  Looking for: $pattern"
    ((FAILED++))
  fi
}

# Function to check file exists
check_file_exists() {
  local file=$1
  local description=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description"
    echo "  Missing: $file"
    ((FAILED++))
  fi
}

echo "📋 Checking Schema Updates..."
echo "---"

# SOS Schema
check_file_contains "src/modules/sos/sos.mongo.schema.ts" "cityId.*required.*true" "SOS schema has cityId field"
check_file_contains "src/modules/sos/sos.mongo.schema.ts" "ACTIVE.*EN_ROUTE.*ARRIVED.*RESOLVED.*CANCELLED" "SOS schema has correct status enum"
check_file_contains "src/modules/sos/sos.mongo.schema.ts" "lastKnownLocation" "SOS schema has lastKnownLocation"
check_file_contains "src/modules/sos/sos.mongo.schema.ts" "2dsphere" "SOS schema has 2dsphere index"

echo ""
echo "📍 Checking Location Schema..."
echo "---"

# Location Schema
check_file_contains "src/modules/tracking/location.mongo.schema.ts" "cityId.*required.*true" "Location schema has cityId field"
check_file_contains "src/modules/tracking/location.mongo.schema.ts" "location.*Point" "Location schema uses GeoJSON"
check_file_contains "src/modules/tracking/location.mongo.schema.ts" "2dsphere" "Location schema has 2dsphere index"
check_file_contains "src/modules/tracking/location.mongo.schema.ts" "expireAfterSeconds.*2592000" "Location schema has TTL index"

echo ""
echo "💬 Checking Message Schema..."
echo "---"

# Message Schema
check_file_contains "src/modules/messages/message.mongo.schema.ts" "cityId.*required.*true" "Message schema has cityId field"
check_file_contains "src/modules/messages/message.mongo.schema.ts" "sosId.*1.*createdAt.*-1" "Message schema has compound index"

echo ""
echo "🎯 Checking Type Definitions..."
echo "---"

# Type definitions
check_file_exists "src/types/index.ts" "Shared types file created"
check_file_contains "src/types/index.ts" "GeoJsonPoint" "GeoJsonPoint interface defined"
check_file_contains "src/types/index.ts" "SOSStatus" "SOSStatus type defined"
check_file_contains "src/types/index.ts" "TrustedHeaders" "TrustedHeaders interface defined"

echo ""
echo "📚 Checking Documentation..."
echo "---"

# Documentation
check_file_exists "docs/SCHEMA_REFACTOR.md" "Detailed schema documentation"
check_file_exists "docs/SERVICE_IMPLEMENTATION_GUIDE.md" "Service implementation guide"
check_file_exists "REVAMP_SUMMARY.md" "Revamp summary document"
check_file_exists "QUICK_REFERENCE.md" "Quick reference guide"

echo ""
echo "🔒 Checking Security Patterns..."
echo "---"

# Security checks
check_file_contains "src/modules/sos/sos.mongo.schema.ts" "cityId.*1.*status.*1.*createdAt" "SOS has city+status compound index"
check_file_contains "src/modules/tracking/location.mongo.schema.ts" "cityId.*1" "Location has cityId index"
check_file_contains "src/modules/messages/message.mongo.schema.ts" "cityId.*1" "Message has cityId index"

echo ""
echo "=============================================="
echo "Summary"
echo "=============================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Schema refactor is complete.${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Review the items above.${NC}"
  exit 1
fi
