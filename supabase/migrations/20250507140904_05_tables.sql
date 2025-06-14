-- Create tables in construction_mgr schema

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
      "currency": "GHS"
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT unique_provider_identity UNIQUE (provider, provider_identifier)
);

-- Enable RLS on be_user table
ALTER TABLE construction_mgr.be_user ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON construction_mgr.be_user
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Project table
CREATE TABLE construction_mgr.be_project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status construction_mgr.project_status NOT NULL DEFAULT 'PLANNING',
    details JSONB NOT NULL DEFAULT '{
      "location": {
        "region": null,
        "district": null,
        "gps_code": null,
        "coordinates": null
      },
      "specs": {
        "plot_size": null,
        "building_size": null,
        "floors": null
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
      "currency": "GHS"
    }',
    owner_id UUID NOT NULL,
    ai_generated_plan JSONB,
    plan_approved BOOLEAN NOT NULL DEFAULT FALSE,
    profile_image TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_timeline CHECK (
        (timeline ->> 'planned_start')::date <= (timeline ->> 'planned_end')::date
    ),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES construction_mgr.be_user(id)
);

-- Enable RLS on be_project table
ALTER TABLE construction_mgr.be_project ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_project_modtime
    BEFORE UPDATE ON construction_mgr.be_project
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();
    
-- Add comments for project inspiration columns
COMMENT ON COLUMN construction_mgr.be_project.profile_image IS 'URL to the project profile/inspiration image';
COMMENT ON COLUMN construction_mgr.be_project.images IS 'Array of URLs to project inspiration images';

-- Project Members (join table for users and projects) - RENAMED from be_project_user to be_project_member
CREATE TABLE construction_mgr.be_project_member (
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role construction_mgr.user_role NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_member_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_member_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE
);

-- Enable RLS on be_project_member table
ALTER TABLE construction_mgr.be_project_member ENABLE ROW LEVEL SECURITY;

-- Project Phase table
CREATE TABLE construction_mgr.be_phase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category construction_mgr.phase_category NOT NULL,
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

-- Enable RLS on be_phase table
ALTER TABLE construction_mgr.be_phase ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_phase_modtime
    BEFORE UPDATE ON construction_mgr.be_phase
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Material table
CREATE TABLE construction_mgr.be_material (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    project_id UUID NOT NULL,
    specs JSONB NOT NULL DEFAULT '{}',
    currency construction_mgr.currency DEFAULT 'GHS',
    current_quantity NUMERIC(12, 4),
    min_required_quantity NUMERIC(12, 4),
    unit_price NUMERIC(12, 2),
    supplier_id UUID,
    supplier_info JSONB,
    last_ordered DATE,
    lead_time_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_material_supplier FOREIGN KEY (supplier_id) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL
);

-- Enable RLS on be_material table
ALTER TABLE construction_mgr.be_material ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_material_modtime
    BEFORE UPDATE ON construction_mgr.be_material
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Financial Transaction table (renamed from be_expense)
CREATE TABLE construction_mgr.financial_transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    currency construction_mgr.currency NOT NULL DEFAULT 'GHS',
    transaction_type construction_mgr.transaction_type NOT NULL DEFAULT 'OTHER',
    category TEXT,
    project_id UUID NOT NULL,
    phase_id UUID,
    payment_status construction_mgr.payment_status NOT NULL DEFAULT 'PENDING',
    payment_method construction_mgr.payment_method,
    payment_date TIMESTAMPTZ,
    base_currency construction_mgr.currency,
    exchange_rate NUMERIC(12, 6),
    base_amount NUMERIC(12, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN base_currency = currency THEN amount
            WHEN exchange_rate IS NOT NULL THEN amount * exchange_rate
            ELSE amount
        END
    ) STORED,
    reference_number TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    details JSONB NOT NULL DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_financial_phase FOREIGN KEY (phase_id) REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL,
    CONSTRAINT fk_financial_approved_by FOREIGN KEY (approved_by) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_financial_created_by FOREIGN KEY (created_by) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL
);

-- Enable RLS on financial_transaction table
ALTER TABLE construction_mgr.financial_transaction ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_financial_transaction_modtime
    BEFORE UPDATE ON construction_mgr.financial_transaction
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Material Transaction table
CREATE TABLE construction_mgr.material_transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL,
    project_id UUID,
    quantity NUMERIC(12, 4) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'PURCHASE', 'USAGE', 'ADJUSTMENT'
    reference_id UUID, -- Links to financial_transaction.id if applicable
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_transaction_material FOREIGN KEY (material_id) 
        REFERENCES construction_mgr.be_material(id) ON DELETE CASCADE,
    CONSTRAINT fk_material_transaction_project FOREIGN KEY (project_id) 
        REFERENCES construction_mgr.be_project(id) ON DELETE SET NULL,
    CONSTRAINT fk_material_transaction_created_by FOREIGN KEY (created_by) 
        REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_material_transaction_reference FOREIGN KEY (reference_id) 
        REFERENCES construction_mgr.financial_transaction(id) ON DELETE SET NULL
);

-- Enable RLS on material_transaction table
ALTER TABLE construction_mgr.material_transaction ENABLE ROW LEVEL SECURITY;

-- Create indexes for material transactions
CREATE INDEX idx_material_transaction_material 
    ON construction_mgr.material_transaction(material_id);
    
CREATE INDEX idx_material_transaction_project 
    ON construction_mgr.material_transaction(project_id);
    
CREATE INDEX idx_material_transaction_created 
    ON construction_mgr.material_transaction(created_at);

-- Function to update material quantities based on transactions
CREATE OR REPLACE FUNCTION construction_mgr.update_material_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.transaction_type = 'PURCHASE' OR NEW.transaction_type = 'RETURN' THEN
      UPDATE construction_mgr.be_material
      SET current_quantity = COALESCE(current_quantity, 0) + NEW.quantity
      WHERE id = NEW.material_id;
    ELSIF NEW.transaction_type = 'USAGE' OR NEW.transaction_type = 'ADJUSTMENT' THEN
      UPDATE construction_mgr.be_material
      SET current_quantity = GREATEST(0, COALESCE(current_quantity, 0) - NEW.quantity)
      WHERE id = NEW.material_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for material transactions
CREATE TRIGGER trg_material_transaction
  AFTER INSERT ON construction_mgr.material_transaction
  FOR EACH ROW EXECUTE FUNCTION construction_mgr.update_material_quantity();

-- Comment table
CREATE TABLE construction_mgr.comment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'project', 'task', 'phase', 'material', etc.
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) 
        REFERENCES construction_mgr.be_user(id)
);

-- Index for efficient comment retrieval
CREATE INDEX idx_comment_entity 
    ON construction_mgr.comment(entity_type, entity_id);

-- Enable RLS on comment table
ALTER TABLE construction_mgr.comment ENABLE ROW LEVEL SECURITY;

-- Document table
CREATE TABLE construction_mgr.be_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    document_type construction_mgr.document_type NOT NULL,
    project_id UUID NOT NULL,
    phase_id UUID,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_phase FOREIGN KEY (phase_id) REFERENCES construction_mgr.be_phase(id) ON DELETE SET NULL
);

-- Enable RLS on be_document table
ALTER TABLE construction_mgr.be_document ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_document_modtime
    BEFORE UPDATE ON construction_mgr.be_document
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Notification table
CREATE TABLE construction_mgr.be_notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE
);

-- Enable RLS on be_notification table
ALTER TABLE construction_mgr.be_notification ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS on be_audit_log table
ALTER TABLE construction_mgr.be_audit_log ENABLE ROW LEVEL SECURITY;

-- Task table
CREATE TABLE construction_mgr.be_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS on be_task table
ALTER TABLE construction_mgr.be_task ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_task_modtime
    BEFORE UPDATE ON construction_mgr.be_task
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Quality Inspection table
CREATE TABLE construction_mgr.be_quality_inspection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS on be_quality_inspection table
ALTER TABLE construction_mgr.be_quality_inspection ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_quality_inspection_modtime
    BEFORE UPDATE ON construction_mgr.be_quality_inspection
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Project Permissions table (moved from 07_permissions.sql to fix dependency order)
CREATE TABLE construction_mgr.be_project_permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission construction_mgr.permission_type NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_permission_project FOREIGN KEY (project_id) REFERENCES construction_mgr.be_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_user FOREIGN KEY (user_id) REFERENCES construction_mgr.be_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_granted_by FOREIGN KEY (granted_by) REFERENCES construction_mgr.be_user(id),
    CONSTRAINT unique_user_project_permission UNIQUE (project_id, user_id, permission)
);

-- Enable RLS on be_project_permission table
ALTER TABLE construction_mgr.be_project_permission ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_project_permission_modtime
    BEFORE UPDATE ON construction_mgr.be_project_permission
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();
