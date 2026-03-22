# Tracking & Leaderboard Verification

## What's Being Tracked

### 1. Hints Used ✅
**Backend**: `backend/handlers/puzzle_handler.go` - `RequestHint` function
- Tracks hints per level/stage in `team_progress` table
- Increments `hints_used` counter
- Deducts 5 minutes (300 seconds) from timer

**Leaderboard**: 
- Aggregates all hints from `team_progress` table
- Shows in `total_hints_used` column
- Penalty: -50 points per hint in ranking score

### 2. Wrong Attempts ✅
**Backend**: `backend/handlers/puzzle_handler.go` - `SubmitAnswer` function
- Tracks wrong attempts per level/stage in `team_progress` table
- Increments `wrong_attempts` counter on incorrect answers
- Increments `attempts_count` on all attempts

**Leaderboard**:
- Aggregates all wrong attempts from `team_progress` table
- Shows in `total_wrong_attempts` column
- Penalty: -20 points per wrong attempt in ranking score

### 3. Tab Switches ✅
**Frontend**: `frontend/src/components/AntiCheat.tsx`
- Detects tab switching via `visibilitychange` event
- Adds strikes (max 3 before disqualification)
- Stored in `teams` table as `tab_switches`

**Backend**: `backend/handlers/team_handler.go`
- `DisqualifyTeam` increments `tab_switches` counter

**Leaderboard**:
- Shows in FLAGS column if > 5
- Penalty: -30 points per tab switch in ranking score

### 4. Suspicious Activity ✅
**Backend**: `backend/models/team.go`
- Field exists: `suspicious_activity_count`
- Currently not actively incremented (placeholder for future anti-cheat)

**Leaderboard**:
- Shows in FLAGS column if > 0
- Penalty: -100 points per suspicious activity in ranking score

## Ranking Formula

```
Ranking Score = Base Score + Bonuses - Penalties

Bonuses:
- Base Score: Points earned from puzzles
- Level Bonus: (Current Level)² × 100
- Time Bonus: (Time Remaining / 10800) × 500 (only if completed)

Penalties:
- Hints: -50 per hint
- Wrong Attempts: -20 per wrong attempt
- Tab Switches: -30 per tab switch
- Suspicious Activity: -100 per incident
- Disqualified: -999999 (always last)
```

## Rank Display Issue: 3048

### Possible Causes:
1. **Database has old/corrupted data** - Check if there are old teams with weird rank values
2. **Frontend caching** - Clear browser cache and reload
3. **Backend not returning data** - Check if API call is successful
4. **Struct default value** - Go structs initialize int fields to 0, not 3048

### How to Debug:
1. Open browser DevTools → Network tab
2. Find the `/api/admin/leaderboard` request
3. Check the response JSON
4. Look at the `rank` field value

### Expected Behavior:
- 1 team → Rank should be 1
- 2 teams → Ranks should be 1, 2
- 3 teams → Ranks should be 1, 2, 3

### Fix if Needed:
If the backend is returning correct ranks but frontend shows 3048:
- Check if there's a typo in the field name (e.g., `entry.rank` vs `entry.Rank`)
- Verify the TypeScript interface matches the backend struct

If the backend is returning 3048:
- Check database for corrupted data
- Restart backend to clear any cached values
- Verify the sorting and rank assignment logic

## Testing Checklist

### Hints Tracking:
- [ ] Click hint button on any level
- [ ] Check if time deducts by 5 minutes
- [ ] Check admin leaderboard - hints column should increment
- [ ] Complete game and verify hint penalty in ranking score

### Wrong Attempts Tracking:
- [ ] Submit wrong answer on any level
- [ ] Check admin leaderboard - wrong attempts column should increment
- [ ] Complete game and verify wrong attempt penalty in ranking score

### Tab Switches Tracking:
- [ ] Switch to another tab while playing
- [ ] Get 3 strikes and get disqualified
- [ ] Check admin leaderboard - tab switches should show in FLAGS
- [ ] Verify penalty in ranking score

### Ranking Calculation:
- [ ] Create multiple teams with different scores
- [ ] Verify ranks are 1, 2, 3, etc. (not 3048)
- [ ] Verify ranking score formula is correct
- [ ] Check that completed teams rank higher than incomplete

## Database Schema

### teams table:
- `tab_switches` - INT - Number of tab switches detected
- `suspicious_activity_count` - INT - Number of suspicious activities

### team_progress table:
- `hints_used` - INT - Number of hints used for this level/stage
- `attempts_count` - INT - Total attempts for this level/stage
- `wrong_attempts` - INT - Number of wrong attempts for this level/stage

## API Endpoints

### Get Advanced Leaderboard:
```
GET /api/admin/leaderboard
Authorization: Bearer <admin_token>

Response:
[
  {
    "rank": 1,
    "team_name": "team1",
    "team_id": "...",
    "current_level": 3,
    "score": 300,
    "time_elapsed": 1200,
    "time_remaining": 9600,
    "total_hints_used": 2,
    "total_attempts": 15,
    "total_wrong_attempts": 5,
    "tab_switches": 0,
    "suspicious_activity_count": 0,
    "is_completed": false,
    "is_disqualified": false,
    "ranking_score": 450.5
  }
]
```

### Request Hint:
```
POST /api/puzzle/hint
Authorization: Bearer <team_token>
Content-Type: application/json

{
  "level": "3-pointers"
}

Response:
{
  "hint": ">> SYSTEM NOTE: Follow the pointer arithmetic...",
  "time_remaining": 9300,
  "hints_used": 1
}
```

### Submit Answer:
```
POST /api/puzzle/submit
Authorization: Bearer <team_token>
Content-Type: application/json

{
  "level": "3-pointers",
  "answer": "4242"
}

Response:
{
  "correct": true,
  "message": ">> MEMORY ACCESS: PIN code extracted successfully",
  "score": 350,
  "time_remaining": 9300,
  "wrong_attempts": 2,
  "current_level": 3
}
```
