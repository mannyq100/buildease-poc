#!/bin/bash

# BuildEase Database Reset Script
# Requires: BUILDEASE_PROJECT_REF and BUILDEASE_DB_PASSWORD environment variables

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get environment variables
PROJECT_REF="$BUILDEASE_PROJECT_REF"
DB_PASSWORD="$BUILDEASE_DB_PASSWORD"
RESET_SQL_FILE="$(dirname "$0")/reset_database.sql"

# Helper functions
print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }


# Show warning header
echo -e "${RED}🗑️  BUILDEASE DATABASE RESET${NC}"
echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA!${NC}"
echo

# Validate environment variables
if [ -z "$PROJECT_REF" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "Missing required environment variables!"
    echo "Please set:"
    echo "  export BUILDEASE_PROJECT_REF='your-project-ref'"
    echo "  export BUILDEASE_DB_PASSWORD='your-password'"
    exit 1
fi

# Check SQL file exists
if [ ! -f "$RESET_SQL_FILE" ]; then
    print_error "Reset SQL file not found: $RESET_SQL_FILE"
    exit 1
fi

# Build database URL
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# Get user confirmation
print_warning "You are about to DELETE all data from project: $PROJECT_REF"
read -p "Type 'DELETE' to confirm: " confirmation

if [ "$confirmation" != "DELETE" ]; then
    print_status "Reset cancelled."
    exit 0
fi

# Check psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql not found. Install with: brew install postgresql"
    exit 1
fi

# Execute reset
print_status "Resetting database..."
if psql "$DB_URL" -f "$RESET_SQL_FILE" -v ON_ERROR_STOP=1; then
    print_success "Database reset complete!"
    echo
    print_status "Next steps:"
    echo "  npx supabase db reset"
    echo "  npx supabase migration up"
else
    print_error "Reset failed!"
    exit 1
fi