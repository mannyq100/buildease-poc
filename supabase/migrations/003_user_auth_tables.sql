-- Migration: 003_user_auth_tables.sql
-- Purpose: Defines tables for user authentication and authorization.

-- User table
CREATE TABLE construction_mgr.be_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    company_name VARCHAR(100),
    phone VARCHAR(15),
    provider construction_mgr.auth_provider NOT NULL,
    provider_identifier VARCHAR(100) NOT NULL,
    status construction_mgr.user_status DEFAULT 'ACTIVE' NOT NULL,
    tier construction_mgr.user_tier NOT NULL,
    settings JSONB NOT NULL DEFAULT '{
      "picture_url": null,
      "email_verified": false,
      "phone_verified": false,
      "notifications": {
        "email": true,
        "push": true
      },
      "language": "en",
      "currency": "USD"
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT unique_provider_identity UNIQUE (provider, provider_identifier)
);
-- Indexes for be_user
CREATE INDEX IF NOT EXISTS idx_user_email ON construction_mgr.be_user (email);
CREATE INDEX IF NOT EXISTS idx_user_provider ON construction_mgr.be_user (provider, provider_identifier);
CREATE INDEX IF NOT EXISTS idx_user_status ON construction_mgr.be_user (status);
CREATE INDEX IF NOT EXISTS idx_user_settings ON construction_mgr.be_user USING gin (settings);

-- Audit Log table
CREATE TABLE construction_mgr.be_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL
);
-- Indexes for be_audit_log
CREATE INDEX IF NOT EXISTS idx_audit_user ON construction_mgr.be_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON construction_mgr.be_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON construction_mgr.be_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_details ON construction_mgr.be_audit_log USING gin (details);

-- Project Permissions table
CREATE TABLE construction_mgr.be_project_permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission construction_mgr.permission_type NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_permission_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_granted_by FOREIGN KEY (granted_by) REFERENCES construction_mgr.be_user(id),
    CONSTRAINT unique_user_project_permission UNIQUE (project_id, user_id, permission)
);
-- Indexes for be_project_permission
CREATE INDEX IF NOT EXISTS idx_permission_project ON construction_mgr.be_project_permission(project_id);
CREATE INDEX IF NOT EXISTS idx_permission_user ON construction_mgr.be_project_permission(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_type ON construction_mgr.be_project_permission(permission);
CREATE INDEX IF NOT EXISTS idx_permission_active ON construction_mgr.be_project_permission(active);
CREATE INDEX IF NOT EXISTS idx_project_permission_user_project ON construction_mgr.be_project_permission (user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_permission_financial ON construction_mgr.be_project_permission 
    (project_id, user_id) 
    WHERE permission IN ('VIEW_FINANCIALS', 'VIEW_BUDGET') AND active = TRUE;
