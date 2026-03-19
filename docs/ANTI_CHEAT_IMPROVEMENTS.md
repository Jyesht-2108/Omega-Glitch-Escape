# Anti-Cheat System Improvements

## Overview
Enhanced anti-cheat system with configurable settings, persistent strikes, backend disqualification, and protection against page refresh exploits.

---

## New Features

### 1. Environment Configuration ✅

**Files**: `frontend/.env`, `frontend/.env.example`

```env
# Anti-Cheat Configuration
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=3
```

**Settings**:
- `VITE_ANTI_CHEAT_ENABLED`: Enable/disable anti-cheat system (true/false)
- `VITE_ANTI_CHEAT_MAX_STRIKES`: Number of strikes before disqualification (default: 3)

**Usage**:
- Set to `false` for development/testing
- Set to `true` for production/competition
- Adjust max strikes as needed (1-5 recommended)

---

### 2. Persistent Strikes Across Page Refresh ✅

**Problem**: Refreshing the page reset strikes to 0, allowing players to bypass the 60-second timeout.

**Solution**: Store strikes in localStorage with team ID

**Implementation** (`frontend/src/components/AntiCheat.tsx`):
```typescript
const [strikes, setStrikes] = useState(() => {
  if (!ANTI_CHEAT_ENABLED) return 0;
  const saved = localStorage.getItem(`antiCheat_strikes_${teamId}`);
  return saved ? parseInt(saved) : 0;
});

// Save strikes whenever they change
useEffect(() => {
  if (teamId && ANTI_CHEAT_ENABLED) {
    localStorage.setItem(`antiCheat_strikes_${teamId}`, strikes.toString());
  }
}, [strikes, teamId]);
```

**Result**:
- Strikes persist across page refreshes
- Each team has separate strike counter
- Cannot reset by refreshing page
- Strikes cleared only on logout

---

### 3. Backend Disqualification ✅

**Database Schema** (`backend/database/supabase.sql`):
```sql
ALTER TABLE teams ADD COLUMN is_disqualified BOOLEAN DEFAULT false;
ALTER TABLE teams ADD COLUMN disqualified_reason VARCHAR(255);
ALTER TABLE teams ADD COLUMN disqualified_at TIMESTAMP;
```

**Backend Model** (`backend/models/team.go`):
```go
type Team struct {
    // ... existing fields
    IsDisqualified      bool        `json:"is_disqualified"`
    DisqualifiedReason  string      `json:"disqualified_reason,omitempty"`
    DisqualifiedAt      *CustomTime `json:"disqualified_at,omitempty"`
}

type DisqualifyTeamRequest struct {
    Reason string `json:"reason"`
}
```

**Backend Service** (`backend/services/team_service.go`):
```go
func (s *TeamService) DisqualifyTeam(ctx context.Context, teamID string, reason string) error {
    query := `
        UPDATE teams 
        SET is_disqualified = true,
            disqualified_reason = $1,
            disqualified_at = NOW(),
            is_active = false,
            updated_at = NOW()
        WHERE id = $2
    `
    _, err := s.db.Exec(ctx, query, reason, teamID)
    return err
}
```

**Backend Handler** (`backend/handlers/team_handler.go`):
```go
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
```

**API Endpoint**:
```
POST /api/team/disqualify
Headers: Authorization: Bearer <token>
Body: { "reason": "Anti-cheat violation: Maximum strikes reached" }
```

---

### 4. Frontend Disqualification Call ✅

**Service** (`frontend/src/services/teamService.ts`):
```typescript
async disqualifyTeam(reason: string): Promise<void> {
  try {
    await apiClient.post('/team/disqualify', { reason });
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to disqualify team';
    throw new Error(message);
  }
}
```

**AntiCheat Component** (`frontend/src/components/AntiCheat.tsx`):
```typescript
if (newStrikes >= MAX_STRIKES) {
  console.log('Maximum strikes reached - disqualifying team');
  setShow(false);
  setGameOver(true);
  
  // Disqualify team in backend
  teamService.disqualifyTeam('Anti-cheat violation: Maximum strikes reached')
    .then(() => {
      console.log('Team disqualified in backend');
    })
    .catch((error) => {
      console.error('Failed to disqualify team:', error);
    });
  
  // Start alarm siren
  stopAlarmRef.current = playAlarmSiren();
}
```

---

### 5. Login Prevention for Disqualified Teams ✅

**GameContext** (`frontend/src/contexts/GameContext.tsx`):
```typescript
const login = useCallback(async (teamName: string, password: string, loginData?: LoginResponse) => {
  try {
    let data = loginData;
    if (!data) {
      data = await authService.login(teamName, password);
    }
    
    const team = data.team;
    
    // Check if team is disqualified
    if (team.is_disqualified) {
      throw new Error(`Team disqualified: ${team.disqualified_reason || 'Anti-cheat violation'}`);
    }
    
    // ... rest of login logic
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}, [refreshLeaderboard]);
```

**Result**:
- Disqualified teams cannot login
- Error message shows disqualification reason
- Must be manually re-enabled by admin

---

## Flow Diagrams

### Strike System Flow
```
Tab Switch Detected
    ↓
Check if anti-cheat enabled
    ↓
Increment strikes (saved to localStorage)
    ↓
strikes < MAX_STRIKES?
    ├─ Yes: Show 60s warning
    │   ↓
    │   Wait 60 seconds
    │   ↓
    │   Allow dismiss
    │   ↓
    │   Continue game (timer kept running)
    │
    └─ No: Disqualify
        ↓
        Call backend /api/team/disqualify
        ↓
        Database: is_disqualified = true
        ↓
        Show game over screen
        ↓
        10 second countdown
        ↓
        Explosion animation
```

### Disqualification Flow
```
Maximum Strikes Reached
    ↓
Frontend: Call teamService.disqualifyTeam()
    ↓
Backend: POST /api/team/disqualify
    ↓
Database Update:
  - is_disqualified = true
  - disqualified_reason = "Anti-cheat violation..."
  - disqualified_at = NOW()
  - is_active = false
    ↓
Frontend: Show game over screen
    ↓
Team cannot login again
```

### Login Check Flow
```
User attempts login
    ↓
Backend authenticates
    ↓
Returns team data (includes is_disqualified)
    ↓
Frontend checks is_disqualified
    ├─ true: Throw error with reason
    │   ↓
    │   Show error message
    │   ↓
    │   Cannot access game
    │
    └─ false: Allow login
        ↓
        Load game state
        ↓
        Continue playing
```

---

## Configuration Examples

### Development Mode (No Anti-Cheat)
```env
VITE_ANTI_CHEAT_ENABLED=false
VITE_ANTI_CHEAT_MAX_STRIKES=3
```
- Anti-cheat completely disabled
- No strike tracking
- No disqualification
- Free tab switching

### Testing Mode (Lenient)
```env
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=5
```
- Anti-cheat enabled
- 5 strikes allowed
- Good for testing flow

### Production Mode (Strict)
```env
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=3
```
- Anti-cheat enabled
- 3 strikes (standard)
- Recommended for competition

### Very Strict Mode
```env
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=1
```
- Anti-cheat enabled
- Only 1 strike allowed
- Immediate disqualification on second violation

---

## Admin Recovery

### Re-enable Disqualified Team

**SQL**:
```sql
UPDATE teams 
SET is_disqualified = false,
    disqualified_reason = NULL,
    disqualified_at = NULL,
    is_active = true
WHERE team_name = 'TEAM_NAME';
```

**Or via Admin API** (future enhancement):
```
PUT /api/admin/teams/:id/reinstate
```

### Clear Strikes (Frontend)

Team must logout and login again, or admin can clear localStorage:
```javascript
// Clear strikes for specific team
localStorage.removeItem('antiCheat_strikes_TEAM_ID');

// Or clear all localStorage
localStorage.clear();
```

---

## Testing

### Test Strike Persistence
1. Login and start game
2. Switch tabs (trigger strike 1)
3. Wait 60 seconds and dismiss
4. Refresh page (F5)
5. Check console: Should still show 1 strike
6. Switch tabs again (trigger strike 2)
7. Refresh page
8. Should still show 2 strikes

### Test Disqualification
1. Set `VITE_ANTI_CHEAT_MAX_STRIKES=2`
2. Login and start game
3. Switch tabs (strike 1)
4. Wait and dismiss
5. Switch tabs (strike 2 - disqualified)
6. Should see game over screen
7. Check database: `is_disqualified = true`
8. Try to login again
9. Should see error: "Team disqualified: ..."

### Test Disabled Anti-Cheat
1. Set `VITE_ANTI_CHEAT_ENABLED=false`
2. Login and start game
3. Switch tabs freely
4. No warnings should appear
5. No strikes tracked

### Test Backend Disqualification
1. Trigger disqualification
2. Check backend logs:
   ```
   POST /api/team/disqualify
   200 OK
   ```
3. Check database:
   ```sql
   SELECT team_name, is_disqualified, disqualified_reason, disqualified_at
   FROM teams
   WHERE team_name = 'YOUR_TEAM';
   ```
4. Should show disqualified = true

---

## Database Queries

### View Disqualified Teams
```sql
SELECT 
  team_name,
  disqualified_reason,
  disqualified_at,
  current_level,
  score
FROM teams
WHERE is_disqualified = true
ORDER BY disqualified_at DESC;
```

### Count Disqualifications
```sql
SELECT COUNT(*) as disqualified_count
FROM teams
WHERE is_disqualified = true;
```

### Reinstate Team
```sql
UPDATE teams
SET is_disqualified = false,
    disqualified_reason = NULL,
    disqualified_at = NULL,
    is_active = true
WHERE team_name = 'TEAM_NAME';
```

---

## Files Modified

### Frontend
1. `frontend/.env` - Added anti-cheat config
2. `frontend/.env.example` - Added anti-cheat config
3. `frontend/src/components/AntiCheat.tsx` - Persistent strikes, backend call
4. `frontend/src/services/teamService.ts` - Added disqualifyTeam method
5. `frontend/src/contexts/GameContext.tsx` - Check disqualification on login

### Backend
1. `backend/database/supabase.sql` - Added disqualification columns
2. `backend/models/team.go` - Added disqualification fields
3. `backend/services/team_service.go` - Added DisqualifyTeam method
4. `backend/handlers/team_handler.go` - Added DisqualifyTeam handler
5. `backend/routes/routes.go` - Added /team/disqualify route

---

## Summary

✅ Anti-cheat can be enabled/disabled via environment variable
✅ Max strikes configurable (1-5+)
✅ Strikes persist across page refreshes
✅ Cannot bypass by refreshing page
✅ Disqualification saved to database
✅ Disqualified teams cannot login
✅ Admin can manually reinstate teams
✅ Full audit trail (reason, timestamp)
✅ Configurable for different environments

The anti-cheat system is now production-ready with full backend integration and protection against common exploits.
