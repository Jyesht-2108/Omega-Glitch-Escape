-- OMEGA Admin System Migration
-- Run this to add admin features to existing database

-- Add new columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS custom_time_bonus INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS custom_score_adjustment INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS suspicious_activity_count INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;

-- Create admin_actions table for audit log
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_username VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    target_team_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create game_settings table for future use
CREATE TABLE IF NOT EXISTS game_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_team_id ON admin_actions(target_team_id);
CREATE INDEX IF NOT EXISTS idx_teams_last_activity ON teams(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_teams_suspicious_activity ON teams(suspicious_activity_count DESC);

-- Enable Row Level Security
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to do everything)
DROP POLICY IF EXISTS "Service role can do everything on admin_actions" ON admin_actions;
CREATE POLICY "Service role can do everything on admin_actions" ON admin_actions
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role can do everything on game_settings" ON game_settings;
CREATE POLICY "Service role can do everything on game_settings" ON game_settings
    FOR ALL USING (true);

-- Insert default game settings
INSERT INTO game_settings (setting_key, setting_value, updated_by)
VALUES 
    ('game_duration', '{"seconds": 10800}'::jsonb, 'system'),
    ('elimination_enabled', '{"enabled": false}'::jsonb, 'system'),
    ('max_hints_per_level', '{"max": 3}'::jsonb, 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update last_activity automatically
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic last_activity update
DROP TRIGGER IF EXISTS update_teams_last_activity ON teams;
CREATE TRIGGER update_teams_last_activity 
    BEFORE UPDATE ON teams
    FOR EACH ROW 
    WHEN (OLD.score IS DISTINCT FROM NEW.score OR 
          OLD.current_level IS DISTINCT FROM NEW.current_level OR
          OLD.time_remaining IS DISTINCT FROM NEW.time_remaining)
    EXECUTE FUNCTION update_last_activity();

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(*) as total_teams,
    COUNT(*) FILTER (WHERE is_active = true AND is_disqualified = false) as active_teams,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_teams,
    COUNT(*) FILTER (WHERE is_disqualified = true) as disqualified_teams,
    COALESCE(AVG(score), 0)::INTEGER as average_score,
    COALESCE(AVG(CASE WHEN completed_at IS NOT NULL THEN (10800 - time_remaining) END), 0)::INTEGER as average_time,
    COUNT(*) FILTER (WHERE suspicious_activity_count > 0) as suspicious_teams,
    COUNT(*) FILTER (WHERE tab_switches > 5) as high_tab_switch_teams
FROM teams;

-- Create view for team activity summary
CREATE OR REPLACE VIEW team_activity_summary AS
SELECT 
    t.id,
    t.team_name,
    t.current_level,
    t.score,
    t.time_remaining,
    t.is_active,
    t.is_disqualified,
    t.tab_switches,
    t.suspicious_activity_count,
    t.last_activity,
    COUNT(tp.id) as total_progress_entries,
    SUM(tp.hints_used) as total_hints_used,
    SUM(tp.attempts_count) as total_attempts
FROM teams t
LEFT JOIN team_progress tp ON t.id = tp.team_id
GROUP BY t.id, t.team_name, t.current_level, t.score, t.time_remaining, 
         t.is_active, t.is_disqualified, t.tab_switches, 
         t.suspicious_activity_count, t.last_activity;

-- Grant permissions to views
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT SELECT ON team_activity_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE admin_actions IS 'Audit log of all administrative actions';
COMMENT ON TABLE game_settings IS 'Global game configuration settings';
COMMENT ON COLUMN teams.custom_time_bonus IS 'Admin-adjusted time in seconds (can be positive or negative)';
COMMENT ON COLUMN teams.custom_score_adjustment IS 'Admin-adjusted score points (can be positive or negative)';
COMMENT ON COLUMN teams.tab_switches IS 'Number of times team switched browser tabs';
COMMENT ON COLUMN teams.suspicious_activity_count IS 'Counter for suspicious behavior detection';
COMMENT ON COLUMN teams.last_activity IS 'Timestamp of last meaningful team activity';

-- Migration complete
SELECT 'Admin system migration completed successfully!' as status;
