# Create Database Migration

Create a new Supabase migration for the BuildEase database following established patterns.

## Instructions

You are creating a database migration for the BuildEase construction management platform. Follow these guidelines:

### Migration Naming
- Use incremental numbering: `026_migration_description.sql` (check latest number in `/supabase/migrations/`)
- Use descriptive names that clearly indicate the change
- Examples: `026_add_inspection_tables.sql`, `027_update_project_status_enum.sql`

### Migration Structure
Follow the established pattern from existing migrations:

```sql
-- Migration: [Description]
-- Created: [Date]
-- Purpose: [Why this change is needed]

-- 1. Create enums (if needed)
CREATE TYPE be_inspection_status AS ENUM (
  'pending',
  'in_progress', 
  'completed',
  'failed'
);

-- 2. Create tables
CREATE TABLE be_inspection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES be_project(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES be_phase(id) ON DELETE SET NULL,
  inspection_type TEXT NOT NULL,
  status be_inspection_status DEFAULT 'pending',
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  inspector_notes TEXT,
  inspector_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX idx_be_inspection_project_id ON be_inspection(project_id);
CREATE INDEX idx_be_inspection_phase_id ON be_inspection(phase_id);
CREATE INDEX idx_be_inspection_status ON be_inspection(status);

-- 4. Add Row Level Security (RLS)
ALTER TABLE be_inspection ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view inspections for their projects" ON be_inspection
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM be_project 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT project_id FROM be_project_member 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project owners and members can insert inspections" ON be_inspection
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM be_project 
      WHERE owner_id = auth.uid()
      OR id IN (
        SELECT project_id FROM be_project_member 
        WHERE user_id = auth.uid() 
        AND permissions ? 'manage_inspections'
      )
    )
  );

-- 6. Create functions (if needed)
CREATE OR REPLACE FUNCTION update_inspection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers
CREATE TRIGGER update_be_inspection_updated_at
  BEFORE UPDATE ON be_inspection
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_updated_at();

-- 8. Add comments for documentation
COMMENT ON TABLE be_inspection IS 'Inspection records for construction projects';
COMMENT ON COLUMN be_inspection.inspection_type IS 'Type of inspection (electrical, plumbing, structural, etc.)';
```

### Key Guidelines

#### Table Naming
- Prefix all tables with `be_` (BuildEase)
- Use singular nouns: `be_inspection`, not `be_inspections`
- Use snake_case for all names

#### Column Standards
- Always include: `id`, `created_at`, `updated_at`
- Use `UUID` for primary keys with `gen_random_uuid()` default
- Use `TIMESTAMPTZ` for all timestamp columns
- Reference `auth.users(id)` for user relationships
- Use descriptive names that match TypeScript types

#### Foreign Keys
- Always use proper foreign key constraints
- Use `ON DELETE CASCADE` for dependent data
- Use `ON DELETE SET NULL` for optional references

#### Indexes
- Create indexes on foreign keys
- Create indexes on frequently queried columns
- Consider composite indexes for common query patterns

#### RLS Policies
- Enable RLS on all user-facing tables
- Create policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Use project membership patterns from existing tables
- Test policies with different user roles

#### Enums
- Create enums for status fields and categorical data
- Use descriptive enum names with `be_` prefix
- Document enum values in comments

### After Creating Migration

1. **Update TypeScript Types**: Add corresponding types to `src/types/database.ts`
2. **Create Service Methods**: Add CRUD operations to appropriate service in `src/services/`
3. **Add Query Hooks**: Create React Query hooks in `src/hooks/queries/` and `src/hooks/mutations/`
4. **Test Migration**: Run `supabase db reset` to test the migration applies correctly

### Common Patterns
- **Status tracking**: Use enums for status fields
- **Soft deletes**: Add `deleted_at TIMESTAMPTZ` if needed
- **JSONB data**: Use for flexible metadata storage
- **File references**: Reference Supabase Storage paths as TEXT
- **Audit trails**: Include `created_by` and `updated_by` user references

### Remember
- Test the migration on a copy of production data
- Document the purpose and impact of the migration
- Consider backwards compatibility
- Follow the established security patterns
- Update related TypeScript types after migration