# Testing Guide - OMEGA Glitch Escape

## Prerequisites

### Backend Setup
1. Ensure Supabase database is running with schema from `backend/database/supabase.sql`
2. Configure `.env` file in backend directory
3. Start backend server:
   ```bash
   cd backend
   make run
   ```
   Backend should be running on `http://localhost:3000`

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start frontend dev server:
   ```bash
   npm run dev
   ```
   Frontend should be running on `http://localhost:8080`

---

## Test Scenarios

### 1. Authentication Flow

#### Test Login
1. Navigate to `http://localhost:8080`
2. Enter team credentials (create team via backend API first)
3. Click "ACCESS SYSTEM"
4. **Expected**: 
   - JWT token stored in localStorage
   - Redirect to current level (Level 1 for new teams)
   - HUD displays team name and timer
   - Leaderboard loads in ticker

#### Test Invalid Login
1. Enter incorrect team name or password
2. **Expected**: Error message displayed

#### Test Protected Routes
1. Without logging in, try to access `http://localhost:8080/level/1`
2. **Expected**: Redirect to login page

#### Test Logout
1. Open browser console
2. Run: `localStorage.clear()`
3. Refresh page
4. **Expected**: Redirect to login

---

### 2. Progress Tracking

#### Test Auto-Save
1. Login and start game
2. Complete Level 1
3. Wait 30 seconds (auto-save interval)
4. Check backend logs for progress update
5. **Expected**: Progress saved to database

#### Test Progress Restore
1. Login and progress to Level 2
2. Wait for auto-save (30s)
3. Logout (clear localStorage)
4. Login again
5. **Expected**: Restored to Level 2 with correct timer

#### Test Manual Progress Check
1. Login
2. Open browser DevTools > Network tab
3. Wait 30 seconds
4. **Expected**: See PUT request to `/api/team/progress`

---

### 3. Leaderboard

#### Test Initial Load
1. Login
2. **Expected**: Leaderboard loads in HUD ticker

#### Test Periodic Refresh
1. Login and stay on any level
2. Wait 60 seconds
3. Check Network tab
4. **Expected**: GET request to `/api/leaderboard` every 60s

#### Test Victory Screen Leaderboard
1. Complete all 4 levels
2. Reach victory screen
3. **Expected**: 
   - Final leaderboard displayed
   - Team's position highlighted
   - Completion submitted to backend

---

### 4. Game Completion

#### Test Completion Submission
1. Complete Level 4
2. Navigate to victory screen
3. Check Network tab
4. **Expected**: 
   - POST request to `/api/team/complete`
   - Response 200 OK
   - Leaderboard refreshes

#### Test Completion Data
1. After completing game, check database
2. Query: `SELECT * FROM teams WHERE team_name = 'YOUR_TEAM'`
3. **Expected**:
   - `completed_at` timestamp set
   - `is_active` = false
   - Final score recorded

---

## API Endpoint Testing

### Using curl or Postman

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"team_name":"test_team","password":"test_pass"}'
```

#### Get Team Data
```bash
curl http://localhost:3000/api/team/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Progress
```bash
curl -X PUT http://localhost:3000/api/team/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_level":2,"score":100,"time_remaining":9000,"stage":"python"}'
```

#### Complete Game
```bash
curl -X POST http://localhost:3000/api/team/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"final_score":500,"time_remaining":5000}'
```

#### Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard
```

---

## Common Issues

### Issue: "Network Error" on login
- **Check**: Backend server is running
- **Check**: CORS configured correctly in backend
- **Check**: Frontend API URL matches backend port

### Issue: Progress not saving
- **Check**: JWT token is valid (check localStorage)
- **Check**: Auto-save interval is working (30s)
- **Check**: Backend logs for errors

### Issue: Leaderboard not loading
- **Check**: At least one team has completed the game
- **Check**: Backend `/api/leaderboard` endpoint returns data
- **Check**: Network tab for failed requests

### Issue: Protected routes not working
- **Check**: ProtectedRoute component is wrapping routes
- **Check**: Token exists in localStorage
- **Check**: authService.isAuthenticated() returns true

---

## Browser Console Debugging

### Check Authentication Status
```javascript
// Check if token exists
localStorage.getItem('token')

// Check auth service
import { authService } from './services/authService'
authService.isAuthenticated()
```

### Check Game State
```javascript
// View current game state
JSON.parse(localStorage.getItem('gameState'))
```

### Manual API Calls
```javascript
// Test API client
import apiClient from './lib/api'
apiClient.get('/team/me').then(console.log)
```

---

## Performance Monitoring

### Network Activity
- Auto-save: Every 30 seconds
- Leaderboard refresh: Every 60 seconds
- Total requests per minute: ~2-3

### Expected Response Times
- Login: < 500ms
- Progress update: < 200ms
- Leaderboard fetch: < 300ms
- Game completion: < 500ms

---

## Security Testing

### Test Token Expiry
1. Login and get token
2. Wait 24 hours (or modify backend JWT expiry)
3. Try to access protected route
4. **Expected**: Redirect to login

### Test Invalid Token
1. Manually modify token in localStorage
2. Try to access protected route
3. **Expected**: 401 error, redirect to login

### Test CORS
1. Try to access API from different origin
2. **Expected**: CORS error (unless origin is whitelisted)

---

## End-to-End Test Flow

1. **Start**: Navigate to login page
2. **Login**: Enter credentials, verify redirect
3. **Level 1**: Complete binary puzzle, verify progress save
4. **Level 2**: Complete Python + Base64, verify stage tracking
5. **Level 3**: Complete all 3 stages, verify admin page access
6. **Level 4**: Complete glitch + cipher, verify completion
7. **Victory**: Check leaderboard, verify submission
8. **Logout**: Clear session, verify redirect to login
9. **Re-login**: Verify cannot continue (game completed)

---

## Database Verification Queries

```sql
-- Check team progress
SELECT team_name, current_level, score, time_remaining, is_active 
FROM teams 
WHERE team_name = 'YOUR_TEAM';

-- Check leaderboard
SELECT team_name, score, 
       (10800 - time_remaining) as time_elapsed,
       completed_at
FROM teams 
WHERE completed_at IS NOT NULL 
ORDER BY time_elapsed ASC;

-- Check active teams
SELECT COUNT(*) as active_teams 
FROM teams 
WHERE is_active = true;
```
