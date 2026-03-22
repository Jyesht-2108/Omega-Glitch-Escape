# Admin Requalify & Team Management Guide

## Disqualification & Requalification Flow

### How Disqualification Works

1. **Admin Disqualifies Team**:
   - Admin clicks "Disqualify" button in dashboard
   - Enters reason (e.g., "Cheating detected")
   - Backend updates:
     ```
     is_disqualified = true
     disqualified_reason = "reason"
     disqualified_at = NOW()
     is_active = false
     ```

2. **Team Gets Blocked**:
   - If team is currently playing:
     - Status check (every 30 seconds) detects disqualification
     - Team is automatically logged out
     - Alert shown: "Your team has been disqualified: [reason]"
   - If team tries to login:
     - Login blocked with error message
     - Cannot access game

3. **Admin Requalifies Team**:
   - Admin clicks "Requalify" button (checkmark icon)
   - Backend updates:
     ```
     is_disqualified = false
     disqualified_reason = NULL
     disqualified_at = NULL
     is_active = true
     ```

4. **Team Can Resume**:
   - Team must **re-login** to resume
   - All progress is preserved:
     - Current level maintained
     - Score maintained
     - Time remaining maintained
   - Game continues from where they left off

### Important Notes

✅ **Progress is NOT lost** when disqualified
✅ **Time continues to run** (unless admin adjusts it)
✅ **Team must re-login** after requalification
✅ **All data is preserved** in database

## Admin Actions Reference

### 1. Disqualify Team
**Button**: Ban icon (🚫)
**Action**: Blocks team from playing
**Effect**: 
- Team logged out if playing
- Cannot login until requalified
- Progress preserved

**API**: `POST /api/admin/teams/:id/disqualify`
```json
{
  "reason": "Cheating detected"
}
```

### 2. Requalify Team
**Button**: CheckCircle icon (✅)
**Action**: Allows team to resume
**Effect**:
- Team can login again
- Progress restored
- Game continues

**API**: `POST /api/admin/teams/:id/requalify`

### 3. Reset Team
**Button**: RotateCcw icon (🔄)
**Action**: Clears all progress
**Effect**:
- Level reset to 1
- Score reset to 0
- Time reset to 3 hours
- All custom adjustments cleared
- Team can continue playing

**API**: `POST /api/admin/teams/:id/reset`

### 4. Delete Team
**Button**: Trash icon (🗑️)
**Action**: Permanently removes team
**Effect**:
- Team deleted from database
- All progress deleted
- Cannot be undone
- Team cannot login

**API**: `DELETE /api/admin/teams/:id`

### 5. Adjust Time
**Button**: Edit icon (✏️) → Time Adjustment
**Action**: Add or subtract time
**Effect**:
- Time immediately updated
- Team sees new time on next status check (30s)
- Tracked in custom_time_bonus

**API**: `POST /api/admin/teams/:id/adjust-time`
```json
{
  "time_adjustment": 600,  // +10 minutes (in seconds)
  "reason": "Technical issue"
}
```

### 6. Adjust Score
**Button**: Edit icon (✏️) → Score Adjustment
**Action**: Add or subtract points
**Effect**:
- Score immediately updated
- Team sees new score on next status check (30s)
- Tracked in custom_score_adjustment

**API**: `POST /api/admin/teams/:id/adjust-score`
```json
{
  "score_adjustment": -50,  // -50 points
  "reason": "Penalty for violation"
}
```

## Testing Scenarios

### Scenario 1: Disqualify & Requalify
```
1. Team is playing Level 2
2. Admin disqualifies team with reason "Testing"
3. Within 30 seconds, team is logged out
4. Team tries to login → Blocked
5. Admin requalifies team
6. Team logs in again
7. Team resumes at Level 2 with same score/time
✅ Expected: Team can continue playing
```

### Scenario 2: Time Adjustment While Playing
```
1. Team is playing with 1:30:00 remaining
2. Admin adds 10 minutes
3. Within 30 seconds, team sees 1:40:00
✅ Expected: Time updated without logout
```

### Scenario 3: Score Adjustment While Playing
```
1. Team has 500 points
2. Admin subtracts 50 points (penalty)
3. Within 30 seconds, team sees 450 points
✅ Expected: Score updated without logout
```

### Scenario 4: Reset Team
```
1. Team is at Level 3 with 600 points
2. Admin resets team
3. Team is logged out
4. Team logs in again
5. Team starts at Level 1 with 0 points
✅ Expected: Complete reset
```

## Status Check System

### How It Works

Every 30 seconds, the game checks:
```typescript
1. Is team disqualified? → Logout + Alert
2. Has time been adjusted? → Update display
3. Has score been adjusted? → Update display
4. Has level been changed? → Update display
```

### Why 30 Seconds?

- **Balance**: Not too frequent (server load), not too slow (user experience)
- **Battery Friendly**: Doesn't drain mobile devices
- **Network Efficient**: Minimal API calls
- **User Experience**: Changes appear quickly enough

### Can Be Changed

To make it faster/slower, edit `GameContext.tsx`:
```typescript
// Change 30000 to desired milliseconds
const interval = setInterval(checkStatus, 30000);
```

## Troubleshooting

### Team Can't Resume After Requalify

**Problem**: Team still blocked after requalification

**Solutions**:
1. Check database: `is_disqualified` should be `false`
2. Team must **re-login** (refresh page)
3. Clear browser cache/localStorage
4. Check backend logs for errors

**Verify**:
```sql
SELECT team_name, is_disqualified, is_active 
FROM teams 
WHERE team_name = 'TeamName';
```

### Time/Score Not Updating

**Problem**: Admin adjusts but team doesn't see change

**Solutions**:
1. Wait 30 seconds for status check
2. Team can refresh page
3. Check network tab for API calls
4. Verify backend updated database

**Verify**:
```sql
SELECT team_name, score, time_remaining, custom_time_bonus, custom_score_adjustment
FROM teams 
WHERE team_name = 'TeamName';
```

### Team Logged Out Unexpectedly

**Possible Causes**:
1. Admin disqualified team
2. Token expired (24 hours)
3. Network error
4. Backend restart

**Check**:
- Admin action logs
- Team's `is_disqualified` status
- Browser console errors

## Best Practices

### For Admins

1. **Always Provide Reasons**: Document why you're taking action
2. **Warn Before Disqualify**: Give teams a chance to explain
3. **Monitor Logs**: Check admin action logs regularly
4. **Test First**: Try actions on test team before live event
5. **Communicate**: Tell teams they need to re-login after requalify

### For Teams

1. **Re-login After Requalify**: Admin can't force you back in
2. **Check Status**: If something seems wrong, refresh page
3. **Save Progress**: Game auto-saves every 30 seconds
4. **Contact Admin**: If blocked unfairly, reach out immediately

## Admin Action Logs

All actions are logged in `admin_actions` table:

```sql
SELECT 
  admin_username,
  action_type,
  target_team_name,
  details,
  created_at
FROM admin_actions
ORDER BY created_at DESC
LIMIT 20;
```

**View in Dashboard**: Click "LOGS" button

## API Response Examples

### Successful Requalify
```json
{
  "message": "Team requalified successfully"
}
```

### Successful Time Adjustment
```json
{
  "message": "Time adjusted successfully",
  "time_remaining": 7200
}
```

### Error: Team Not Found
```json
{
  "error": "Team not found"
}
```

## Summary

✅ **Disqualification**: Blocks team, preserves progress
✅ **Requalification**: Allows resume, requires re-login
✅ **Time/Score Adjustments**: Update within 30 seconds
✅ **Reset**: Clears everything, team can continue
✅ **Delete**: Permanent removal
✅ **All Actions Logged**: Complete audit trail

**Key Point**: After requalification, teams MUST re-login to resume playing!

---

**Need Help?** Check admin action logs or database directly.
