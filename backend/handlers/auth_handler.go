package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/omega-glitch-escape/backend/config"
	"github.com/omega-glitch-escape/backend/middleware"
	"github.com/omega-glitch-escape/backend/models"
	"github.com/omega-glitch-escape/backend/services"
)

type AuthHandler struct {
	teamService *services.TeamService
	cfg         *config.Config
}

func NewAuthHandler(teamService *services.TeamService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		teamService: teamService,
		cfg:         cfg,
	}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	team, err := h.teamService.AuthenticateTeam(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate JWT token
	token, err := h.generateToken(team.ID, team.TeamName, false)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Don't send password in response
	team.Password = ""

	return c.JSON(models.LoginResponse{
		Token: token,
		Team:  *team,
	})
}

func (h *AuthHandler) AdminLogin(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check admin credentials
	if req.TeamName != h.cfg.AdminUsername || req.Password != h.cfg.AdminPassword {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid admin credentials",
		})
	}

	// Generate admin JWT token with username
	claims := middleware.CustomClaims{
		TeamID:   "admin",
		TeamName: "admin",
		Username: req.TeamName,
		IsAdmin:  true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": tokenString,
		"admin": true,
	})
}

func (h *AuthHandler) generateToken(teamID, teamName string, isAdmin bool) (string, error) {
	claims := middleware.CustomClaims{
		TeamID:   teamID,
		TeamName: teamName,
		IsAdmin:  isAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
}
