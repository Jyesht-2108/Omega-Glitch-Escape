package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/omega-glitch-escape/backend/models"
	"github.com/omega-glitch-escape/backend/services"
)

type PuzzleHandler struct {
	teamService *services.TeamService
}

func NewPuzzleHandler(teamService *services.TeamService) *PuzzleHandler {
	return &PuzzleHandler{
		teamService: teamService,
	}
}

func (h *PuzzleHandler) SubmitAnswer(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)
	
	var req models.SubmitAnswerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get team
	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	// Check if team is disqualified
	if team.IsDisqualified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Team is disqualified",
		})
	}

	// Check if game is completed
	if team.CompletedAt != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Game already completed",
		})
	}

	// Normalize answer
	submittedAnswer := strings.ToUpper(strings.TrimSpace(req.Answer))
	correctAnswer := strings.ToUpper(strings.TrimSpace(models.PuzzleAnswers[req.Level]))

	isCorrect := submittedAnswer == correctAnswer

	// Get or create progress record for this level
	levelNum := team.CurrentLevel
	stage := req.Level
	
	// Query existing progress
	progressData, _, _ := h.teamService.GetClient().From("team_progress").
		Select("*", "", false).
		Eq("team_id", teamID).
		Eq("level", fmt.Sprintf("%d", levelNum)).
		Eq("stage", stage).
		Execute()

	var existingProgress []models.TeamProgress
	json.Unmarshal(progressData, &existingProgress)

	var progressID string
	attemptsCount := 1
	wrongAttempts := 0
	hintsUsed := 0

	if len(existingProgress) > 0 {
		// Prevent points farming on already completed puzzles
		if existingProgress[0].CompletedAt != nil {
			// Synchronize level if backend is trailing due to a client-side state overwrite
			if isCorrect {
				expectedLevel := team.CurrentLevel
				if req.Level == "1" && expectedLevel < 2 { expectedLevel = 2 }
				if req.Level == "2" && expectedLevel < 3 { expectedLevel = 3 }
				if req.Level == "3" && expectedLevel < 4 { expectedLevel = 4 }
				if req.Level == "4" && expectedLevel < 5 { expectedLevel = 5 }
				if expectedLevel != team.CurrentLevel {
					h.teamService.UpdateTeam(c.Context(), teamID, map[string]interface{}{"current_level": expectedLevel})
					team.CurrentLevel = expectedLevel
				}
			}
			return c.JSON(models.SubmitAnswerResponse{
				Correct:       isCorrect,
				Message:       getResponseMessage(isCorrect, req.Level),
				Score:         team.Score,
				TimeRemaining: team.TimeRemaining,
				WrongAttempts: existingProgress[0].WrongAttempts,
				CurrentLevel:  team.CurrentLevel,
			})
		}

		// Update existing progress
		progressID = existingProgress[0].ID
		attemptsCount = existingProgress[0].AttemptsCount + 1
		wrongAttempts = existingProgress[0].WrongAttempts
		hintsUsed = existingProgress[0].HintsUsed
		
		if !isCorrect {
			wrongAttempts++
		}

		updates := map[string]interface{}{
			"attempts_count": attemptsCount,
			"wrong_attempts": wrongAttempts,
		}

		if isCorrect {
			updates["completed_at"] = time.Now()
		}

		h.teamService.GetClient().From("team_progress").
			Update(updates, "", "").
			Eq("id", progressID).
			Execute()
	} else {
		// Create new progress record
		if !isCorrect {
			wrongAttempts = 1
		}

		progress := map[string]interface{}{
			"team_id":        teamID,
			"level":          levelNum,
			"stage":          stage,
			"attempts_count": attemptsCount,
			"wrong_attempts": wrongAttempts,
			"hints_used":     hintsUsed,
		}

		if isCorrect {
			progress["completed_at"] = time.Now()
		}

		h.teamService.GetClient().From("team_progress").
			Insert(progress, false, "", "", "").
			Execute()
	}

	// Update team score and stats if correct
	newScore := team.Score
	newLevel := team.CurrentLevel
	
	if isCorrect {
		// Add score for this puzzle
		puzzleScore := models.PuzzleScores[req.Level]
		newScore += puzzleScore

		// Check if this is a level completion (main level answer, not sub-puzzle)
		if req.Level == "1" || req.Level == "2" || req.Level == "3" || req.Level == "4" {
			// Level completed, advance to next level
			if newLevel < 4 {
				newLevel++
			}
		}

		// Update team
		updates := map[string]interface{}{
			"score":         newScore,
			"current_level": newLevel,
		}

		// If level 4 completed, mark game as complete
		if req.Level == "4" {
			updates["completed_at"] = time.Now()
		}

		h.teamService.UpdateTeam(c.Context(), teamID, updates)
	}

	// Get updated team data
	updatedTeam, _ := h.teamService.GetTeam(c.Context(), teamID)

	response := models.SubmitAnswerResponse{
		Correct:       isCorrect,
		Message:       getResponseMessage(isCorrect, req.Level),
		Score:         updatedTeam.Score,
		TimeRemaining: updatedTeam.TimeRemaining,
		WrongAttempts: wrongAttempts,
		CurrentLevel:  updatedTeam.CurrentLevel,
	}

	return c.JSON(response)
}

func (h *PuzzleHandler) RequestHint(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)
	
	var req models.RequestHintRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get team
	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	// Calculate and find the hint based on existing progress
	levelNum := team.CurrentLevel
	stage := req.Level

	progressData, _, _ := h.teamService.GetClient().From("team_progress").
		Select("*", "", false).
		Eq("team_id", teamID).
		Eq("level", fmt.Sprintf("%d", levelNum)).
		Eq("stage", stage).
		Execute()

	var existingProgress []models.TeamProgress
	json.Unmarshal(progressData, &existingProgress)

	hintsUsed := 0
	var progressID string
	if len(existingProgress) > 0 {
		hintsUsed = existingProgress[0].HintsUsed
		progressID = existingProgress[0].ID
	}

	puzzleHints, exists := models.PuzzleHints[req.Level]
	if !exists || len(puzzleHints) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No hints available for this level",
		})
	}

	if hintsUsed >= len(puzzleHints) {
		// Just return the last hint if they already used max without costing more
		lastHint := puzzleHints[len(puzzleHints)-1]
		return c.JSON(models.RequestHintResponse{
			Hint:             lastHint.Text,
			TimeRemaining:    team.TimeRemaining,
			Score:            team.Score,
			HintsUsed:        hintsUsed,
			MaxHintsReached:  true,
		})
	}

	// Get the current hint cost
	hintLevel := puzzleHints[hintsUsed]
	
	newTimeRemaining := team.TimeRemaining - hintLevel.TimeCost
	if newTimeRemaining < 0 {
		newTimeRemaining = 0
	}
	
	newScore := team.Score - hintLevel.PointCost
	// Capping at 0 just like time
	if newScore < 0 {
		newScore = 0
	}

	// Update team
	h.teamService.UpdateTeam(c.Context(), teamID, map[string]interface{}{
		"time_remaining": newTimeRemaining,
		"score":          newScore,
	})

	hintsUsed++

	// Update or create progress
	if progressID != "" {
		h.teamService.GetClient().From("team_progress").
			Update(map[string]interface{}{
				"hints_used": hintsUsed,
			}, "", "").
			Eq("id", progressID).
			Execute()
	} else {
		progress := map[string]interface{}{
			"team_id":    teamID,
			"level":      levelNum,
			"stage":      stage,
			"hints_used": hintsUsed,
		}
		h.teamService.GetClient().From("team_progress").
			Insert(progress, false, "", "", "").
			Execute()
	}

	nextTimeCost := 0
	nextPtsCost := 0
	maxReached := true
	if hintsUsed < len(puzzleHints) {
		nextTimeCost = puzzleHints[hintsUsed].TimeCost
		nextPtsCost = puzzleHints[hintsUsed].PointCost
		maxReached = false
	}

	response := models.RequestHintResponse{
		Hint:             hintLevel.Text,
		TimeRemaining:    newTimeRemaining,
		Score:            newScore,
		HintsUsed:        hintsUsed,
		NextHintTimeCost: nextTimeCost,
		NextHintPtsCost:  nextPtsCost,
		MaxHintsReached:  maxReached,
	}

	return c.JSON(response)
}

func (h *PuzzleHandler) GetHintInfo(c *fiber.Ctx) error {
	teamID := c.Locals("teamID").(string)
	level := c.Params("level")

	if level == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing level parameter",
		})
	}

	team, err := h.teamService.GetTeam(c.Context(), teamID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Team not found",
		})
	}

	stage := level
	levelNum := team.CurrentLevel

	progressData, _, _ := h.teamService.GetClient().From("team_progress").
		Select("*", "", false).
		Eq("team_id", teamID).
		Eq("level", fmt.Sprintf("%d", levelNum)).
		Eq("stage", stage).
		Execute()

	var existingProgress []models.TeamProgress
	json.Unmarshal(progressData, &existingProgress)

	hintsUsed := 0
	if len(existingProgress) > 0 {
		hintsUsed = existingProgress[0].HintsUsed
	}

	puzzleHints, exists := models.PuzzleHints[level]
	if !exists || len(puzzleHints) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No hints available for this level",
		})
	}

	maxReached := true
	nextTimeCost := 0
	nextPtsCost := 0

	if hintsUsed < len(puzzleHints) {
		maxReached = false
		nextTimeCost = puzzleHints[hintsUsed].TimeCost
		nextPtsCost = puzzleHints[hintsUsed].PointCost
	}

	purchased := []string{}
	for i := 0; i < hintsUsed && i < len(puzzleHints); i++ {
		purchased = append(purchased, puzzleHints[i].Text)
	}

	return c.JSON(models.HintInfoResponse{
		Level:            level,
		HintsUsed:        hintsUsed,
		MaxHintsReached:  maxReached,
		NextHintTimeCost: nextTimeCost,
		NextHintPtsCost:  nextPtsCost,
		PurchasedHints:   purchased,
	})
}

func getResponseMessage(correct bool, level string) string {
	if correct {
		messages := map[string]string{
			"1":          ">> ACCESS GRANTED: Override Fragment Alpha acquired: SYS",
			"2-python":   ">> SCRIPT EXECUTED: Bypass token generated successfully",
			"2-base64":   ">> NODE LOCATED: Hidden admin panel discovered",
			"2":          ">> ACCESS GRANTED: Override Fragment Beta acquired: TEM",
			"3-pointers": ">> MEMORY ACCESS: PIN code extracted successfully",
			"3-stack":    ">> STACK TRACE: Passcode recovered from memory",
			"3-dataset":  ">> ANOMALY DETECTED: Poisoned data identified",
			"3":          ">> ACCESS GRANTED: Override Fragment Gamma acquired: HALT",
			"4-glitch":   ">> IMAGE ANALYZED: Keyword extracted from corruption",
			"4":          ">> SYSTEM TERMINATED: OMEGA has been shut down. Victory achieved!",
		}
		return messages[level]
	}
	return ">> ACCESS DENIED: Incorrect answer. Try again."
}
