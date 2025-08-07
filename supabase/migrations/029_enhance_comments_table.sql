-- Migration: 029_enhance_comments_table.sql
-- Purpose: Enhance the comment table to support threaded comments
-- Date: August 3, 2025

-- Add parent_comment_id for threaded comments
ALTER TABLE construction_mgr.comment
ADD COLUMN parent_comment_id UUID REFERENCES construction_mgr.comment(id) ON DELETE CASCADE;

-- Create index for better performance on threaded queries
CREATE INDEX idx_comment_parent ON construction_mgr.comment(parent_comment_id);

-- Update existing RLS policies to handle threaded comments
DROP POLICY IF EXISTS "Users can view comments for entities they have access to" ON construction_mgr.comment;
DROP POLICY IF EXISTS "Users can create comments for entities they have access to" ON construction_mgr.comment;

-- Enhanced RLS policies for comments
CREATE POLICY "Users can view comments for entities they have access to"
    ON construction_mgr.comment
    FOR SELECT
    USING (
        -- Direct entity access check
        (entity_type = 'project' AND 
         entity_id IN (
             SELECT p.id 
             FROM construction_mgr.be_project p 
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
        OR
        (entity_type = 'task' AND 
         entity_id IN (
             SELECT t.id 
             FROM construction_mgr.be_task t
             JOIN construction_mgr.be_project p ON t.project_id = p.id
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
        OR
        (entity_type = 'phase' AND 
         entity_id IN (
             SELECT ph.id 
             FROM construction_mgr.be_phase ph
             JOIN construction_mgr.be_project p ON ph.project_id = p.id
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
    );

CREATE POLICY "Users can create comments for entities they have access to"
    ON construction_mgr.comment
    FOR INSERT
    WITH CHECK (
        -- Check access to the entity being commented on
        (entity_type = 'project' AND 
         entity_id IN (
             SELECT p.id 
             FROM construction_mgr.be_project p 
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
        OR
        (entity_type = 'task' AND 
         entity_id IN (
             SELECT t.id 
             FROM construction_mgr.be_task t
             JOIN construction_mgr.be_project p ON t.project_id = p.id
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
        OR
        (entity_type = 'phase' AND 
         entity_id IN (
             SELECT ph.id 
             FROM construction_mgr.be_phase ph
             JOIN construction_mgr.be_project p ON ph.project_id = p.id
             WHERE p.owner_id = auth.uid()
             OR EXISTS (
                 SELECT 1 
                 FROM construction_mgr.be_project_member pm 
                 WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
             )
         ))
        AND
        -- Ensure user_id matches the authenticated user
        user_id = auth.uid()
        AND
        -- If parent_comment_id is provided, ensure user has access to parent comment
        (parent_comment_id IS NULL OR 
         parent_comment_id IN (
             SELECT id FROM construction_mgr.comment 
             WHERE id = parent_comment_id
         ))
    );

-- Policy for users to update their own comments
CREATE POLICY "Users can update their own comments"
    ON construction_mgr.comment
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy for users to delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON construction_mgr.comment
    FOR DELETE
    USING (user_id = auth.uid());

-- Add updated_at trigger for comment table if not exists
DROP TRIGGER IF EXISTS tr_comment_updated_at ON construction_mgr.comment;
CREATE TRIGGER tr_comment_updated_at
    BEFORE UPDATE ON construction_mgr.comment
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Add table and column comments for documentation
COMMENT ON TABLE construction_mgr.comment IS 'Comments system supporting threaded conversations on projects, tasks, and phases';
COMMENT ON COLUMN construction_mgr.comment.id IS 'Unique identifier for the comment';
COMMENT ON COLUMN construction_mgr.comment.entity_type IS 'Type of entity being commented on (project, task, phase)';
COMMENT ON COLUMN construction_mgr.comment.entity_id IS 'ID of the entity being commented on';
COMMENT ON COLUMN construction_mgr.comment.user_id IS 'User who created the comment';
COMMENT ON COLUMN construction_mgr.comment.content IS 'Comment text content';
COMMENT ON COLUMN construction_mgr.comment.parent_comment_id IS 'Reference to parent comment for threaded conversations';
COMMENT ON COLUMN construction_mgr.comment.created_at IS 'Timestamp when comment was created';
COMMENT ON COLUMN construction_mgr.comment.updated_at IS 'Timestamp when comment was last updated';