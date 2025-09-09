-- Migration: 006_material_tables.sql
-- Purpose: Defines all tables for the material and inventory domain.

-- =============================================================================
-- MATERIAL TABLE
-- =============================================================================

-- Material table
CREATE TABLE construction_mgr.be_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    project_id UUID NOT NULL,
    specs JSONB NOT NULL DEFAULT '{}',
    currency VARCHAR(3) NOT NULL,
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
    CONSTRAINT fk_material_supplier FOREIGN KEY (supplier_id) REFERENCES construction_mgr.be_user(id) ON DELETE SET NULL,
    CONSTRAINT chk_material_quantity_positive CHECK (current_quantity IS NULL OR current_quantity >= 0)
);

CREATE TRIGGER update_material_modtime
    BEFORE UPDATE ON construction_mgr.be_material
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_material_project ON construction_mgr.be_material (project_id);
CREATE INDEX IF NOT EXISTS idx_material_category ON construction_mgr.be_material (category);
CREATE INDEX IF NOT EXISTS idx_material_specs ON construction_mgr.be_material USING gin (specs);
CREATE INDEX IF NOT EXISTS idx_material_supplier_info ON construction_mgr.be_material USING gin (supplier_info);
CREATE INDEX IF NOT EXISTS idx_material_low_stock 
    ON construction_mgr.be_material (project_id) 
    WHERE current_quantity IS NOT NULL 
    AND min_required_quantity IS NOT NULL 
    AND current_quantity < min_required_quantity;
CREATE INDEX IF NOT EXISTS idx_material_supplier ON construction_mgr.be_material (supplier_id);

-- =============================================================================
-- MATERIAL TRANSACTION TABLE
-- =============================================================================

-- Material Transaction table
CREATE TABLE construction_mgr.material_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        REFERENCES construction_mgr.financial_transaction(id) ON DELETE SET NULL,
    CONSTRAINT chk_material_transaction_quantity_not_zero CHECK (quantity != 0),
    CONSTRAINT chk_material_transaction_type CHECK (transaction_type IN ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'RETURN'))
);

-- Indexes
CREATE INDEX idx_material_transaction_material ON construction_mgr.material_transaction(material_id);
CREATE INDEX idx_material_transaction_project ON construction_mgr.material_transaction(project_id);
CREATE INDEX idx_material_transaction_created ON construction_mgr.material_transaction(created_at);

-- =============================================================================
-- MATERIAL QUANTITY UPDATE FUNCTION
-- =============================================================================

-- Function to update material quantities based on transactions
CREATE OR REPLACE FUNCTION construction_mgr.update_material_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.transaction_type = 'PURCHASE' OR NEW.transaction_type = 'RETURN' THEN
      UPDATE construction_mgr.be_material
      SET current_quantity = COALESCE(current_quantity, 0) + NEW.quantity
      WHERE id = NEW.material_id;
    ELSIF NEW.transaction_type = 'USAGE' THEN
      UPDATE construction_mgr.be_material
      SET current_quantity = GREATEST(0, COALESCE(current_quantity, 0) - ABS(NEW.quantity))
      WHERE id = NEW.material_id;
    ELSIF NEW.transaction_type = 'ADJUSTMENT' THEN
      UPDATE construction_mgr.be_material
      SET current_quantity = GREATEST(0, COALESCE(current_quantity, 0) + NEW.quantity)
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
