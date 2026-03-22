package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/omega-glitch-escape/backend/config"
)

type SupabaseClaims struct {
	Sub   string `json:"sub"`   // User ID
	Email string `json:"email"` // Email (if available)
	Role  string `json:"role"`  // User role
	jwt.RegisteredClaims
}

type CustomClaims struct {
	TeamID   string `json:"team_id"`
	TeamName string `json:"team_name"`
	Username string `json:"username"` // For admin username
	IsAdmin  bool   `json:"is_admin"`
	jwt.RegisteredClaims
}

func AuthRequired(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization format",
			})
		}

		// Try to parse as custom token first (for admin and team login)
		token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.SupabaseJWTSecret), nil
		})

		if err == nil && token.Valid {
			claims, ok := token.Claims.(*CustomClaims)
			if ok {
				c.Locals("teamID", claims.TeamID)
				c.Locals("teamName", claims.TeamName)
				c.Locals("isAdmin", claims.IsAdmin)
				if claims.IsAdmin && claims.Username != "" {
					c.Locals("admin_username", claims.Username)
				}
				return c.Next()
			}
		}

		// If custom token fails, try Supabase token
		token, err = jwt.ParseWithClaims(tokenString, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.SupabaseJWTSecret), nil
		})

		if err == nil && token.Valid {
			claims, ok := token.Claims.(*SupabaseClaims)
			if ok {
				c.Locals("teamID", claims.Sub)
				c.Locals("email", claims.Email)
				c.Locals("isAdmin", claims.Role == "admin")
				return c.Next()
			}
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}
}

func AdminRequired(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		isAdmin, ok := c.Locals("isAdmin").(bool)
		if !ok || !isAdmin {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin access required",
			})
		}
		return c.Next()
	}
}
