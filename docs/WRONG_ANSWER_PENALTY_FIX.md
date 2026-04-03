# Wrong Answer Penalty Fix

## Problem
Wrong answer penalties were only being applied to the ranking score calculation in the admin leaderboard, not to the actual team score. This meant:
- Wrong answers were tracked in the database
- But they didn't affect the player's visible score
- The 20-point penalty was negligible in the ranking score (which includes level bonuses of 200-3200)
- Players could spam wrong answers without real consequences

## Solution
Changed the penalty system to deduct points from the actual team score when a wrong answer is submitted.

### Changes Made

#### 1. Backend - Puzzle Handler
**File**: `backend/handlers/puzzle_handler.go`

Added score deduction for wrong answers:

```go
if isCorrect {
    // Add score for correct answer
    puzzleScore := models.PuzzleScores[req.Level]
    newScore += puzzleScore
    // ... update level, etc.
} else {
    // Wrong answer - deduct points from score
    const wrongAnswerPenalty = 20
    newScore -= wrongAnswerPenalty
    if newScore < 0 {
        newScore = 0  // Don't go negative
    }
    
    // Update team score
    h.teamService.UpdateTeam(c.Context(), teamID, map[string]interface{}{
        "score": newScore,
    })
}
```

**Key Points**:
- Deducts 20 points per wrong answer
- Score cannot go below 0
- Applies immediately when wrong answer is submitted
- Visible to players in their HUD

#### 2. Backend - Admin Leaderboard
**File**: `backend/handlers/admin_handler.go`

Removed the wrong attempt penalty from ranking score calculation since it's now already in the team score:

```go
// Before
rankingScore -= float64(totalWrongAttempts * 10)

// After
// Removed - wrong attempt penalties are already deducted from team.Score
```

**Updated Comments**:
```go
// NOTE: Wrong attempt penalties are already deducted from team.Score
// NOTE: Removed wrong attempt penalty since team.Score already includes wrong answer deductions
```

## Impact

### Before
- Wrong answer: No immediate score impact
- Penalty only in ranking calculation (10-20 points out of 2000-5000+ ranking score)
- Players could spam answers without visible consequences
- Confusing for players (why track wrong attempts if no penalty?)

### After
- Wrong answer: Immediate -20 points from visible score
- Players see their score decrease in real-time
- Encourages careful thinking before submitting
- More meaningful penalty (20 points is significant compared to puzzle scores of 100-300)
- Ranking score now accurately reflects actual score

## Penalty Values

### Puzzle Scores (for reference)
- Level 1: 100 points
- Level 2 sub-puzzles: 50-100 points each
- Level 3 sub-puzzles: 50-100 points each
- Level 4: 300 points

### Wrong Answer Penalty
- **20 points per wrong answer**
- This is 20% of a level 1 completion
- Significant enough to discourage guessing
- Not so harsh that one mistake ruins the game

### Comparison
- 5 wrong answers = -100 points (equivalent to losing Level 1)
- 10 wrong answers = -200 points (equivalent to losing 2 levels)
- Makes players think carefully before submitting

## Testing

### Test Case 1: Wrong Answer Deduction
1. Login and note current score (e.g., 0 points)
2. Submit a wrong answer on any level
3. **Expected**: Score decreases by 20 points (shows 0 if was at 0)
4. Check HUD - score should update immediately

### Test Case 2: Multiple Wrong Answers
1. Start with 100 points (complete Level 1)
2. Submit 3 wrong answers
3. **Expected**: Score = 100 - 60 = 40 points

### Test Case 3: Score Cannot Go Negative
1. Start with 10 points
2. Submit a wrong answer
3. **Expected**: Score = 0 (not -10)

### Test Case 4: Correct Answer After Wrong
1. Start with 100 points
2. Submit wrong answer → 80 points
3. Submit correct answer → 80 + puzzle_score points
4. **Expected**: Score increases from 80, not from 100

### Test Case 5: Leaderboard Ranking
1. Team A: 500 points, 2 wrong attempts (already deducted)
2. Team B: 480 points, 0 wrong attempts
3. **Expected**: Team A ranks higher (500 > 480)
4. No double penalty in ranking calculation

## Database

### team_progress Table
Still tracks wrong_attempts for analytics:
```sql
wrong_attempts INT DEFAULT 0
```

This is useful for:
- Admin dashboard statistics
- Understanding player behavior
- Identifying puzzle difficulty

### teams Table
The score field now reflects all penalties:
```sql
score INT DEFAULT 0
```

Score includes:
- ✅ Puzzle completion bonuses
- ✅ Hint point deductions
- ✅ Wrong answer deductions (NEW)

## User Experience

### Visible Feedback
Players now see:
1. Score decreases immediately on wrong answer
2. Clear consequence for guessing
3. Encourages reading hints instead of spamming

### Fair Gameplay
- Rewards careful thinking
- Penalizes careless guessing
- Balanced penalty (not too harsh, not too lenient)

### Leaderboard Accuracy
- Rankings now based on actual performance
- No hidden penalties in ranking calculation
- What you see is what you get

## Files Modified

1. `backend/handlers/puzzle_handler.go` - Added wrong answer score deduction
2. `backend/handlers/admin_handler.go` - Removed duplicate penalty from ranking calculation

## Configuration

The penalty value is currently hardcoded:
```go
const wrongAnswerPenalty = 20
```

Can be adjusted based on:
- Puzzle difficulty
- Average scores
- Player feedback
- Game balance testing

Recommended range: 10-50 points per wrong answer
