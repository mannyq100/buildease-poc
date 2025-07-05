-- Migration: 022_notifications_table.sql
-- Purpose: Create notifications table for the BuildEase notification system

-- Notifications table
CREATE TABLE construction_mgr.be_notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Trigger for updating updated_at
CREATE TRIGGER update_be_notification_modtime
    BEFORE UPDATE ON construction_mgr.be_notification
    FOR EACH ROW
    EXECUTE FUNCTION construction_mgr.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_notification_user_id ON construction_mgr.be_notification(user_id);
CREATE INDEX idx_notification_read ON construction_mgr.be_notification(user_id, read);
CREATE INDEX idx_notification_created_at ON construction_mgr.be_notification(created_at DESC);
CREATE INDEX idx_notification_type ON construction_mgr.be_notification(notification_type);
CREATE INDEX idx_notification_expires ON construction_mgr.be_notification(expires_at) WHERE expires_at IS NOT NULL;

-- Function to automatically clean up expired notifications
CREATE OR REPLACE FUNCTION construction_mgr.cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM construction_mgr.be_notification
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample notifications for testing
INSERT INTO construction_mgr.be_notification (user_id, title, message, notification_type, metadata) 
SELECT 
    u.id,
    'Welcome to BuildEase!',
    'Your account has been successfully created. Start by creating your first construction project.',
    'general',
    jsonb_build_object('welcome', true, 'created_at', CURRENT_TIMESTAMP)
FROM construction_mgr.be_user u
WHERE u.status = 'ACTIVE'
LIMIT 5; -- Only add welcome notifications for first 5 users to avoid spam