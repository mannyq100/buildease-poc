# 🗑️ BuildEase Database Reset Scripts

This directory contains scripts to reset your Supabase database for development and testing purposes.

⚠️ **WARNING**: These scripts will DELETE DATA! Only use in development/testing environments.

## 📁 Available Scripts

### 1. `reset_database.sql` - Complete Reset
- **Purpose**: Completely wipes all BuildEase database objects
- **Use case**: Starting fresh, testing migrations from scratch
- **What it does**:
  - Drops all tables, functions, views, triggers
  - Deletes all storage buckets and objects  
  - Removes all enums and types
  - Clears migration history

### 2. `reset_database.sh` - Interactive Reset Script
- **Purpose**: User-friendly wrapper for the SQL reset
- **Use case**: Safe, guided database reset with confirmations
- **Features**:
  - Interactive prompts for Supabase credentials
  - Safety confirmations
  - Colored output and progress indicators
  - Error handling and validation

### 3. `quick_reset.sql` - Data-Only Reset
- **Purpose**: Clears data but preserves database structure
- **Use case**: Rapid development iterations, testing new data
- **What it does**:
  - Truncates all tables (preserves structure)
  - Deletes storage objects
  - Resets sequences
  - Keeps migrations intact

## 🚀 Usage Instructions

### Option 1: Interactive Shell Script (Recommended)

```bash
# Make executable (one time only)
chmod +x reset_database.sh

# Run interactive reset
./reset_database.sh

# Or provide credentials directly
./reset_database.sh YOUR_PROJECT_REF YOUR_DB_PASSWORD
```

### Option 2: Direct SQL Execution

#### Complete Reset:
```bash
# Using psql directly
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" -f reset_database.sql

# Using Supabase CLI
supabase db reset --linked
```

#### Quick Reset (data only):
```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" -f quick_reset.sql
```

### Option 3: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content of `reset_database.sql`
4. Click **Run**

## 🔧 Prerequisites

### For Shell Script:
- `psql` (PostgreSQL client) installed
- Bash shell (macOS/Linux/WSL)

### Install psql:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from https://www.postgresql.org/download/
```

## 📋 What You'll Need

1. **Supabase Project Reference**: 
   - Found in your project URL: `https://app.supabase.com/project/[PROJECT_REF]`
   - Example: `abcdefghijklmnop`

2. **Database Password**:
   - Set in Project Settings → Database
   - This is the `postgres` user password

## 🔄 Typical Workflow

### During Migration Development:
```bash
# 1. Reset database completely
./reset_database.sh

# 2. Run your migrations
cd .. && npx supabase migration up

# 3. Test your application
npm run dev

# 4. If you need to iterate quickly (data changes only)
psql "..." -f quick_reset.sql
```

### Testing New Features:
```bash
# Quick data reset (preserves structure)
psql "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" -f quick_reset.sql

# Add test data and continue development
```

## 📊 Verification Queries

After running reset scripts, verify success:

```sql
-- Check remaining BuildEase tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname IN ('construction_mgr', 'private');

-- Check remaining functions  
SELECT n.nspname, p.proname 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('construction_mgr', 'private');

-- Check storage buckets
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('profiles', 'project-inspiration', 'progress-images', 'documents');

-- Check storage objects count
SELECT bucket_id, count(*) 
FROM storage.objects 
WHERE bucket_id IN ('profiles', 'project-inspiration', 'progress-images', 'documents')
GROUP BY bucket_id;
```

## 🛡️ Safety Features

### Interactive Script Safety:
- Requires typing "DELETE" to confirm
- Shows project being affected
- Validates credentials before execution
- Clear error messages

### SQL Script Safety:
- Uses `IF EXISTS` clauses to prevent errors
- Handles dependencies properly
- Provides completion notifications
- Includes verification queries

## 🚨 Important Notes

1. **Never use in production** - These scripts will delete all data
2. **Backup first** - Export important data before resetting
3. **Test migrations** - Always test your migrations after reset
4. **Check dependencies** - Ensure all required tools are installed

## 🔧 Troubleshooting

### Common Issues:

**"psql: command not found"**
```bash
# Install PostgreSQL client tools
brew install postgresql  # macOS
```

**"connection refused"**
- Check your project reference and password
- Ensure your IP is allowlisted in Supabase
- Verify database is not paused

**"permission denied"**
- Check database password
- Ensure you're using the correct project reference

**"tables still exist after reset"**
- Some tables might have external dependencies
- Run the verification queries to identify remaining objects
- Manually drop any remaining objects if needed

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify your Supabase credentials
3. Run verification queries to see what's remaining
4. Check Supabase dashboard for any locked processes