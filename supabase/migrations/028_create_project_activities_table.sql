-- Migration: Create Dedicated Project Activities Table
-- This creates a purpose-built table for project activity tracking
-- Separate from general audit logging for better performance and clarity

-- Step 1: Create the dedicated project activities table
CREATE TABLE IF NOT EXISTS construction_mgr.be_project_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    entity_type VARCHAR(50), -- 'document', 'expense', 'phase', 'task', etc.
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (status IN ('success', 'info', 'warning', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create optimized indexes for project activities
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON construction_mgr.be_project_activity (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_type ON construction_mgr.be_project_activity (activity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_status ON construction_mgr.be_project_activity (status);
CREATE INDEX IF NOT EXISTS idx_project_activity_user ON construction_mgr.be_project_activity (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_entity ON construction_mgr.be_project_activity (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON construction_mgr.be_project_activity (created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_project_activity_project_time ON construction_mgr.be_project_activity (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_type ON construction_mgr.be_project_activity (project_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_user ON construction_mgr.be_project_activity (project_id, user_id);

-- JSONB index for metadata queries
CREATE INDEX IF NOT EXISTS idx_project_activity_metadata ON construction_mgr.be_project_activity USING gin (metadata);

-- Step 3: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION construction_mgr.update_project_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger
CREATE TRIGGER trigger_project_activity_updated_at
    BEFORE UPDATE ON construction_mgr.be_project_activity
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_project_activity_updated_at();

-- Step 5: Create helper function for project activity insertion
CREATE OR REPLACE FUNCTION construction_mgr.create_project_activity(
    p_project_id UUID,
    p_activity_type VARCHAR(100),
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR(255) DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_status VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO construction_mgr.be_project_activity (
        project_id,
        activity_type,
        title,
        description,
        user_id,
        user_name,
        entity_type,
        entity_id,
        metadata,
        status
    ) VALUES (
        p_project_id,
        p_activity_type,
        p_title,
        p_description,
        p_user_id,
        p_user_name,
        p_entity_type,
        p_entity_id,
        p_metadata,
        p_status
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create RLS policies for project activities
ALTER TABLE construction_mgr.be_project_activity ENABLE ROW LEVEL SECURITY;

-- Users can view activities for projects they're members of
CREATE POLICY "Users can view project activities" 
    ON construction_mgr.be_project_activity FOR SELECT
    USING (
        project_id IN (
            SELECT project_id 
            FROM construction_mgr.be_project_member 
            WHERE user_id = auth.uid()
        )
    );

-- Users can create activities for projects they're members of
CREATE POLICY "Users can create project activities" 
    ON construction_mgr.be_project_activity FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id 
            FROM construction_mgr.be_project_member 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update their own activities
CREATE POLICY "Users can update own activities" 
    ON construction_mgr.be_project_activity FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Service role can manage all activities
CREATE POLICY "Service role can manage project activities" 
    ON construction_mgr.be_project_activity FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Step 7: Grant permissions
GRANT SELECT, INSERT, UPDATE ON construction_mgr.be_project_activity TO authenticated;
GRANT SELECT ON construction_mgr.be_project_activity TO anon;

-- Step 8: Create view for easier querying (optional, but useful)
CREATE OR REPLACE VIEW construction_mgr.project_activities AS
SELECT 
    pa.*,
    p.name as project_name,
    u.first_name || ' ' || COALESCE(u.last_name, '') as full_user_name,
    u.email as user_email
FROM construction_mgr.be_project_activity pa
LEFT JOIN construction_mgr.be_project p ON pa.project_id = p.id
LEFT JOIN construction_mgr.be_user u ON pa.user_id = u.id
ORDER BY pa.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON construction_mgr.project_activities TO authenticated;
GRANT SELECT ON construction_mgr.project_activities TO anon;

-- Step 9: Add table and column comments
COMMENT ON TABLE construction_mgr.be_project_activity IS 'Dedicated table for tracking project activities and events';
COMMENT ON COLUMN construction_mgr.be_project_activity.project_id IS 'Reference to the project this activity belongs to';
COMMENT ON COLUMN construction_mgr.be_project_activity.activity_type IS 'Type of activity (document_upload, task_complete, etc.)';
COMMENT ON COLUMN construction_mgr.be_project_activity.title IS 'Human-readable activity title';
COMMENT ON COLUMN construction_mgr.be_project_activity.description IS 'Detailed description of the activity';
COMMENT ON COLUMN construction_mgr.be_project_activity.user_id IS 'User who performed the activity';
COMMENT ON COLUMN construction_mgr.be_project_activity.user_name IS 'Cached user display name for performance';
COMMENT ON COLUMN construction_mgr.be_project_activity.entity_type IS 'Type of entity this activity relates to';
COMMENT ON COLUMN construction_mgr.be_project_activity.entity_id IS 'ID of the entity this activity relates to';
COMMENT ON COLUMN construction_mgr.be_project_activity.metadata IS 'Additional activity-specific data in JSONB format';
COMMENT ON COLUMN construction_mgr.be_project_activity.status IS 'Activity status indicator';
COMMENT ON VIEW construction_mgr.project_activities IS 'Enhanced view of project activities with user and project details';
COMMENT ON FUNCTION construction_mgr.create_project_activity IS 'Helper function to create project activities with validation';