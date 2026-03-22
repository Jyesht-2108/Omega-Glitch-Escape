package handlers

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/omega-glitch-escape/backend/models"
	"github.com/omega-glitch-escape/backend/services"
)

type AdminHandler struct {
	teamService *services.TeamService
}

func NewAdminHandler(teamService *services.TeamService) *AdminHandler {
	return &AdminHandler{
		teamService: teamService,
	}
}

// Log admin action
func (h *AdminHandler) logAdminAction(c *fiber.Ctx, actionType string, teamID *string, teamName string, details interface{}) error {
	adminUsername := c.Locals("admin_username")
	if adminUsername == nil {
		adminUsername = "admin"
	}
	
	detailsJSON, _ := json.Marshal(details)
	
	logEntry := map[string]interface{}{
		"admin_username":   adminUsername,
		"action_type":      actionType,
		"target_team_id":   teamID,
		"target_team_name": teamName,
		"details":          string(detailsJSON),
	}
	
	_, _, err := h.teamService.GetClient().From("admin_actions").Insert(logEntry, false, "", "", "").Execute()
	return err
}

func (h *AdminHandler) CreateTeam(c *fiber.Ctx) error {
	var req models.CreateTeamRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.TeamName == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Team name and password are required",
		})
	}

	team, err := h.teamService.CreateTeam(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create team: " + err.Error(),
		})
	}

	h.logAdminAction(c, "CREATE_TEAM", &team.ID, team.TeamName, fiber.Map{
		"team_name": team.TeamName,
	})

	team.Password = ""
	return c.Status(fiber.StatusCreated).JSON(team)
}

func (h *AdminHandler) GetAllTeams(c *fiber.Ctx) error {
	teams, err := h.teamService.GetAllTeams(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch teams",
		})
	}

	for i := range teams {
		teams[i].Password = ""
	}

	return c.JSON(teams)
}

func (h *AdminHandler) GetTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	team.Password = ""
	return c.JSON(team)
}

func (h *AdminHandler) UpdateTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	delete(updates, "password")
	delete(updates, "id")

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update team",
		})
	}

	team, _ := h.teamService.GetTeam(c.Context(), teamID)
	h.logAdminAction(c, "UPDATE_TEAM", &teamID, team.TeamName, updates)

	return c.JSON(fiber.Map{
		"message": "Team updated successfully",
	})
}

func (h *AdminHandler) DeleteTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	if err := h.teamService.DeleteTeam(c.Context(), teamID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete team",
		})
	}

	h.logAdminAction(c, "DELETE_TEAM", &teamID, team.TeamName, nil)

	return c.JSON(fiber.Map{
		"message": "Team deleted successfully",
	})
}

func (h *AdminHandler) ResetTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	updates := map[string]interface{}{
		"current_level":            1,
		"score":                    0,
		"time_remaining":           10800,
		"custom_time_bonus":        0,
		"custom_score_adjustment":  0,
		"is_active":                true,
		"is_disqualified":          false,
		"disqualified_reason":      nil,
		"disqualified_at":          nil,
		"started_at":               nil,
		"completed_at":             nil,
		"tab_switches":             0,
		"suspicious_activity_count": 0,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset team",
		})
	}

	h.logAdminAction(c, "RESET_TEAM", &teamID, team.TeamName, nil)

	return c.JSON(fiber.Map{
		"message": "Team reset successfully",
	})
}

func (h *AdminHandler) DisqualifyTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	var req models.DisqualifyTeamRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	now := time.Now()
	updates := map[string]interface{}{
		"is_disqualified":     true,
		"disqualified_reason": req.Reason,
		"disqualified_at":     now,
		"is_active":           false,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to disqualify team",
		})
	}

	h.logAdminAction(c, "DISQUALIFY_TEAM", &teamID, team.TeamName, fiber.Map{
		"reason": req.Reason,
	})

	return c.JSON(fiber.Map{
		"message": "Team disqualified successfully",
	})
}

func (h *AdminHandler) RequalifyTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	updates := map[string]interface{}{
		"is_disqualified":     false,
		"disqualified_reason": nil,
		"disqualified_at":     nil,
		"is_active":           true,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to requalify team",
		})
	}

	h.logAdminAction(c, "REQUALIFY_TEAM", &teamID, team.TeamName, nil)

	return c.JSON(fiber.Map{
		"message": "Team requalified successfully",
	})
}

func (h *AdminHandler) AdjustTime(c *fiber.Ctx) error {
	teamID := c.Params("id")

	var req models.AdjustTimeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	newTimeRemaining := team.TimeRemaining + req.TimeAdjustment
	if newTimeRemaining < 0 {
		newTimeRemaining = 0
	}

	updates := map[string]interface{}{
		"time_remaining":   newTimeRemaining,
		"custom_time_bonus": team.CustomTimeBonus + req.TimeAdjustment,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to adjust time",
		})
	}

	h.logAdminAction(c, "ADJUST_TIME", &teamID, team.TeamName, fiber.Map{
		"adjustment": req.TimeAdjustment,
		"reason":     req.Reason,
	})

	return c.JSON(fiber.Map{
		"message":        "Time adjusted successfully",
		"time_remaining": newTimeRemaining,
	})
}

func (h *AdminHandler) AdjustScore(c *fiber.Ctx) error {
	teamID := c.Params("id")

	var req models.AdjustScoreRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	newScore := team.Score + req.ScoreAdjustment
	if newScore < 0 {
		newScore = 0
	}

	updates := map[string]interface{}{
		"score":                   newScore,
		"custom_score_adjustment": team.CustomScoreAdjustment + req.ScoreAdjustment,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to adjust score",
		})
	}

	h.logAdminAction(c, "ADJUST_SCORE", &teamID, team.TeamName, fiber.Map{
		"adjustment": req.ScoreAdjustment,
		"reason":     req.Reason,
	})

	return c.JSON(fiber.Map{
		"message": "Score adjusted successfully",
		"score":   newScore,
	})
}

func (h *AdminHandler) GetStats(c *fiber.Ctx) error {
	teams, err := h.teamService.GetAllTeams(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch stats",
		})
	}

	totalTeams := len(teams)
	activeTeams := 0
	completedTeams := 0
	disqualifiedTeams := 0
	totalScore := 0
	totalTime := 0
	levelDistribution := make(map[int]int)

	for _, team := range teams {
		if team.IsActive && !team.IsDisqualified {
			activeTeams++
		}
		if team.CompletedAt != nil {
			completedTeams++
		}
		if team.IsDisqualified {
			disqualifiedTeams++
		}
		totalScore += team.Score
		if team.StartedAt != nil {
			elapsed := 10800 - team.TimeRemaining
			totalTime += elapsed
		}
		levelDistribution[team.CurrentLevel]++
	}

	avgScore := 0
	avgTime := 0
	if totalTeams > 0 {
		avgScore = totalScore / totalTeams
	}
	if completedTeams > 0 {
		avgTime = totalTime / completedTeams
	}

	return c.JSON(fiber.Map{
		"total_teams":        totalTeams,
		"active_teams":       activeTeams,
		"completed_teams":    completedTeams,
		"disqualified_teams": disqualifiedTeams,
		"average_score":      avgScore,
		"average_time":       avgTime,
		"level_distribution": levelDistribution,
	})
}

func (h *AdminHandler) GetAdminLogs(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 100)
	
	data, _, err := h.teamService.GetClient().From("admin_actions").
		Select("*", "", false).
		Order("created_at", nil).
		Limit(limit, "").
		Execute()
	
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch logs",
		})
	}

	var logs []models.AdminAction
	if err := json.Unmarshal(data, &logs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse logs",
		})
	}

	return c.JSON(logs)
}

func (h *AdminHandler) BulkAction(c *fiber.Ctx) error {
	var req models.BulkActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	successCount := 0
	failedTeams := []string{}

	for _, teamID := range req.TeamIDs {
		var err error
		
		switch req.Action {
		case "disqualify":
			updates := map[string]interface{}{
				"is_disqualified":     true,
				"disqualified_reason": req.Reason,
				"disqualified_at":     time.Now(),
				"is_active":           false,
			}
			err = h.teamService.UpdateTeam(c.Context(), teamID, updates)
			
		case "reset":
			updates := map[string]interface{}{
				"current_level":            1,
				"score":                    0,
				"time_remaining":           10800,
				"is_active":                true,
				"is_disqualified":          false,
				"disqualified_reason":      nil,
				"started_at":               nil,
				"completed_at":             nil,
			}
			err = h.teamService.UpdateTeam(c.Context(), teamID, updates)
			
		case "delete":
			err = h.teamService.DeleteTeam(c.Context(), teamID)
		}

		if err != nil {
			failedTeams = append(failedTeams, teamID)
		} else {
			successCount++
			team, _ := h.teamService.GetTeam(c.Context(), teamID)
			h.logAdminAction(c, "BULK_"+req.Action, &teamID, team.TeamName, fiber.Map{
				"reason": req.Reason,
			})
		}
	}

	return c.JSON(fiber.Map{
		"message":       "Bulk action completed",
		"success_count": successCount,
		"failed_teams":  failedTeams,
	})
}

func (h *AdminHandler) GetTeamProgress(c *fiber.Ctx) error {
	teamID := c.Params("id")

	data, _, err := h.teamService.GetClient().From("team_progress").
		Select("*", "", false).
		Eq("team_id", teamID).
		Order("level", nil).
		Order("created_at", nil).
		Execute()

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch progress",
		})
	}

	var progress []models.TeamProgress
	if err := json.Unmarshal(data, &progress); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse progress",
		})
	}

	return c.JSON(progress)
}

func (h *AdminHandler) GetAdvancedLeaderboard(c *fiber.Ctx) error {
	// Get all teams with their progress
	teams, err := h.teamService.GetAllTeams(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch teams",
		})
	}

	type LeaderboardEntry struct {
		Rank                    int     `json:"rank"`
		TeamName                string  `json:"team_name"`
		TeamID                  string  `json:"team_id"`
		CurrentLevel            int     `json:"current_level"`
		Score                   int     `json:"score"`
		TimeElapsed             int     `json:"time_elapsed"`
		TimeRemaining           int     `json:"time_remaining"`
		TotalHintsUsed          int     `json:"total_hints_used"`
		TotalAttempts           int     `json:"total_attempts"`
		TotalWrongAttempts      int     `json:"total_wrong_attempts"`
		TabSwitches             int     `json:"tab_switches"`
		SuspiciousActivityCount int     `json:"suspicious_activity_count"`
		IsCompleted             bool    `json:"is_completed"`
		IsDisqualified          bool    `json:"is_disqualified"`
		CompletedAt             *string `json:"completed_at,omitempty"`
		RankingScore            float64 `json:"ranking_score"`
	}

	var leaderboard []LeaderboardEntry

	for _, team := range teams {
		// Get team progress details
		progressData, _, _ := h.teamService.GetClient().From("team_progress").
			Select("*", "", false).
			Eq("team_id", team.ID).
			Execute()

		var progress []models.TeamProgress
		json.Unmarshal(progressData, &progress)

		totalHints := 0
		totalAttempts := 0
		totalWrongAttempts := 0
		for _, p := range progress {
			totalHints += p.HintsUsed
			totalAttempts += p.AttemptsCount
			totalWrongAttempts += p.WrongAttempts
		}

		timeElapsed := 10800 - team.TimeRemaining
		
		// Calculate ranking score (higher is better)
		// Formula: Base score from game + bonuses - penalties
		rankingScore := float64(team.Score)
		
		// Level completion bonus (exponential)
		rankingScore += float64(team.CurrentLevel * team.CurrentLevel * 100)
		
		// Time bonus (faster is better)
		if team.CompletedAt != nil {
			timeBonusPercent := float64(team.TimeRemaining) / 10800.0
			rankingScore += timeBonusPercent * 500
		}
		
		// Penalties
		rankingScore -= float64(totalHints * 50)           // -50 per hint
		rankingScore -= float64(totalWrongAttempts * 20)   // -20 per wrong attempt
		rankingScore -= float64(team.TabSwitches * 30)     // -30 per tab switch
		rankingScore -= float64(team.SuspiciousActivityCount * 100) // -100 per suspicious activity
		
		// Disqualification penalty
		if team.IsDisqualified {
			rankingScore = -999999
		}

		var completedAtStr *string
		if team.CompletedAt != nil {
			str := team.CompletedAt.Format("2006-01-02 15:04:05")
			completedAtStr = &str
		}

		leaderboard = append(leaderboard, LeaderboardEntry{
			TeamName:                team.TeamName,
			TeamID:                  team.ID,
			CurrentLevel:            team.CurrentLevel,
			Score:                   team.Score,
			TimeElapsed:             timeElapsed,
			TimeRemaining:           team.TimeRemaining,
			TotalHintsUsed:          totalHints,
			TotalAttempts:           totalAttempts,
			TotalWrongAttempts:      totalWrongAttempts,
			TabSwitches:             team.TabSwitches,
			SuspiciousActivityCount: team.SuspiciousActivityCount,
			IsCompleted:             team.CompletedAt != nil,
			IsDisqualified:          team.IsDisqualified,
			CompletedAt:             completedAtStr,
			RankingScore:            rankingScore,
		})
	}

	// Sort by ranking score (descending)
	for i := 0; i < len(leaderboard); i++ {
		for j := i + 1; j < len(leaderboard); j++ {
			if leaderboard[j].RankingScore > leaderboard[i].RankingScore {
				leaderboard[i], leaderboard[j] = leaderboard[j], leaderboard[i]
			}
		}
	}

	// Assign ranks
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	return c.JSON(leaderboard)
}
