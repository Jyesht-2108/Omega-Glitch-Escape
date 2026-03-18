package models

type Team struct {
	ID            string      `json:"id"`
	TeamName      string      `json:"team_name"`
	Password      string      `json:"password,omitempty"`
	CurrentLevel  int         `json:"current_level"`
	Score         int         `json:"score"`
	TimeRemaining int         `json:"time_remaining"` // in seconds
	IsActive      bool        `json:"is_active"`
	StartedAt     *CustomTime `json:"started_at,omitempty"`
	CompletedAt   *CustomTime `json:"completed_at,omitempty"`
	CreatedAt     CustomTime  `json:"created_at"`
	UpdatedAt     CustomTime  `json:"updated_at"`
}

type TeamProgress struct {
	ID            string      `json:"id"`
	TeamID        string      `json:"team_id"`
	Level         int         `json:"level"`
	Stage         string      `json:"stage"`
	HintsUsed     int         `json:"hints_used"`
	AttemptsCount int         `json:"attempts_count"`
	CompletedAt   *CustomTime `json:"completed_at,omitempty"`
	CreatedAt     CustomTime  `json:"created_at"`
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
