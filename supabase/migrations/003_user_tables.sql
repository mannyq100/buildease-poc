-- Migration: 003_user_tables.sql
-- Purpose: User, audit log, project permissions, notifications

CREATE TABLE construction_mgr.be_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    "notifications": {"email": true, "push": true},
    "language": "en","currency": "USD"
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  CONSTRAINT unique_provider_identity UNIQUE (provider, provider_identifier)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON construction_mgr.be_user (email);
CREATE INDEX IF NOT EXISTS idx_user_provider ON construction_mgr.be_user (provider, provider_identifier);
CREATE INDEX IF NOT EXISTS idx_user_status ON construction_mgr.be_user (status);
CREATE INDEX IF NOT EXISTS idx_user_settings ON construction_mgr.be_user USING gin (settings);

CREATE TABLE construction_mgr.be_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_audit_user ON construction_mgr.be_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON construction_mgr.be_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON construction_mgr.be_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_details ON construction_mgr.be_audit_log USING gin (details);

CREATE TABLE construction_mgr.be_project_permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_permission_project ON construction_mgr.be_project_permission(project_id);
CREATE INDEX IF NOT EXISTS idx_permission_user ON construction_mgr.be_project_permission(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_type ON construction_mgr.be_project_permission(permission);
CREATE INDEX IF NOT EXISTS idx_permission_active ON construction_mgr.be_project_permission(active);
CREATE INDEX IF NOT EXISTS idx_project_permission_user_project ON construction_mgr.be_project_permission (user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_permission_financial ON construction_mgr.be_project_permission (project_id, user_id) WHERE permission IN ('VIEW_FINANCIALS', 'VIEW_BUDGET') AND active = TRUE;

CREATE TABLE construction_mgr.be_notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL DEFAULT 'general',
  metadata JSONB NOT NULL DEFAULT '{}',
  action_url VARCHAR(500),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE,
  CONSTRAINT check_notification_type CHECK (notification_type IN ('general', 'plan_generation', 'plan_completed', 'plan_failed', 'project_update', 'system'))
);

CREATE TRIGGER update_be_notification_modtime
  BEFORE UPDATE ON construction_mgr.be_notification
  FOR EACH ROW EXECUTE FUNCTION construction_mgr.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_notification_user_id ON construction_mgr.be_notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON construction_mgr.be_notification(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON construction_mgr.be_notification(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_type ON construction_mgr.be_notification(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_expires ON construction_mgr.be_notification(expires_at) WHERE expires_at IS NOT NULL;
