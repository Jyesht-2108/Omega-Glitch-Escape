package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/omega-glitch-escape/backend/config"
	"github.com/omega-glitch-escape/backend/models"
	supabase "github.com/supabase-community/supabase-go"
	postgrest "github.com/supabase/postgrest-go"
	"golang.org/x/crypto/bcrypt"
)

type TeamService struct {
	client *supabase.Client
	cfg    *config.Config
}

func NewTeamService(cfg *config.Config) (*TeamService, error) {
	client, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseServiceKey, nil)
	if err != nil {
		return nil, err
	}

	return &TeamService{
		client: client,
		cfg:    cfg,
	}, nil
}

func (s *TeamService) CreateTeam(ctx context.Context, req models.CreateTeamRequest) (*models.Team, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	team := map[string]interface{}{
		"team_name":      req.TeamName,
		"password":       string(hashedPassword),
		"current_level":  1,
		"score":          0,
		"time_remaining": 10800,
		"is_active":      true,
	}

	data, _, err := s.client.From("teams").Insert(team, false, "", "", "").Execute()
	if err != nil {
		return nil, fmt.Errorf("database error: %v", err)
	}

	var result []models.Team
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("unmarshal error: %v", err)
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("failed to create team")
	}

	return &result[0], nil
}

func (s *TeamService) AuthenticateTeam(ctx context.Context, req models.LoginRequest) (*models.Team, error) {
	data, _, err := s.client.From("teams").
		Select("*", "", false).
		Eq("team_name", req.TeamName).
		Execute()

	if err != nil {
		return nil, err
	}

	var teams []models.Team
	if err := json.Unmarshal(data, &teams); err != nil {
		return nil, err
	}

	if len(teams) == 0 {
		return nil, fmt.Errorf("team not found")
	}

	team := teams[0]

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(team.Password), []byte(req.Password))
	if err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	// Update started_at if first login
	if team.StartedAt == nil {
		now := time.Now()
		customTime := models.CustomTime{Time: now}
		team.StartedAt = &customTime
		s.UpdateTeam(ctx, team.ID, map[string]interface{}{
			"started_at": now.Format("2006-01-02T15:04:05"),
		})
	}

	return &team, nil
}

func (s *TeamService) GetTeam(ctx context.Context, teamID string) (*models.Team, error) {
	data, _, err := s.client.From("teams").
		Select("*", "", false).
		Eq("id", teamID).
		Execute()

	if err != nil {
		return nil, err
	}

	var teams []models.Team
	if err := json.Unmarshal(data, &teams); err != nil {
		return nil, err
	}

	if len(teams) == 0 {
		return nil, fmt.Errorf("team not found")
	}

	return &teams[0], nil
}

func (s *TeamService) UpdateTeam(ctx context.Context, teamID string, updates map[string]interface{}) error {
	updates["updated_at"] = time.Now()

	_, _, err := s.client.From("teams").
		Update(updates, "", "").
		Eq("id", teamID).
		Execute()

	return err
}

func (s *TeamService) UpdateProgress(ctx context.Context, teamID string, req models.UpdateProgressRequest) error {
	updates := map[string]interface{}{
		"current_level":  req.CurrentLevel,
		"score":          req.Score,
		"time_remaining": req.TimeRemaining,
	}

	return s.UpdateTeam(ctx, teamID, updates)
}

func (s *TeamService) RecordLevelCompletion(ctx context.Context, teamID string, level int, stage string) error {
	progress := map[string]interface{}{
		"team_id":      teamID,
		"level":        level,
		"stage":        stage,
		"completed_at": time.Now(),
	}

	_, _, err := s.client.From("team_progress").Insert(progress, false, "", "", "").Execute()
	return err
}

func (s *TeamService) GetLeaderboard(ctx context.Context) ([]models.LeaderboardEntry, error) {
	data, _, err := s.client.From("teams").
		Select("*", "", false).
		Not("completed_at", "is", "null").
		Order("score", &postgrest.OrderOpts{Ascending: false, NullsFirst: false}).
		Order("completed_at", &postgrest.OrderOpts{Ascending: true, NullsFirst: false}).
		Limit(10, "").
		Execute()

	if err != nil {
		return nil, err
	}

	var teams []models.Team
	if err := json.Unmarshal(data, &teams); err != nil {
		return nil, err
	}

	leaderboard := make([]models.LeaderboardEntry, len(teams))
	for i, team := range teams {
		timeElapsed := "N/A"
		if team.StartedAt != nil && team.CompletedAt != nil {
			duration := team.CompletedAt.Sub(team.StartedAt.Time)
			hours := int(duration.Hours())
			minutes := int(duration.Minutes()) % 60
			seconds := int(duration.Seconds()) % 60
			timeElapsed = fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
		}

		completedAt := "N/A"
		if team.CompletedAt != nil && !team.CompletedAt.IsZero() {
			completedAt = team.CompletedAt.Format("2006-01-02 15:04:05")
		}

		leaderboard[i] = models.LeaderboardEntry{
			Rank:        i + 1,
			TeamName:    team.TeamName,
			Score:       team.Score,
			TimeElapsed: timeElapsed,
			CompletedAt: completedAt,
		}
	}

	return leaderboard, nil
}

func (s *TeamService) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	data, _, err := s.client.From("teams").
		Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false, NullsFirst: false}).
		Execute()

	if err != nil {
		return nil, err
	}

	var teams []models.Team
	if err := json.Unmarshal(data, &teams); err != nil {
		return nil, err
	}

	return teams, nil
}

func (s *TeamService) DeleteTeam(ctx context.Context, teamID string) error {
	_, _, err := s.client.From("teams").
		Delete("", "").
		Eq("id", teamID).
		Execute()

	return err
}
