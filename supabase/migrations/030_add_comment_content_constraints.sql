-- Migration: 030_add_comment_content_constraints.sql
-- Purpose: Add content length constraints and improve comment table security
-- Date: August 3, 2025

-- Add content length constraint (2000 characters max)
ALTER TABLE construction_mgr.comment 
ADD CONSTRAINT chk_comment_content_length 
CHECK (char_length(content) <= 2000 AND char_length(content) > 0);

-- Add content sanitization constraint (no HTML tags)
ALTER TABLE construction_mgr.comment 
ADD CONSTRAINT chk_comment_content_safe 
CHECK (content !~ '<[^>]*>');

-- Add index for performance on content searches
CREATE INDEX IF NOT EXISTS idx_comment_content_gin 
ON construction_mgr.comment 
USING gin (to_tsvector('english', content));

-- Add table comment for documentation
COMMENT ON CONSTRAINT chk_comment_content_length ON construction_mgr.comment IS 'Ensures comment content is between 1 and 2000 characters';
COMMENT ON CONSTRAINT chk_comment_content_safe ON construction_mgr.comment IS 'Prevents HTML injection by blocking HTML tags';