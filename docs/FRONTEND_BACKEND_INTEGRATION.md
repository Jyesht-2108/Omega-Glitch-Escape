# Frontend-Backend Integration Plan

## Overview
Integrate the React frontend with the Go backend API to enable real authentication, progress tracking, and leaderboard functionality.

## Architecture
- **Frontend**: React (Vite) on port 8080
- **Backend**: Go (Fiber) on port 3000
- **Database**: Supabase PostgreSQL
- **Auth**: JWT tokens (Supabase JWT Secret)

---

## Phase 1: API Client Setup ✅ COMPLETED

### 1.1 Create API Client ✅
- [x] Create `frontend/src/lib/api.ts` - Axios/Fetch wrapper
- [x] Configure base URL (http://localhost:3000/api)
- [x] Add request/response interceptors
- [x] Handle JWT token storage and injection

### 1.2 Create API Service Layer ✅
- [x] `frontend/src/services/authService.ts` - Login/logout
- [x] `frontend/src/services/teamService.ts` - Team progress
- [x] `frontend/src/services/leaderboardService.ts` - Leaderboard data

---

## Phase 2: Authentication Integration ✅ COMPLETED

### 2.1 Update Login Page ✅
- [x] Connect login form to `/api/auth/login` endpoint
- [x] Store JWT token in localStorage
- [x] Handle login errors (invalid credentials)
- [x] Redirect to current level on success
- [x] Add loading states
- [x] Display error messages

### 2.2 Update GameContext ✅
- [x] Replace mock authentication with real API calls
- [x] Store JWT token and team ID in context
- [x] Load team data from backend on login
- [x] Sync state with backend (auto-save every 30s)
- [x] Handle logout (clear token and state)
- [x] Load leaderboard from backend
- [x] Format time display helper

### 2.3 Protected Routes ✅
- [x] Add authentication check to routes
- [x] Redirect to login if no token
- [x] Created ProtectedRoute component
- [x] Wrapped all game routes with protection

---

## Phase 3: Game Progress Integration ✅ COMPLETED

### 3.1 Load Game State ✅
- [x] Fetch team data on login (`/api/team/me`)
- [x] Restore progress (current level, time remaining, score)
- [x] Sync localStorage with backend
- [x] Load level stages from backend

### 3.2 Save Progress ✅
- [x] Auto-save progress every 30 seconds
- [x] Save current level, time remaining, score
- [x] Save level stages for multi-stage levels
- [x] Update endpoint: `PUT /api/team/progress`
- [x] Error handling for failed saves

### 3.3 Level Completion ✅
- [x] Track progress in backend via auto-save
- [x] Save stage completions
- [x] Call completion endpoint on game finish

---

## Phase 4: Leaderboard Integration ✅ COMPLETED

### 4.1 Real-time Leaderboard ✅
- [x] Fetch from `/api/leaderboard`
- [x] Load on login
- [x] Format time display
- [x] Display in HUD ticker (already implemented)
- [x] Update every 60 seconds
- [x] Refresh on game completion

### 4.2 Victory Screen ✅
- [x] Submit final score to `/api/team/complete`
- [x] Display final leaderboard position
- [x] Show completion time
- [x] Highlight team's position in leaderboard
- [x] Auto-refresh leaderboard after submission

---

## Phase 5: Admin Panel (Future)

### 5.1 Admin Login
- [ ] Separate admin login page
- [ ] Admin dashboard route

### 5.2 Team Management
- [ ] Create teams
- [ ] View all teams
- [ ] Reset team progress
- [ ] Delete teams

### 5.3 Live Monitoring
- [ ] Real-time team progress
- [ ] Live leaderboard
- [ ] Game statistics

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/login
Body: { team_name, password }
Response: { token, team }
```

### Team Operations
```
GET /api/team/me
Headers: Authorization: Bearer <token>
Response: { id, team_name, current_level, score, time_remaining, ... }

PUT /api/team/progress
Headers: Authorization: Bearer <token>
Body: { current_level, score, time_remaining, stage }

POST /api/team/complete
Headers: Authorization: Bearer <token>
Body: { final_score, time_remaining }
```

### Leaderboard
```
GET /api/leaderboard
Response: [{ rank, team_name, score, time_elapsed, completed_at }]
```

---

## Data Flow

### Login Flow
1. User enters team_name and password
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + team data
5. Frontend stores token in localStorage
6. Frontend loads game state from team data
7. Redirect to current level

### Progress Save Flow
1. User completes action (answer, level, etc.)
2. Frontend updates local state
3. Frontend calls `PUT /api/team/progress`
4. Backend updates database
5. Continue game

### Game Completion Flow
1. User completes Level 4
2. Frontend calls `POST /api/team/complete`
3. Backend marks game as completed
4. Backend calculates final stats
5. Frontend shows victory screen with leaderboard

---

## Error Handling

### Network Errors
- Show "Connection Lost" message
- Queue updates for retry
- Retry failed requests

### Authentication Errors
- 401: Token expired → Redirect to login
- 403: Insufficient permissions → Show error
- Invalid credentials → Show error message

### Validation Errors
- 400: Invalid data → Show field errors
- 409: Duplicate team → Show error

---

## Security Considerations

1. **Token Storage**: localStorage (acceptable for CTF game)
2. **Token Expiry**: 24 hours (configurable)
3. **HTTPS**: Required in production
4. **CORS**: Configured for localhost:8080
5. **Rate Limiting**: Consider adding to backend

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token persists on page refresh
- [ ] Logout clears token
- [ ] Expired token redirects to login

### Progress Tracking
- [ ] Progress saves automatically
- [ ] Progress restores on login
- [ ] Level completion tracked
- [ ] Score updates correctly
- [ ] Timer syncs with backend

### Leaderboard
- [ ] Leaderboard loads on mount
- [ ] Updates periodically
- [ ] Shows correct rankings
- [ ] Displays completion times

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_AUTO_SAVE_INTERVAL=30000
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
PORT=3000
FRONTEND_URL=http://localhost:8080
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

---

## Implementation Order

1. ✅ **Phase 1**: API Client Setup
2. ✅ **Phase 2**: Authentication Integration
3. ✅ **Phase 3**: Game Progress Integration
4. ✅ **Phase 4**: Leaderboard Integration
5. **Phase 5**: Admin Panel (Optional - Future)

---

## Current Status - Phase 4 COMPLETE ✅

### Completed Features
- ✅ API client with JWT token management
- ✅ Authentication service (login/logout)
- ✅ Team service (progress save/load/complete)
- ✅ Leaderboard service with auto-refresh
- ✅ GameContext backend integration
- ✅ Auto-save progress every 30 seconds
- ✅ Load progress on login
- ✅ Leaderboard display with periodic refresh (60s)
- ✅ Protected routes for all game pages
- ✅ Victory screen with game completion submission
- ✅ Final leaderboard display on victory
- ✅ Timer starts on all levels (1-4)
- ✅ Timer pauses during security breach
- ✅ Timer resumes after security breach dismissed

### Bug Fixes Applied
- ✅ Fixed localStorage initialization (safe field mapping)
- ✅ Fixed login parameter type mismatch
- ✅ Added token validation on app mount
- ✅ Fixed timer not starting on Levels 2, 3, 4
- ✅ Fixed timer continuing during security breach
- ✅ Added pause/resume timer functionality

### Integration Complete
All core backend integration is now complete. The game:
- Authenticates users via backend API
- Saves progress automatically every 30 seconds
- Loads saved progress on login
- Displays real-time leaderboard (refreshes every 60s)
- Submits final score on game completion
- Shows final rankings on victory screen
- Protects all game routes with authentication
- Properly manages timer state across all levels
- Pauses timer during security breaches

### Optional Enhancements (Future)
- Admin panel for team management
- Real-time progress monitoring
- Advanced analytics dashboard
- Team reset functionality
- Bulk team creation
