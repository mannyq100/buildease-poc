-- Migration: 005_financial_tables.sql
-- Purpose: Defines all tables for the financial domain.

-- =============================================================================
-- FINANCIAL TRANSACTION TABLE
-- =============================================================================

-- Financial Transaction table
CREATE TABLE construction_mgr.financial_transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
    transaction_type construction_mgr.transaction_type NOT NULL DEFAULT 'OTHER',
    category TEXT,
    project_id UUID NOT NULL,
    phase_id UUID,
    payment_status construction_mgr.payment_status NOT NULL DEFAULT 'PENDING',
    payment_method construction_mgr.payment_method,
    payment_date TIMESTAMPTZ,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
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
    CONSTRAINT fk_financial_created_by FOREIGN KEY (created_by) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    CONSTRAINT chk_financial_amount_positive CHECK (amount > 0)
);

CREATE TRIGGER update_financial_transaction_modtime
    BEFORE UPDATE ON construction_mgr.financial_transaction
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project ON construction_mgr.financial_transaction (project_id);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_phase ON construction_mgr.financial_transaction (phase_id);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_status ON construction_mgr.financial_transaction (payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_type ON construction_mgr.financial_transaction (transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_status ON construction_mgr.financial_transaction (project_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_project_type ON construction_mgr.financial_transaction (project_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_phase_status ON construction_mgr.financial_transaction (phase_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_details ON construction_mgr.financial_transaction USING gin (details);
CREATE INDEX IF NOT EXISTS idx_financial_pending_project 
    ON construction_mgr.financial_transaction (project_id) 
    WHERE payment_status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_financial_approved_by ON construction_mgr.financial_transaction (approved_by);
CREATE INDEX IF NOT EXISTS idx_financial_created_by ON construction_mgr.financial_transaction (created_by);
