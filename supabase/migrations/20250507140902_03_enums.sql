-- Create enum types in the construction_mgr schema
CREATE TYPE construction_mgr.auth_provider AS ENUM ('GOOGLE', 'FACEBOOK', 'LINKEDIN', 'AUTH0', 'EMAIL');

-- Transaction types for financial transactions
CREATE TYPE construction_mgr.transaction_type AS ENUM (
  'MATERIAL_PURCHASE',
  'LABOR',
  'EQUIPMENT_RENTAL',
  'PERMIT_FEE',
  'DESIGN_FEE',
  'OTHER'
);
CREATE TYPE construction_mgr.user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE construction_mgr.token_type AS ENUM ('ACCESS', 'REFRESH');
CREATE TYPE construction_mgr.user_role AS ENUM ('OWNER', 'CONTRACTOR', 'SUPPLIER', 'WORKER', 'ADMIN', 'USER');
CREATE TYPE construction_mgr.user_tier AS ENUM ('BASIC', 'PREMIUM', 'PROFESSIONAL');
CREATE TYPE construction_mgr.project_status AS ENUM ('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
CREATE TYPE construction_mgr.phase_category AS ENUM (
    'PREPARATORY',
    'EXCAVATION',
    'FOUNDATION',
    'STRUCTURE',
    'FLOOR_CONSTRUCTION',
    'ROOFING',
    'SERVICES',
    'FINISHES',
    'FIXTURES',
    'LANDSCAPING',
    'INSPECTIONS',
    'HANDOVER',
    'OTHER'
);
CREATE TYPE construction_mgr.payment_status AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE construction_mgr.payment_method AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE');
CREATE TYPE construction_mgr.currency AS ENUM ('GHS', 'USD', 'EUR');
CREATE TYPE construction_mgr.document_type AS ENUM ('PERMIT', 'DRAWING', 'CONTRACT', 'INVOICE', 'RECEIPT', 'REPORT', 'SPECIFICATION', 'SCHEDULE', 'PHOTO', 'VIDEO', 'MANUAL', 'CERTIFICATE', 'OTHER');

-- Permission types for role-based access control
CREATE TYPE construction_mgr.permission_type AS ENUM (
    'VIEW_BUDGET',
    'EDIT_BUDGET',
    'VIEW_FINANCIALS',
    'EDIT_FINANCIALS',
    'MANAGE_USERS',
    'MANAGE_PHASES',
    'MANAGE_MATERIALS',
    'MANAGE_DOCUMENTS'
);
