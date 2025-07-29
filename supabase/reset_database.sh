#!/bin/bash

# BuildEase Database Reset Script
# Purpose: Reset Supabase database for clean migration testing
# Usage: ./reset_database.sh [supabase_project_ref] [supabase_db_password]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESET_SQL_FILE="$SCRIPT_DIR/reset_database.sql"

# Default values (can be overridden)
SUPABASE_PROJECT_REF="${1:-}"
SUPABASE_DB_PASSWORD="${2:-}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local is_password="${3:-false}"
    
    if [ "$is_password" = "true" ]; then
        read -s -p "$prompt" input
        echo  # Add newline after password input
    else
        read -p "$prompt" input
    fi
    
    eval "$var_name='$input'"
}

# Header
echo -e "${RED}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 🗑️  BUILDEASE DATABASE RESET                 ║"
echo "║                                                              ║"
echo "║  ⚠️  WARNING: This will DELETE ALL DATA in your database!   ║"
echo "║     Only use this for development/testing environments      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get Supabase credentials if not provided
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    print_status "Enter your Supabase project reference (from project URL):"
    prompt_input "Project Ref: " SUPABASE_PROJECT_REF
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    print_status "Enter your Supabase database password:"
    prompt_input "DB Password: " SUPABASE_DB_PASSWORD true
fi

# Validate inputs
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    print_error "Both project reference and password are required!"
    exit 1
fi

# Check if reset SQL file exists
if [ ! -f "$RESET_SQL_FILE" ]; then
    print_error "Reset SQL file not found: $RESET_SQL_FILE"
    exit 1
fi

# Construct database URL
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"

# Final confirmation
echo
print_warning "You are about to PERMANENTLY DELETE all BuildEase data from:"
echo "Project: $SUPABASE_PROJECT_REF"
echo
read -p "Type 'DELETE' to confirm (case sensitive): " confirmation

if [ "$confirmation" != "DELETE" ]; then
    print_status "Reset cancelled. No changes made."
    exit 0
fi

echo
print_status "Starting database reset..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql is not installed. Please install PostgreSQL client tools."
    echo
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql-client"
    echo "On Windows: Install from https://www.postgresql.org/download/"
    exit 1
fi

# Execute the reset
print_status "Executing database reset script..."
if psql "$DB_URL" -f "$RESET_SQL_FILE" -v ON_ERROR_STOP=1; then
    print_success "Database reset completed successfully!"
else
    print_error "Database reset failed. Check the error messages above."
    exit 1
fi

echo
print_success "🎉 BuildEase database has been completely reset!"
print_status "You can now run your migrations from scratch:"
echo
echo "  cd supabase"
echo "  npx supabase db reset"
echo "  # or"
echo "  npx supabase migration up"
echo

# Optional: Show verification commands
print_status "To verify the reset was successful, you can run these queries:"
echo
echo "-- Check for remaining BuildEase tables:"
echo "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('construction_mgr', 'private');"
echo
echo "-- Check for remaining storage buckets:"
echo "SELECT id, name FROM storage.buckets WHERE id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');"
echo