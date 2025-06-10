# BuildEase Schema Changes Summary

This document summarizes the changes made to the BuildEase database schema for the Supabase migration.

## Key Changes

1. **Renamed `be_project_user` to `be_project_member`**
   - All table references, foreign keys, and join conditions have been updated
   - Function references have been updated to use the new table name

2. **Added Financial Access Control**
   - Added new permission types:
     - `VIEW_FINANCIALS`: Controls access to expense data
     - `VIEW_BUDGET`: Controls access to budget information
   - Financial data is now restricted to:
     - Project owners (always have access)
     - Users with explicit financial access permissions

3. **Default Financial Permissions by Role**
   - **OWNER**: Full access to all financial data (implicit)
   - **ADMIN**: Full access to all financial data
   - **CONTRACTOR**: View financials and budget by default
   - **SUPPLIER**: View financials but not budget by default
   - **WORKER**: No financial access by default

4. **New RLS Policies**
   - Added specific policies to control access to:
     - Project budget fields
     - Expense data
     - Phase budget information
   - Project budget information is hidden from members without proper permissions

5. **New Financial Helper Functions**
   - Added `private.has_financial_access()` function
   - Added `private.has_budget_access()` function
   - Updated permission checks in RLS policies

6. **Added Financial Summary View**
   - Created a new `financial_summary` view with RLS applied
   - Shows budget allocation, spending, and expense information
   - Only accessible to members with proper financial permissions

## Implementation Steps

1. Replace/update the following files with their `.updated` versions:
   - `05_tables.sql`
   - `05_z_permissions.sql`
   - `06_rls_policies.sql`
   - `04_functions.sql`
   - `08_views.sql`
   - `09_indexes.sql`

2. Migrate existing data:
   - Rename the `be_project_user` table to `be_project_member` in your existing data
   - Generate default permissions for existing project members

3. Test the financial access controls:
   - Verify that only members with proper permissions can see budget and expense data
   - Verify that owners and admins always have access to financial data
   - Verify that contractors can see both financial and budget data by default
   - Verify that suppliers can see financial data but not budget by default
   - Verify that workers cannot see financial data by default

## Important Notes

- The table renaming requires updating all references in your application code
- You may need to explicitly grant financial permissions to existing project members after migration
- Additional testing is recommended to ensure proper RLS policy enforcement

## Recent Changes (May 14, 2025)

7. **Enhanced Auth User Synchronization**
   - Added bidirectional sync between `auth.users` and `construction_mgr.be_user`
   - Added intelligent name parsing from `full_name` and `name` fields
   - Improved handling of user profile updates and deletions
   - Profile changes in `be_user` now sync back to `auth.users`
   - User deletions now mark users as INACTIVE instead of removing them

### Auth Sync Implementation Details

- New triggers handle user creation, updates, and deletion events
- Names are intelligently parsed when only combined names are available
- Added profile picture, email verification, and phone verification sync
- Proper handling of various auth providers and their metadata
- All changes are now bidirectional between auth and application tables
