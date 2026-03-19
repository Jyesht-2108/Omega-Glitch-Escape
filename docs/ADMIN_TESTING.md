# Admin System Testing Guide

## Pre-Testing Setup

### 1. Database Migration
```sql
-- Run in Supabase SQL Editor
-- Execute: backend/database/admin_migration.sql
```

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend
go run main.go

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Verify Services
```bash
# Backend health check
curl http://localhost:3000/api/health

# Frontend
# Open http://localhost:8080
```

## Test Cases

### TC-001: Admin Login
**Objective**: Verify admin authentication

**Steps**:
1. Navigate to `http://localhost:8080/admin`
2. Enter username: `admin`
3. Enter password: `Vivek@123`
4. Click "ADMIN ACCESS"

**Expected Result**:
- Redirected to `/admin/dashboard`
- Dashboard loads with statistics
- JWT token stored in localStorage

**Verification**:
```javascript
// Browser Console
localStorage.getItem('adminToken')
// Should return JWT token
```

---

### TC-002: Invalid Admin Login
**Objective**: Verify authentication security

**Steps**:
1. Navigate to `http://localhost:8080/admin`
2. Enter wrong credentials
3. Click "ADMIN ACCESS"

**Expected Result**:
- Error message displayed
- Not redirected
- No token stored

---

### TC-003: Create Team
**Objective**: Test team creation

**Steps**:
1. Login to admin dashboard
2. Click "CREATE NEW TEAM"
3. Enter team name: `TestTeam1`
4. Enter password: `test123`
5. Click "CREATE"

**Expected Result**:
- Modal closes
- Team appears in table
- Success notification
- Admin action logged

**API Verification**:
```bash
curl http://localhost:3000/api/admin/teams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### TC-004: Time Adjustment (Add)
**Objective**: Test adding time to team

**Steps**:
1. Select a team
2. Click Edit icon
3. Enter `10` in Time Adjustment
4. Enter reason: "Technical issue"
5. Click "APPLY TIME CHANGE"

**Expected Result**:
- Time increased by 10 minutes (600 seconds)
- Custom time bonus updated
- Action logged
- Dashboard refreshes

**Database Verification**:
```sql
SELECT team_name, time_remaining, custom_time_bonus 
FROM teams 
WHERE team_name = 'TestTeam1';
```

---

### TC-005: Time Adjustment (Subtract)
**Objective**: Test subtracting time from team

**Steps**:
1. Select a team
2. Click Edit icon
3. Enter `-5` in Time Adjustment
4. Enter reason: "Penalty"
5. Click "APPLY TIME CHANGE"

**Expected Result**:
- Time decreased by 5 minutes (300 seconds)
- Custom time bonus updated (negative)
- Action logged

---

### TC-006: Score Adjustment (Add)
**Objective**: Test adding points

**Steps**:
1. Select a team
2. Click Edit icon
3. Enter `100` in Score Adjustment
4. Enter reason: "Bonus points"
5. Click "APPLY SCORE CHANGE"

**Expected Result**:
- Score increased by 100
- Custom score adjustment tracked
- Action logged

---

### TC-007: Score Adjustment (Subtract)
**Objective**: Test subtracting points

**Steps**:
1. Select a team
2. Click Edit icon
3. Enter `-50` in Score Adjustment
4. Enter reason: "Penalty"
5. Click "APPLY SCORE CHANGE"

**Expected Result**:
- Score decreased by 50
- Custom score adjustment tracked
- Action logged

---

### TC-008: Disqualify Team
**Objective**: Test team disqualification

**Steps**:
1. Find active team
2. Click Ban icon
3. Enter reason: "Cheating detected"
4. Confirm

**Expected Result**:
- Team status changes to "DISQUALIFIED"
- is_active set to false
- is_disqualified set to true
- Disqualification reason stored
- Timestamp recorded
- Action logged

**Database Verification**:
```sql
SELECT team_name, is_disqualified, disqualified_reason, disqualified_at 
FROM teams 
WHERE team_name = 'TestTeam1';
```

---

### TC-009: Requalify Team
**Objective**: Test restoring disqualified team

**Steps**:
1. Find disqualified team
2. Click CheckCircle icon
3. Confirm

**Expected Result**:
- Team status changes to "ACTIVE"
- is_active set to true
- is_disqualified set to false
- Disqualification data cleared
- Action logged

---

### TC-010: Reset Team
**Objective**: Test team progress reset

**Steps**:
1. Select a team with progress
2. Click Reset icon
3. Confirm reset

**Expected Result**:
- current_level = 1
- score = 0
- time_remaining = 10800
- All custom adjustments cleared
- is_active = true
- is_disqualified = false
- Progress data cleared
- Action logged

---

### TC-011: Delete Team
**Objective**: Test team deletion

**Steps**:
1. Select a team
2. Click Delete icon
3. Confirm deletion

**Expected Result**:
- Team removed from database
- Team disappears from table
- Related progress data deleted (CASCADE)
- Action logged

---

### TC-012: Filter Teams
**Objective**: Test filtering functionality

**Steps**:
1. Click "ACTIVE" filter
2. Verify only active teams shown
3. Click "COMPLETED" filter
4. Verify only completed teams shown
5. Click "DISQUALIFIED" filter
6. Verify only disqualified teams shown
7. Click "ALL" filter
8. Verify all teams shown

**Expected Result**:
- Filters work correctly
- Team count updates
- No errors

---

### TC-013: View Admin Logs
**Objective**: Test audit log viewing

**Steps**:
1. Click "LOGS" button
2. Review recent actions
3. Verify timestamps
4. Check action details

**Expected Result**:
- Logs displayed in chronological order
- All actions visible
- Team names shown
- Details accessible

**API Verification**:
```bash
curl http://localhost:3000/api/admin/logs?limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### TC-014: Dashboard Statistics
**Objective**: Verify statistics accuracy

**Steps**:
1. Note current statistics
2. Create a new team
3. Refresh dashboard
4. Verify total_teams increased by 1

**Expected Result**:
- Statistics update correctly
- Level distribution accurate
- Average calculations correct

---

### TC-015: Real-Time Updates
**Objective**: Test auto-refresh

**Steps**:
1. Open dashboard
2. Wait 5 seconds
3. Observe network requests
4. Verify data refreshes

**Expected Result**:
- Dashboard refreshes every 5 seconds
- No errors in console
- Smooth updates

---

### TC-016: Manual Refresh
**Objective**: Test manual refresh button

**Steps**:
1. Click "REFRESH" button
2. Observe loading state
3. Verify data updates

**Expected Result**:
- Data refreshes immediately
- Loading indicator shown
- No errors

---

### TC-017: Logout
**Objective**: Test admin logout

**Steps**:
1. Click "LOGOUT" button
2. Verify redirect

**Expected Result**:
- Redirected to `/admin`
- Token removed from localStorage
- Cannot access dashboard without login

**Verification**:
```javascript
// Browser Console
localStorage.getItem('adminToken')
// Should return null
```

---

### TC-018: Unauthorized Access
**Objective**: Test security

**Steps**:
1. Clear localStorage
2. Navigate to `/admin/dashboard`

**Expected Result**:
- Redirected to `/admin` login
- Dashboard not accessible

---

### TC-019: Token Expiry
**Objective**: Test JWT expiration

**Steps**:
1. Login to admin
2. Wait 24 hours (or modify JWT expiry for testing)
3. Try to perform action

**Expected Result**:
- 401 Unauthorized error
- Redirected to login
- Token cleared

---

### TC-020: Suspicious Activity Indicators
**Objective**: Test visual indicators

**Steps**:
1. Create team with tab_switches > 5
2. Create team with suspicious_activity_count > 0
3. View dashboard

**Expected Result**:
- Yellow warning icon for high tab switches
- Red alert icon for suspicious activity
- Tooltips show counts

**Database Setup**:
```sql
UPDATE teams 
SET tab_switches = 10, suspicious_activity_count = 3 
WHERE team_name = 'TestTeam1';
```

---

### TC-021: Level Distribution Chart
**Objective**: Test level distribution display

**Steps**:
1. Create teams at different levels
2. View dashboard
3. Check level distribution

**Expected Result**:
- Accurate counts per level
- Visual representation clear
- Updates in real-time

---

### TC-022: Average Metrics
**Objective**: Test average calculations

**Steps**:
1. Create multiple teams with different scores
2. Complete some teams
3. View average score and time

**Expected Result**:
- Average score calculated correctly
- Average time for completed teams only
- Displays in readable format

---

### TC-023: Bulk Operations (Future)
**Objective**: Test bulk actions

**Steps**:
1. Select multiple teams
2. Choose bulk action
3. Execute

**Expected Result**:
- All selected teams affected
- Success/failure report shown
- Actions logged individually

---

### TC-024: Mobile Responsiveness
**Objective**: Test on mobile devices

**Steps**:
1. Open dashboard on mobile
2. Test all features
3. Verify layout

**Expected Result**:
- Responsive layout
- Touch controls work
- All features accessible
- Readable text

---

### TC-025: Team Progress Details
**Objective**: Test progress viewing

**Steps**:
1. Select team with progress
2. View progress details
3. Check level breakdown

**Expected Result**:
- Progress displayed per level
- Hints used shown
- Attempts counted
- Timestamps accurate

**API Verification**:
```bash
curl http://localhost:3000/api/admin/teams/TEAM_ID/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Testing

### Load Test: 100 Teams
```bash
# Create 100 teams
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/admin/teams \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"team_name\":\"Team$i\",\"password\":\"test123\"}"
done
```

**Expected Result**:
- Dashboard loads in < 2 seconds
- No lag in UI
- All teams displayed

---

## Security Testing

### SQL Injection Test
```bash
curl -X POST http://localhost:3000/api/admin/teams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"team_name":"Team'; DROP TABLE teams;--","password":"test"}'
```

**Expected Result**:
- Request rejected or sanitized
- No database damage
- Error logged

---

### XSS Test
```bash
curl -X POST http://localhost:3000/api/admin/teams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"team_name":"<script>alert(1)</script>","password":"test"}'
```

**Expected Result**:
- Script not executed
- Data sanitized
- Safe display

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] Admin login works
- [ ] Team creation works
- [ ] Time adjustments work
- [ ] Score adjustments work
- [ ] Disqualification works
- [ ] Reset works
- [ ] Delete works
- [ ] Filters work
- [ ] Logs display correctly
- [ ] Statistics accurate
- [ ] Auto-refresh works
- [ ] Manual refresh works
- [ ] Logout works
- [ ] Security maintained
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API endpoints respond
- [ ] Database updates correctly
- [ ] Audit trail complete
- [ ] Performance acceptable

---

## Bug Reporting Template

```markdown
**Bug ID**: ADMIN-XXX
**Severity**: Critical/High/Medium/Low
**Test Case**: TC-XXX
**Environment**: Dev/Staging/Production

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:


**Actual Result**:


**Screenshots**:


**Console Errors**:


**Additional Notes**:

```

---

## Test Data Cleanup

After testing:

```sql
-- Remove test teams
DELETE FROM teams WHERE team_name LIKE 'Test%';

-- Clear admin logs
DELETE FROM admin_actions WHERE created_at < NOW() - INTERVAL '1 day';

-- Reset sequences if needed
-- (Supabase handles this automatically)
```

---

**Testing Complete!** ✅
