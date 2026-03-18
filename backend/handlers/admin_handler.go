package handlers

import (
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

	// Don't send password in response
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

	// Remove passwords from response
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

	// Don't send password
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

	// Don't allow password updates through this endpoint
	delete(updates, "password")
	delete(updates, "id")

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update team",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Team updated successfully",
	})
}

func (h *AdminHandler) DeleteTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	if err := h.teamService.DeleteTeam(c.Context(), teamID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete team",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Team deleted successfully",
	})
}

func (h *AdminHandler) ResetTeam(c *fiber.Ctx) error {
	teamID := c.Params("id")

	updates := map[string]interface{}{
		"current_level":  1,
		"score":          0,
		"time_remaining": 10800, // 3 hours
		"is_active":      true,
		"started_at":     nil,
		"completed_at":   nil,
	}

	if err := h.teamService.UpdateTeam(c.Context(), teamID, updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset team",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Team reset successfully",
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
	totalScore := 0

	for _, team := range teams {
		if team.IsActive {
			activeTeams++
		}
		if team.CompletedAt != nil {
			completedTeams++
		}
		totalScore += team.Score
	}

	avgScore := 0
	if totalTeams > 0 {
		avgScore = totalScore / totalTeams
	}

	return c.JSON(fiber.Map{
		"total_teams":     totalTeams,
		"active_teams":    activeTeams,
		"completed_teams": completedTeams,
		"average_score":   avgScore,
	})
}
