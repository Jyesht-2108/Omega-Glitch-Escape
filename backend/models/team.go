package models

type Team struct {
	ID                      string      `json:"id"`
	TeamName                string      `json:"team_name"`
	Password                string      `json:"password,omitempty"`
	CurrentLevel            int         `json:"current_level"`
	Score                   int         `json:"score"`
	TimeRemaining           int         `json:"time_remaining"` // in seconds
	CustomTimeBonus         int         `json:"custom_time_bonus"`
	CustomScoreAdjustment   int         `json:"custom_score_adjustment"`
	IsActive                bool        `json:"is_active"`
	IsDisqualified          bool        `json:"is_disqualified"`
	DisqualifiedReason      string      `json:"disqualified_reason,omitempty"`
	DisqualifiedAt          *CustomTime `json:"disqualified_at,omitempty"`
	StartedAt               *CustomTime `json:"started_at,omitempty"`
	CompletedAt             *CustomTime `json:"completed_at,omitempty"`
	TabSwitches             int         `json:"tab_switches"`
	SuspiciousActivityCount int         `json:"suspicious_activity_count"`
	LastActivity            *CustomTime `json:"last_activity,omitempty"`
	CreatedAt               CustomTime  `json:"created_at"`
	UpdatedAt               CustomTime  `json:"updated_at"`
}

type TeamProgress struct {
	ID             string      `json:"id"`
	TeamID         string      `json:"team_id"`
	Level          int         `json:"level"`
	Stage          string      `json:"stage"`
	HintsUsed      int         `json:"hints_used"`
	AttemptsCount  int         `json:"attempts_count"`
	WrongAttempts  int         `json:"wrong_attempts"`
	TimeSpent      int         `json:"time_spent"`
	CompletedAt    *CustomTime `json:"completed_at,omitempty"`
	CreatedAt      CustomTime  `json:"created_at"`
}

type LeaderboardEntry struct {
	Rank        int    `json:"rank"`
	TeamName    string `json:"team_name"`
	Score       int    `json:"score"`
	TimeElapsed string `json:"time_elapsed"`
	CompletedAt string `json:"completed_at"`
}

type CreateTeamRequest struct {
	TeamName string `json:"team_name"`
	Password string `json:"password"`
}

type LoginRequest struct {
	TeamName string `json:"team_name"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Team  Team   `json:"team"`
}

type UpdateProgressRequest struct {
	CurrentLevel  int    `json:"current_level"`
	Score         int    `json:"score"`
	TimeRemaining int    `json:"time_remaining"`
	Stage         string `json:"stage,omitempty"`
}

type DisqualifyTeamRequest struct {
	Reason string `json:"reason"`
}

type AdminAction struct {
	ID             string      `json:"id"`
	AdminUsername  string      `json:"admin_username"`
	ActionType     string      `json:"action_type"`
	TargetTeamID   *string     `json:"target_team_id,omitempty"`
	TargetTeamName string      `json:"target_team_name,omitempty"`
	Details        interface{} `json:"details,omitempty"`
	CreatedAt      CustomTime  `json:"created_at"`
}

type AdjustTimeRequest struct {
	TimeAdjustment int    `json:"time_adjustment"` // positive to add, negative to subtract
	Reason         string `json:"reason"`
}

type AdjustScoreRequest struct {
	ScoreAdjustment int    `json:"score_adjustment"` // positive to add, negative to subtract
	Reason          string `json:"reason"`
}

type BulkActionRequest struct {
	TeamIDs []string `json:"team_ids"`
	Action  string   `json:"action"` // "disqualify", "reset", "delete"
	Reason  string   `json:"reason,omitempty"`
}
