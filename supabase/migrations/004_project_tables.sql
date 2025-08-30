-- Migration: 004_project_tables.sql
-- Purpose: Defines all tables for the core project management domain.

-- =============================================================================
-- PROJECT TABLE
-- =============================================================================

-- Project table
CREATE TABLE construction_mgr.be_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status construction_mgr.project_status NOT NULL DEFAULT 'PLANNING',
    details JSONB NOT NULL DEFAULT '{
    "location": {
    "street_address": null,
    "city": null,
    "region_or_state": null,
    "country": null,
    "gps_coordinates": null
  },
      "specs": {
        "plot_size": null,
        "building_size": null,
        "floors": null
      },
      "owner_info": {
        "name": null,
        "phone": null,
        "email": null
      }
    }',
    timeline JSONB NOT NULL DEFAULT '{
      "planned_start": null,
      "planned_end": null,
      "actual_start": null,
      "actual_end": null
    }',
    budget JSONB NOT NULL DEFAULT '{
      "allocated": 0,
      "spent": 0,
      "currency": "USD"
    }',
    owner_id UUID NOT NULL,
    slug TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_timeline CHECK (
        (timeline ->> 'planned_start')::date <= (timeline ->> 'planned_end')::date
    ),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES construction_mgr.be_user(id),
    CONSTRAINT chk_project_slug_format CHECK (
        slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
);

CREATE TRIGGER update_project_modtime
    BEFORE UPDATE ON construction_mgr.be_project
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_owner ON construction_mgr.be_project (owner_id);
CREATE INDEX IF NOT EXISTS idx_project_status ON construction_mgr.be_project (status);
CREATE INDEX IF NOT EXISTS idx_project_details ON construction_mgr.be_project USING gin (details);
CREATE INDEX IF NOT EXISTS idx_project_timeline ON construction_mgr.be_project USING gin (timeline);
CREATE INDEX IF NOT EXISTS idx_project_budget ON construction_mgr.be_project USING gin (budget);
CREATE INDEX IF NOT EXISTS idx_project_search ON construction_mgr.be_project 
    USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));
CREATE INDEX IF NOT EXISTS idx_project_active_owner 
    ON construction_mgr.be_project (owner_id) 
    WHERE status IN ('PLANNING', 'IN_PROGRESS');
CREATE UNIQUE INDEX IF NOT EXISTS ux_be_project_slug_lower
    ON construction_mgr.be_project (lower(slug))
    WHERE slug IS NOT NULL;

-- Add comment to document the unified media approach
COMMENT ON TABLE construction_mgr.be_project IS 'Core project information table. Media files are stored in be_document table with appropriate categories.';

-- =============================================================================
-- PROJECT MEMBERS TABLE
-- =============================================================================

-- Project Members table
CREATE TABLE construction_mgr.be_project_member (
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role construction_mgr.user_role NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_member_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_member_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_member_user ON construction_mgr.be_project_member (user_id);
CREATE INDEX IF NOT EXISTS idx_project_member_project ON construction_mgr.be_project_member (project_id);
CREATE INDEX IF NOT EXISTS idx_project_member_role ON construction_mgr.be_project_member (role);
CREATE INDEX IF NOT EXISTS idx_project_member_project_user ON construction_mgr.be_project_member (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_member_user_role ON construction_mgr.be_project_member (user_id, role);
CREATE INDEX IF NOT EXISTS idx_project_member_covering 
    ON construction_mgr.be_project_member (project_id, user_id) 
    INCLUDE (role, joined_at);

-- =============================================================================
-- PROJECT PHASE TABLE
-- =============================================================================

-- Project Phase table
CREATE TABLE construction_mgr.be_phase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status construction_mgr.project_status NOT NULL DEFAULT 'PLANNING',
    project_id UUID NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    timeline JSONB NOT NULL DEFAULT '{
      "planned_start": null,
      "planned_end": null,
      "actual_start": null,
      "actual_end": null
    }',
    budget JSONB NOT NULL DEFAULT '{
      "allocated": 0,
      "spent": 0,
      "currency": "GHS"
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phase_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE
);

CREATE TRIGGER update_phase_modtime
    BEFORE UPDATE ON construction_mgr.be_phase
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phase_project ON construction_mgr.be_phase (project_id);
CREATE INDEX IF NOT EXISTS idx_phase_status ON construction_mgr.be_phase (status);
CREATE INDEX IF NOT EXISTS idx_phase_category ON construction_mgr.be_phase (category);
CREATE INDEX IF NOT EXISTS idx_phase_project_status ON construction_mgr.be_phase (project_id, status);
CREATE INDEX IF NOT EXISTS idx_phase_project_category ON construction_mgr.be_phase (project_id, category);
CREATE INDEX IF NOT EXISTS idx_phase_details ON construction_mgr.be_phase USING gin (details);
CREATE INDEX IF NOT EXISTS idx_phase_timeline ON construction_mgr.be_phase USING gin (timeline);
CREATE INDEX IF NOT EXISTS idx_phase_budget ON construction_mgr.be_phase USING gin (budget);
CREATE INDEX IF NOT EXISTS idx_phase_active_project 
    ON construction_mgr.be_phase (project_id) 
    WHERE status IN ('PLANNING', 'IN_PROGRESS');

-- =============================================================================
-- TASK TABLE
-- =============================================================================

-- Task table
CREATE TABLE construction_mgr.be_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    phase_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_by UUID NOT NULL,
    assigned_to UUID,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    completed_by UUID,
    completion_notes TEXT,
    dependencies JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_task_dates CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date),
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_phase FOREIGN KEY (phase_id) REFERENCES construction_mgr.be_phase(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_created_by FOREIGN KEY (created_by) REFERENCES construction_mgr.be_user(id),
    CONSTRAINT fk_task_assigned_to FOREIGN KEY (assigned_to) REFERENCES construction_mgr.be_user(id),
    CONSTRAINT fk_task_completed_by FOREIGN KEY (completed_by) REFERENCES construction_mgr.be_user(id)
);

CREATE TRIGGER update_task_modtime
    BEFORE UPDATE ON construction_mgr.be_task
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_project ON construction_mgr.be_task (project_id);
CREATE INDEX IF NOT EXISTS idx_task_phase ON construction_mgr.be_task (phase_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON construction_mgr.be_task (status);
CREATE INDEX IF NOT EXISTS idx_task_assigned ON construction_mgr.be_task (assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_dates ON construction_mgr.be_task (start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_tags ON construction_mgr.be_task USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_task_project_status ON construction_mgr.be_task (project_id, status);
CREATE INDEX IF NOT EXISTS idx_task_assigned_status ON construction_mgr.be_task (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_task_phase_status ON construction_mgr.be_task (phase_id, status);
CREATE INDEX IF NOT EXISTS idx_task_dependencies ON construction_mgr.be_task USING gin (dependencies);
CREATE INDEX IF NOT EXISTS idx_task_comments ON construction_mgr.be_task USING gin (comments);
CREATE INDEX IF NOT EXISTS idx_task_pending_assigned 
    ON construction_mgr.be_task (assigned_to) 
    WHERE status IN ('PENDING', 'IN_PROGRESS');
CREATE INDEX IF NOT EXISTS idx_task_covering 
    ON construction_mgr.be_task (project_id, status) 
    INCLUDE (assigned_to, due_date, priority);
CREATE INDEX IF NOT EXISTS idx_task_created_by ON construction_mgr.be_task (created_by);
CREATE INDEX IF NOT EXISTS idx_task_completed_by ON construction_mgr.be_task (completed_by);

-- =============================================================================
-- COMMENT TABLE
-- =============================================================================

-- Comment table
CREATE TABLE construction_mgr.comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'project', 'task', 'phase', 'material', etc.
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES construction_mgr.comment(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) 
        REFERENCES construction_mgr.be_user(id),
    CONSTRAINT chk_comment_content_length CHECK (char_length(content) <= 2000 AND char_length(content) > 0),
    CONSTRAINT chk_comment_content_safe CHECK (content !~ '<[^>]*>')
);

-- Indexes
CREATE INDEX idx_comment_entity ON construction_mgr.comment(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON construction_mgr.comment (user_id);
CREATE INDEX idx_comment_parent ON construction_mgr.comment(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_content_gin 
ON construction_mgr.comment 
USING gin (to_tsvector('english', content));

-- =============================================================================
-- QUALITY INSPECTION TABLE
-- =============================================================================

-- Quality Inspection table
CREATE TABLE construction_mgr.be_quality_inspection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL,
    task_id UUID,
    inspector_id UUID NOT NULL,
    inspection_date DATE NOT NULL,
    checklist_items JSONB NOT NULL,
    results JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    attachments JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inspection_phase FOREIGN KEY (phase_id) REFERENCES construction_mgr.be_phase(id) ON DELETE CASCADE,
    CONSTRAINT fk_inspection_task FOREIGN KEY (task_id) REFERENCES construction_mgr.be_task(id) ON DELETE CASCADE,
    CONSTRAINT fk_inspection_inspector FOREIGN KEY (inspector_id) REFERENCES construction_mgr.be_user(id)
);

CREATE TRIGGER update_quality_inspection_modtime
    BEFORE UPDATE ON construction_mgr.be_quality_inspection
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inspection_phase ON construction_mgr.be_quality_inspection (phase_id);
CREATE INDEX IF NOT EXISTS idx_inspection_task ON construction_mgr.be_quality_inspection (task_id);
CREATE INDEX IF NOT EXISTS idx_inspection_inspector ON construction_mgr.be_quality_inspection (inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_date ON construction_mgr.be_quality_inspection (inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspection_status ON construction_mgr.be_quality_inspection (status);
CREATE INDEX IF NOT EXISTS idx_inspection_checklist ON construction_mgr.be_quality_inspection USING gin (checklist_items);
CREATE INDEX IF NOT EXISTS idx_inspection_results ON construction_mgr.be_quality_inspection USING gin (results);
CREATE INDEX IF NOT EXISTS idx_inspection_attachments ON construction_mgr.be_quality_inspection USING gin (attachments);

-- =============================================================================
-- PROJECT ACTIVITIES TABLE
-- =============================================================================

-- Project Activities table
CREATE TABLE construction_mgr.be_project_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes for project activities
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON construction_mgr.be_project_activity (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_type ON construction_mgr.be_project_activity (activity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_status ON construction_mgr.be_project_activity (status);
CREATE INDEX IF NOT EXISTS idx_project_activity_user ON construction_mgr.be_project_activity (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_entity ON construction_mgr.be_project_activity (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON construction_mgr.be_project_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_time ON construction_mgr.be_project_activity (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_type ON construction_mgr.be_project_activity (project_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_user ON construction_mgr.be_project_activity (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_metadata ON construction_mgr.be_project_activity USING gin (metadata);

-- Trigger for updated_at
CREATE TRIGGER trigger_project_activity_updated_at
    BEFORE UPDATE ON construction_mgr.be_project_activity
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();
