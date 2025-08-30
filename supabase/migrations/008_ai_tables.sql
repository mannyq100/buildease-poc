-- Migration: 008_ai_tables.sql
-- Purpose: Defines all tables for AI plan generation domain.

-- =============================================================================
-- AI PLAN JOBS TABLE
-- =============================================================================

-- AI Plan Jobs table
CREATE TABLE construction_mgr.ai_plan_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    job_id VARCHAR(255) UNIQUE,
    progress_percentage INTEGER DEFAULT 0,
    estimated_completion_time TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    CONSTRAINT fk_ai_plan_jobs_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT check_ai_plan_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE TRIGGER update_ai_plan_jobs_modtime
    BEFORE UPDATE ON construction_mgr.ai_plan_jobs
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX idx_ai_plan_jobs_project_id ON construction_mgr.ai_plan_jobs(project_id);
CREATE INDEX idx_ai_plan_jobs_status ON construction_mgr.ai_plan_jobs(status);
CREATE INDEX idx_ai_plan_jobs_job_id ON construction_mgr.ai_plan_jobs(job_id);

-- =============================================================================
-- AI GENERATED PLAN TABLE
-- =============================================================================

-- AI Generated Plans table (supports multiple versions per project)
CREATE TABLE construction_mgr.ai_generated_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    plan_job_id UUID,
    version_number INTEGER NOT NULL DEFAULT 1,
    plan_name VARCHAR(200),
    plan_description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    plan_data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    approval_notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_plan_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_plan_job FOREIGN KEY (plan_job_id) REFERENCES construction_mgr.ai_plan_jobs(id) ON DELETE SET NULL,
    CONSTRAINT fk_ai_plan_approved_by FOREIGN KEY (approved_by) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    CONSTRAINT check_ai_plan_status CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'archived')),
    CONSTRAINT unique_project_version UNIQUE (project_id, version_number)
);

CREATE TRIGGER update_ai_generated_plan_modtime
    BEFORE UPDATE ON construction_mgr.ai_generated_plan
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX idx_ai_plan_project_id ON construction_mgr.ai_generated_plan(project_id);
CREATE INDEX idx_ai_plan_version ON construction_mgr.ai_generated_plan(project_id, version_number);
CREATE INDEX idx_ai_plan_status ON construction_mgr.ai_generated_plan(status);
CREATE INDEX idx_ai_plan_active ON construction_mgr.ai_generated_plan(project_id, is_active) WHERE is_active = true;
CREATE INDEX idx_ai_plan_approved ON construction_mgr.ai_generated_plan(is_approved, approved_at);
CREATE INDEX idx_ai_plan_generated_at ON construction_mgr.ai_generated_plan(generated_at);

-- =============================================================================
-- AI PLAN FUNCTIONS
-- =============================================================================

-- Function to automatically set version number for new plans
CREATE OR REPLACE FUNCTION construction_mgr.set_ai_plan_version_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set version number if not explicitly provided
    IF NEW.version_number = 1 THEN
        SELECT COALESCE(MAX(version_number), 0) + 1
        INTO NEW.version_number
        FROM construction_mgr.ai_generated_plan
        WHERE project_id = NEW.project_id;
    END IF;
    
    -- Auto-generate plan name if not provided
    IF NEW.plan_name IS NULL THEN
        NEW.plan_name := 'AI Plan v' || NEW.version_number;
    END IF;
    
    -- If this plan is being set as active, deactivate all other plans for the project
    IF NEW.is_active = true THEN
        UPDATE construction_mgr.ai_generated_plan
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE project_id = NEW.project_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for version numbering
CREATE TRIGGER trg_ai_plan_version_number
    BEFORE INSERT OR UPDATE ON construction_mgr.ai_generated_plan
    FOR EACH ROW EXECUTE FUNCTION construction_mgr.set_ai_plan_version_number();

-- Function to get the latest plan version for a project
CREATE OR REPLACE FUNCTION construction_mgr.get_latest_ai_plan_version(p_project_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version_number) FROM construction_mgr.ai_generated_plan WHERE project_id = p_project_id),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate a specific plan version
CREATE OR REPLACE FUNCTION construction_mgr.activate_ai_plan_version(
    p_project_id UUID,
    p_version_number INTEGER,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    plan_exists BOOLEAN;
BEGIN
    -- Check if the plan version exists
    SELECT EXISTS(
        SELECT 1 FROM construction_mgr.ai_generated_plan
        WHERE project_id = p_project_id AND version_number = p_version_number
    ) INTO plan_exists;
    
    IF NOT plan_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Deactivate all plans for the project
    UPDATE construction_mgr.ai_generated_plan
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id;
    
    -- Activate the specified version
    UPDATE construction_mgr.ai_generated_plan
    SET is_active = true, updated_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id AND version_number = p_version_number;
    
    -- Log the activation in audit log
    INSERT INTO construction_mgr.be_audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (
        p_user_id,
        'ACTIVATE_AI_PLAN',
        'ai_generated_plan',
        (SELECT id FROM construction_mgr.ai_generated_plan WHERE project_id = p_project_id AND version_number = p_version_number),
        jsonb_build_object(
            'project_id', p_project_id,
            'version_number', p_version_number,
            'activated_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
