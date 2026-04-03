package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/omega-glitch-escape/backend/models"
	"github.com/omega-glitch-escape/backend/services"
)

type TeamHandler struct {
	teamService *services.TeamService
}

func NewTeamHandler(teamService *services.TeamService) *TeamHandler {
	return &TeamHandler{
		teamService: teamService,
	}
}

func (h *TeamHandler) GetCurrentTeam(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	// Check if time has expired and auto-complete game
	if team.TimeRemaining <= 0 && team.CompletedAt == nil {
		// Time expired - auto-complete the game
		updates := map[string]interface{}{
			"completed_at": "now()",
			"is_active":    false,
		}
		
		if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err == nil {
			// Refresh team data to get updated completion status
			team, _ = h.teamService.GetTeam(c.Context(), teamID)
		}
	}

	// Don't send password
	team.Password = ""

	return c.JSON(team)
}

func (h *TeamHandler) UpdateProgress(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)

	var req models.UpdateProgressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.teamService.UpdateProgress(c.Context(), teamID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update progress",
		})
	}

	// Record level completion if stage is provided
	if req.Stage != "" {
		h.teamService.RecordLevelCompletion(c.Context(), teamID, req.CurrentLevel, req.Stage)
	}

	return c.JSON(fiber.Map{
		"message": "Progress updated successfully",
	})
}

func (h *TeamHandler) CompleteGame(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)

	var req struct {
		FinalScore    int `json:"final_score"`
		TimeRemaining int `json:"time_remaining"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get current team to check if already completed
	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	if team.CompletedAt != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Game already completed",
		})
	}

	// Update team with completion
	updates := map[string]interface{}{
		"score":          req.FinalScore,
		"time_remaining": req.TimeRemaining,
		"completed_at":   "now()",
		"is_active":      false,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to complete game",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Game completed successfully",
	})
}

func (h *TeamHandler) GetLeaderboard(c *fiber.Ctx) error {
	leaderboard, err := h.teamService.GetLeaderboard(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch leaderboard",
		})
	}

	return c.JSON(leaderboard)
}

func (h *TeamHandler) GetLiveLeaderboard(c *fiber.Ctx) error {
	// Get all active teams (not disqualified)
	teams, err := h.teamService.GetAllTeams(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch teams",
		})
	}

	type LiveLeaderboardEntry struct {
		Rank      int    `json:"rank"`
		TeamName  string `json:"team_name"`
		Score     int    `json:"score"`
		Level     int    `json:"level"`
		IsActive  bool   `json:"is_active"`
	}

	var leaderboard []LiveLeaderboardEntry

	for _, team := range teams {
		// Skip disqualified teams
		if team.IsDisqualified {
			continue
		}

		// Calculate ranking score (same logic as admin leaderboard but simplified)
		rankingScore := float64(team.Score)
		rankingScore += float64(team.CurrentLevel * team.CurrentLevel * 200)
		
		timeBonusPercent := float64(team.TimeRemaining) / 10800.0
		if team.CompletedAt != nil {
			rankingScore += timeBonusPercent * 1000
			rankingScore += 2000
		} else {
			rankingScore += timeBonusPercent * 200
		}

		leaderboard = append(leaderboard, LiveLeaderboardEntry{
			TeamName:  team.TeamName,
			Score:     team.Score,
			Level:     team.CurrentLevel,
			IsActive:  team.IsActive && team.CompletedAt == nil,
		})
	}

	// Sort by score (descending) - we'll use the same ranking logic
	// For simplicity, just sort by score + level bonus
	for i := 0; i < len(leaderboard); i++ {
		for j := i + 1; j < len(leaderboard); j++ {
			scoreI := float64(leaderboard[i].Score) + float64(leaderboard[i].Level*leaderboard[i].Level*200)
			scoreJ := float64(leaderboard[j].Score) + float64(leaderboard[j].Level*leaderboard[j].Level*200)
			if scoreJ > scoreI {
				leaderboard[i], leaderboard[j] = leaderboard[j], leaderboard[i]
			}
		}
	}

	// Assign ranks
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	// Limit to top 20 for performance
	if len(leaderboard) > 20 {
		leaderboard = leaderboard[:20]
	}

	return c.JSON(leaderboard)
}

func (h *TeamHandler) DisqualifyTeam(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)

	var req models.DisqualifyTeamRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Reason == "" {
		req.Reason = "Anti-cheat violation"
	}

	if err := h.teamService.DisqualifyTeam(c.Context(), teamID, req.Reason); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to disqualify team",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Team disqualified",
		"reason":  req.Reason,
	})
}
