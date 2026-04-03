# Live Leaderboard Implementation

## Overview
Changed the HUD leaderboard from showing only completed teams to showing a live leaderboard of all active teams ranked by their current score and progress.

## Changes Made

### 1. Backend - New Live Leaderboard Endpoint

**File**: `backend/handlers/team_handler.go`

Added `GetLiveLeaderboard` method that:
- Fetches all active teams (excludes disqualified teams)
- Calculates ranking score using: `score + (level² × 200) + time bonus`
- Returns top 20 teams with: rank, team_name, score, level, is_active
- Updates in real-time as teams progress

```go
type LiveLeaderboardEntry struct {
    Rank      int    `json:"rank"`
    TeamName  string `json:"team_name"`
    Score     int    `json:"score"`
    Level     int    `json:"level"`
    IsActive  bool   `json:"is_active"`
}
```

**Ranking Logic**:
- Base score from puzzles solved
- Level bonus: `level² × 200` (exponential - rewards progression)
- Time bonus for teams with remaining time
- Excludes disqualified teams
- Sorted by total ranking score (descending)

### 2. Backend - Route Configuration

**File**: `backend/routes/routes.go`

Added public endpoint:
```go
api.Get("/leaderboard/live", teamHandler.GetLiveLeaderboard)
```

This is a public endpoint (no authentication required) so all players can see live rankings.

### 3. Frontend - Leaderboard Service

**File**: `frontend/src/services/leaderboardService.ts`

Added new interface and method:
```typescript
export interface LiveLeaderboardEntry {
  rank: number;
  team_name: string;
  score: number;
  level: number;
  is_active: boolean;
}

async getLiveLeaderboard(): Promise<LiveLeaderboardEntry[]>
```

### 4. Frontend - Game Context

**File**: `frontend/src/contexts/GameContext.tsx`

Updated leaderboard interface and refresh logic:
```typescript
interface LeaderboardEntry {
  rank: number;
  team: string;
  score: number;  // Changed from time
  level: number;  // Added level
}
```

Changed `refreshLeaderboard()` to call `getLiveLeaderboard()` instead of `getLeaderboard()`.

### 5. Frontend - HUD Display

**File**: `frontend/src/components/HUD.tsx`

Updated leaderboard ticker to show:
- **Rank**: `#1`, `#2`, `#3`, etc. (in accent color)
- **Team Name**: Team name (in foreground color)
- **Score**: `500 pts` (in primary color)
- **Level**: `L3` (in secondary color)

```tsx
<span className="flex items-center gap-2">
  <span className="text-accent font-bold">#{entry.rank}</span>
  <span className="text-foreground">{entry.team}</span>
  <span className="text-primary">{entry.score} pts</span>
  <span className="text-secondary">L{entry.level}</span>
</span>
```

## Benefits

### Real-Time Competition
- Players can see their rank change as they progress
- Creates competitive atmosphere
- Shows who's leading at any moment
- Updates every 30 seconds automatically

### Better Information
- **Before**: Only showed completed teams (often empty early in game)
- **After**: Shows all active teams with current progress
- Players can see: rank, score, and level of all competitors
- More engaging than just showing completion times

### Performance
- Limited to top 20 teams for efficiency
- Lightweight endpoint (no complex progress calculations)
- Public endpoint (no auth overhead)
- 30-second refresh interval (not too frequent)

## Display Format

### Scrolling Ticker Example:
```
#1 TeamAlpha 1200 pts L4  |  #2 TeamBeta 950 pts L3  |  #3 TeamGamma 800 pts L3  |  #4 TeamDelta 600 pts L2
```

### Color Coding:
- **Rank** (#1, #2, etc.): Accent color (amber/yellow)
- **Team Name**: Foreground color (white)
- **Score**: Primary color (cyan)
- **Level**: Secondary color (green)

## Ranking Algorithm

The ranking score is calculated as:
```
ranking_score = score + (level² × 200) + time_bonus
```

### Why This Works:
1. **Score**: Rewards puzzle completion and correct answers
2. **Level Bonus**: Exponential growth rewards progression
   - Level 1: +200 points
   - Level 2: +800 points
   - Level 3: +1800 points
   - Level 4: +3200 points
3. **Time Bonus**: Small bonus for having time remaining
4. **Disqualified**: Automatically ranked last

### Example Rankings:
- Team A: Level 4, 1000 pts → 1000 + 3200 = 4200 (Rank #1)
- Team B: Level 3, 1200 pts → 1200 + 1800 = 3000 (Rank #2)
- Team C: Level 3, 800 pts → 800 + 1800 = 2600 (Rank #3)
- Team D: Level 2, 900 pts → 900 + 800 = 1700 (Rank #4)

This ensures that level progression is heavily weighted, but score still matters within the same level.

## Testing

### Test Case 1: Empty Leaderboard
1. Start fresh with no teams
2. Check HUD header
3. **Expected**: "No teams yet - Be the first to start!"

### Test Case 2: Single Team
1. Login as one team
2. Check HUD header
3. **Expected**: Shows "#1 YourTeam 0 pts L1"

### Test Case 3: Multiple Teams
1. Have 3+ teams at different levels
2. Check HUD header
3. **Expected**: Shows all teams ranked by score + level
4. Team at higher level should rank higher even with lower score

### Test Case 4: Live Updates
1. Login and check your rank
2. Complete a puzzle to increase score
3. Wait 30 seconds for refresh
4. **Expected**: Rank updates if position changed

### Test Case 5: Level Progression
1. Team A at Level 2 with 1000 pts
2. Team B at Level 3 with 500 pts
3. **Expected**: Team B ranks higher (level bonus > score difference)

## Configuration

### Refresh Interval
Currently set to 30 seconds in `GameContext.tsx`:
```typescript
const interval = setInterval(() => {
  refreshLeaderboard();
}, 30000); // 30 seconds
```

Can be adjusted based on:
- Server load
- Number of teams
- Desired real-time feel

### Top N Limit
Currently limited to top 20 teams in backend:
```go
if len(leaderboard) > 20 {
    leaderboard = leaderboard[:20]
}
```

Can be increased if needed, but keep performance in mind.

## Files Modified

1. `backend/handlers/team_handler.go` - Added GetLiveLeaderboard method
2. `backend/routes/routes.go` - Added /leaderboard/live route
3. `frontend/src/services/leaderboardService.ts` - Added getLiveLeaderboard method
4. `frontend/src/contexts/GameContext.tsx` - Updated to use live leaderboard
5. `frontend/src/components/HUD.tsx` - Updated display format

## Security Considerations

- ✅ Public endpoint (no sensitive data exposed)
- ✅ Only shows: rank, team name, score, level
- ✅ Excludes disqualified teams
- ✅ No personal information or detailed progress
- ✅ Limited to top 20 for performance
- ✅ Rate-limited by 30-second client-side refresh
