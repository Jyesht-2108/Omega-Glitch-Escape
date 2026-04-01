package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/omega-glitch-escape/backend/config"
	"github.com/omega-glitch-escape/backend/handlers"
	"github.com/omega-glitch-escape/backend/middleware"
	"github.com/omega-glitch-escape/backend/services"
)

func Setup(app *fiber.App, cfg *config.Config) {
	// Initialize services
	teamService, err := services.NewTeamService(cfg)
	if err != nil {
		panic("Failed to initialize team service: " + err.Error())
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(teamService, cfg)
	teamHandler := handlers.NewTeamHandler(teamService)
	adminHandler := handlers.NewAdminHandler(teamService)
	puzzleHandler := handlers.NewPuzzleHandler(teamService)

	// API routes
	api := app.Group("/api")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"message": "OMEGA Glitch Escape API is running",
		})
	})

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/login", authHandler.Login)
	auth.Post("/admin/login", authHandler.AdminLogin)

	// Team routes (protected)
	team := api.Group("/team")
	team.Use(middleware.AuthRequired(cfg))
	team.Get("/me", teamHandler.GetCurrentTeam)
	team.Put("/progress", teamHandler.UpdateProgress)
	team.Post("/complete", teamHandler.CompleteGame)
	team.Post("/disqualify", teamHandler.DisqualifyTeam)

	// Puzzle routes (protected)
	puzzle := api.Group("/puzzle")
	puzzle.Use(middleware.AuthRequired(cfg))
	puzzle.Post("/submit", puzzleHandler.SubmitAnswer)
	puzzle.Post("/hint", puzzleHandler.RequestHint)
	puzzle.Get("/hint-info/:level", puzzleHandler.GetHintInfo)

	// Leaderboard (public)
	api.Get("/leaderboard", teamHandler.GetLeaderboard)

	// Admin routes (protected + admin only)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg))
	admin.Use(middleware.AdminRequired(cfg))
	
	// Team management
	admin.Post("/teams", adminHandler.CreateTeam)
	admin.Get("/teams", adminHandler.GetAllTeams)
	admin.Get("/teams/:id", adminHandler.GetTeam)
	admin.Put("/teams/:id", adminHandler.UpdateTeam)
	admin.Delete("/teams/:id", adminHandler.DeleteTeam)
	admin.Post("/teams/:id/reset", adminHandler.ResetTeam)
	admin.Post("/teams/:id/disqualify", adminHandler.DisqualifyTeam)
	admin.Post("/teams/:id/requalify", adminHandler.RequalifyTeam)
	admin.Post("/teams/:id/adjust-time", adminHandler.AdjustTime)
	admin.Post("/teams/:id/adjust-score", adminHandler.AdjustScore)
	admin.Get("/teams/:id/progress", adminHandler.GetTeamProgress)
	
	// Bulk actions
	admin.Post("/bulk-action", adminHandler.BulkAction)
	
	// Stats and logs
	admin.Get("/stats", adminHandler.GetStats)
	admin.Get("/logs", adminHandler.GetAdminLogs)
	admin.Get("/leaderboard", adminHandler.GetAdvancedLeaderboard)
}
