-- Enhanced database schema with categories, tags, expiration, and admin features
-- Run this after the basic setup-database.sql

-- Add categories, tags, expiration, and admin features to polls table
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_multiple_votes BOOLEAN DEFAULT false;

-- Create categories table for predefined categories
CREATE TABLE IF NOT EXISTS poll_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO poll_categories (name, description, color) VALUES
('General', 'General purpose polls', '#6B7280'),
('Business', 'Business and workplace polls', '#059669'),
('Entertainment', 'Movies, music, games, and fun', '#DC2626'),
('Sports', 'Sports and fitness related polls', '#2563EB'),
('Technology', 'Tech, software, and gadgets', '#7C3AED'),
('Education', 'Learning and academic polls', '#D97706'),
('Health', 'Health and wellness polls', '#DC2626'),
('Food', 'Food and restaurant polls', '#059669'),
('Travel', 'Travel and destinations', '#0891B2'),
('Politics', 'Political and civic polls', '#4338CA')
ON CONFLICT (name) DO NOTHING;

-- Comments table for real-time comments on polls
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll views/analytics table
CREATE TABLE IF NOT EXISTS poll_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID,
  anonymous_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll reports table for moderation
CREATE TABLE IF NOT EXISTS poll_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  reporter_user_id UUID,
  reporter_anonymous_id TEXT,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_category ON polls(category);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_views_poll_id ON poll_views(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_reports_status ON poll_reports(status);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_poll_stats(poll_uuid UUID)
RETURNS TABLE(
  total_votes BIGINT,
  unique_voters BIGINT,
  total_views BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM votes v JOIN options o ON v.option_id = o.id WHERE o.poll_id = poll_uuid) as total_votes,
    (SELECT COUNT(DISTINCT COALESCE(v.user_id::text, v.anonymous_id)) FROM votes v JOIN options o ON v.option_id = o.id WHERE o.poll_id = poll_uuid) as unique_voters,
    (SELECT COUNT(*) FROM poll_views WHERE poll_id = poll_uuid) as total_views,
    (SELECT COUNT(DISTINCT COALESCE(user_id::text, anonymous_id)) FROM poll_views WHERE poll_id = poll_uuid) as unique_viewers;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically deactivate expired polls
CREATE OR REPLACE FUNCTION deactivate_expired_polls()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE polls 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Function to make a user an admin (for manual admin assignment)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT, admin_role VARCHAR(20) DEFAULT 'admin')
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Find user by email from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', user_email;
    RETURN FALSE;
  END IF;
  
  -- Check if user is already an admin
  SELECT EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = target_user_id
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE 'User % is already an admin', user_email;
    RETURN FALSE;
  END IF;
  
  -- Insert into admin_users
  INSERT INTO admin_users (user_id, role, permissions) 
  VALUES (target_user_id, admin_role, ARRAY['read', 'write', 'moderate', 'analytics']);
  
  RAISE NOTICE 'User % has been made an admin with role %', user_email, admin_role;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to remove admin privileges
CREATE OR REPLACE FUNCTION remove_admin_privileges(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', user_email;
    RETURN FALSE;
  END IF;
  
  -- Remove from admin_users
  DELETE FROM admin_users WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Admin privileges removed for user %', user_email;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin by email
CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is admin
  SELECT EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = target_user_id
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: Replace 'your-email@example.com' with your actual email address
-- Uncomment the line below and replace with your email to make yourself the first admin
-- SELECT make_user_admin('your-email@example.com', 'super_admin');

-- Example usage after running this script:
-- To make someone an admin: SELECT make_user_admin('user@example.com');
-- To check if someone is admin: SELECT is_user_admin('user@example.com');
-- To remove admin: SELECT remove_admin_privileges('user@example.com');
