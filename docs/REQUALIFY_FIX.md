# Requalify Fix

## Problem
When a team was disqualified and then requalified by an admin, they would immediately get disqualified again upon login because:
1. The `RequalifyTeam` backend function was missing (route existed but no handler)
2. AntiCheat strikes persisted in localStorage after requalification
3. No UI for admins to change team levels

## Solution

### 1. Added Missing RequalifyTeam Handler
**File**: `backend/handlers/admin_handler.go`

Added the `RequalifyTeam` function that was referenced in routes but didn't exist:
- Clears `is_disqualified` flag
- Removes `disqualified_reason` and `disqualified_at`
- Sets `is_active` to true
- Logs the admin action

### 2. Clear AntiCheat LocalStorage on Login
**File**: `frontend/src/contexts/GameContext.tsx`

When a team logs in, all AntiCheat-related localStorage is cleared:
```typescript
localStorage.removeItem(`antiCheatStrikes_${team.id}`);
localStorage.removeItem(`antiCheat_strikes_${team.id}`);
localStorage.removeItem(`antiCheat_warning_${team.id}`);
localStorage.removeItem(`antiCheat_countdown_${team.id}`);
localStorage.removeItem(`antiCheat_canDismiss_${team.id}`);
localStorage.removeItem(`antiCheat_gameOver_${team.id}`);
```

This ensures requalified teams start with 0 strikes.

### 3. Added Level Change UI for Admins
**File**: `frontend/src/components/admin/AdminComponents.tsx`

Added a "Change Level" section in the Edit Team modal:
- Dropdown to select level 1-4
- Button to apply the level change
- Uses the existing `PUT /api/admin/teams/:id` endpoint

### 4. Better Error Handling
**File**: `frontend/src/components/admin/AdminComponents.tsx`

Added console logging and alerts to the requalify function:
- Logs the requalify attempt
- Shows success/error alerts
- Reminds admin that team needs to logout/login

## How to Use

### To Requalify a Disqualified Team:
1. Go to Admin Dashboard
2. Find the disqualified team (red "DISQUALIFIED" badge)
3. Click the CheckCircle icon (✓) to requalify
4. Alert will confirm success
5. **Team must logout and login again** for changes to take effect

### To Change a Team's Level:
1. Go to Admin Dashboard
2. Click the Edit icon (pencil) on any team
3. In the "CHANGE LEVEL" section, select the desired level
4. Click "SET LEVEL X"
5. Team will be on that level next time they refresh

## Testing Steps

1. **Restart the backend** to load any changes:
   ```bash
   cd backend
   make run
   ```

2. As admin, disqualify a team (or wait for AntiCheat to disqualify them)
3. Click the requalify button (CheckCircle icon ✓)
4. Verify the alert says "Team has been requalified"
5. As the team, logout and login again
6. Verify no strikes in localStorage (check DevTools > Application > Local Storage)
7. **IMPORTANT**: Don't switch tabs or right-click during testing, or you'll get new strikes
8. Navigate to your current level and submit answers - should work normally

## Common Issues

### "Team is disqualified" after requalification
**Cause**: You triggered AntiCheat again after requalification by:
- Switching tabs (visibilitychange event)
- Right-clicking (contextmenu event)
- Getting 3 strikes total

**Solution**: 
- Don't switch tabs or right-click while playing
- Or temporarily disable AntiCheat for testing: Set `VITE_ANTI_CHEAT_ENABLED=false` in `frontend/.env`

### Can't access Level 3 after requalification
**Cause**: Requalification doesn't change your level. If you were on Level 2 when disqualified, you're still on Level 2 after requalification.

**Solution**: 
- Complete Level 2 to advance to Level 3
- Or have admin use the Edit modal to manually set your level to 3

## Important Notes

- **Backend restart required** for the RequalifyTeam function to be available
- **Team must logout/login** after requalification for localStorage to be cleared
- Requalification does NOT change the team's current level - use the Edit modal to change levels
- All admin actions are logged in the admin_actions table
