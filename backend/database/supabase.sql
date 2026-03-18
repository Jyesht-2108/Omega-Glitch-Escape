-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    current_level INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    time_remaining INTEGER DEFAULT 10800, -- 3 hours in seconds
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create team_progress table
CREATE TABLE IF NOT EXISTS team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    stage VARCHAR(50),
    hints_used INTEGER DEFAULT 0,
    attempts_count INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_team_progress_team_id ON team_progress(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_completed_at ON teams(completed_at);
CREATE INDEX IF NOT EXISTS idx_teams_score ON teams(score DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for teams table
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role to do everything)
CREATE POLICY "Service role can do everything on teams" ON teams
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on team_progress" ON team_progress
    FOR ALL USING (true);
