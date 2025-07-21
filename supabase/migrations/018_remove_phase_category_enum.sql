-- Migration: 018_remove_phase_category_enum.sql
-- Purpose: Remove phase_category enum and convert to VARCHAR for flexibility
-- This allows users to create phases with any category name

-- Step 1: Add new category_name column as VARCHAR
ALTER TABLE construction_mgr.be_phase 
ADD COLUMN IF NOT EXISTS category_name VARCHAR(50);

-- Step 2: Migrate existing data from enum to VARCHAR
UPDATE construction_mgr.be_phase 
SET category_name = category::text 
WHERE category_name IS NULL;

-- Step 3: Drop the old category column (enum)
ALTER TABLE construction_mgr.be_phase 
DROP COLUMN IF EXISTS category;

-- Step 4: Rename category_name to category
ALTER TABLE construction_mgr.be_phase 
RENAME COLUMN category_name TO category;

-- Step 5: Make the new category column NOT NULL
ALTER TABLE construction_mgr.be_phase 
ALTER COLUMN category SET NOT NULL;

-- Step 6: Drop the phase_category enum type (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'phase_category') THEN
        DROP TYPE construction_mgr.phase_category;
    END IF;
END
$$;

-- Add comment to document the change
COMMENT ON COLUMN construction_mgr.be_phase.category IS 'Phase category as flexible text field. Guided by constructionPhasesWithTasks constants in frontend.';
