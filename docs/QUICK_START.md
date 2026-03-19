# Quick Start Guide - OMEGA Glitch Escape

## Setup (5 minutes)

### 1. Database Setup
```bash
# Create Supabase project at https://supabase.com
# Run the SQL schema from backend/database/supabase.sql
# Copy your credentials
```

### 2. Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=your_url
# SUPABASE_ANON_KEY=your_key
# SUPABASE_SERVICE_KEY=your_service_key
# SUPABASE_JWT_SECRET=your_jwt_secret

# Run backend
make run
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:8080`

---

## Create Test Team

### Option 1: Using curl
```bash
curl -X POST http://localhost:3000/api/admin/teams \
  -H "Content-Type: application/json" \
  -u "admin:your_admin_password" \
  -d '{
    "team_name": "test_team",
    "password": "test_pass"
  }'
```

### Option 2: Direct SQL
```sql
INSERT INTO teams (team_name, password_hash, current_level, score, time_remaining)
VALUES ('test_team', crypt('test_pass', gen_salt('bf')), 1, 0, 10800);
```

---

## Play the Game

1. **Clear browser storage first** (important if you've used the app before):
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

2. Navigate to `http://localhost:8080`
3. Login with: `test_team` / `test_pass`
4. Complete the 4 levels
5. View victory screen with leaderboard

---

## Game Answers (Spoilers!)

### Level 1
- Binary conversion: `SYS`

### Level 2
- Python debug: `BYPAS`

### Level 3
- Pointers: `42`
- Stack: `3-17-42`
- Dataset: `1.47`
- Access: Navigate to `/level3-admin`

### Level 4
- Glitch image: `OMEGA`
- Vigenère cipher: `GKWZEATERT`

---

## API Endpoints

### Public
- `POST /api/auth/login` - Team login

### Protected (Requires JWT)
- `GET /api/team/me` - Get team data
- `PUT /api/team/progress` - Update progress
- `POST /api/team/complete` - Complete game
- `GET /api/leaderboard` - Get rankings

### Admin (Requires Basic Auth)
- `POST /api/admin/teams` - Create team
- `GET /api/admin/teams` - List all teams
- `DELETE /api/admin/teams/:id` - Delete team
- `PUT /api/admin/teams/:id/reset` - Reset progress

---

## Features

### Auto-Save
Progress saves every 30 seconds automatically

### Leaderboard
Updates every 60 seconds during gameplay

### Protected Routes
All game pages require authentication

### Progress Tracking
- Current level
- Time remaining
- Score
- Stage completion (for multi-stage levels)

---

## Troubleshooting

### Backend won't start
- Check Supabase credentials in `.env`
- Ensure port 3000 is available
- Check database schema is applied

### Frontend won't connect
- Verify backend is running on port 3000
- Check CORS settings in backend
- Clear browser cache and localStorage

### Login fails
- Verify team exists in database
- Check password is correct
- Check backend logs for errors

### Progress not saving
- Check JWT token in localStorage
- Verify backend receives requests (Network tab)
- Check backend logs for errors

---

## Development

### Backend
```bash
cd backend
make run        # Run server
make test       # Run tests
make build      # Build binary
```

### Frontend
```bash
cd frontend
npm run dev     # Dev server
npm run build   # Production build
npm run preview # Preview build
```

---

## Production Deployment

### Backend
1. Set environment variables
2. Build: `make build`
3. Run: `./bin/server`
4. Use reverse proxy (nginx/caddy)
5. Enable HTTPS

### Frontend
1. Build: `npm run build`
2. Serve `dist/` folder
3. Configure API URL in `.env`
4. Enable HTTPS

### Database
1. Use production Supabase project
2. Enable Row Level Security
3. Set up backups
4. Monitor performance

---

## Support

- **Documentation**: See `docs/` folder
- **Backend README**: `backend/README.md`
- **Integration Guide**: `docs/FRONTEND_BACKEND_INTEGRATION.md`
- **Testing Guide**: `docs/TESTING_GUIDE.md`
