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
