# API Endpoints Reference

## Base URL
- Local: `http://localhost:3000`
- Production: `http://YOUR_DOMAIN` or `http://YOUR_EC2_IP`

## Health & Info Endpoints

### Root Endpoint
```bash
GET /
```
Returns API information and available endpoints.

**Response:**
```json
{
  "name": "OMEGA Glitch Escape API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health or /api/health",
    "auth": "/api/auth/*",
    "team": "/api/team/*",
    "puzzle": "/api/puzzle/*",
    "leaderboard": "/api/leaderboard",
    "admin": "/api/admin/*"
  }
}
```

**Example:**
```bash
curl http://localhost:3000/
```

### Health Check (Root)
```bash
GET /health
```
Simple health check endpoint for load balancers.

**Response:**
```json
{
  "status": "ok",
  "message": "OMEGA Glitch Escape API is running"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

### Health Check (API)
```bash
GET /api/health
```
API-level health check.

**Response:**
```json
{
  "status": "ok",
  "message": "OMEGA Glitch Escape API is running"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

## Authentication Endpoints

### Team Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "team_name": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "team": {
    "id": "uuid",
    "team_name": "string",
    "current_level": 1,
    "score": 0,
    "time_remaining": 10800,
    "completed_at": null
  }
}
```

### Admin Login
```bash
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "admin": true
}
```

## Team Endpoints (Protected)

All team endpoints require `Authorization: Bearer <token>` header.

### Get Current Team
```bash
GET /api/team/me
Authorization: Bearer <token>
```

### Update Progress
```bash
PUT /api/team/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "level": 2,
  "score": 100,
  "time_remaining": 10500
}
```

### Complete Game
```bash
POST /api/team/complete
Authorization: Bearer <token>
```

### Disqualify Team
```bash
POST /api/team/disqualify
Authorization: Bearer <token>
```

## Puzzle Endpoints (Protected)

### Submit Answer
```bash
POST /api/puzzle/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "level": "level1",
  "answer": "your_answer"
}
```

**Response:**
```json
{
  "correct": true,
  "message": "Correct answer!",
  "points": 100,
  "next_level": 2
}
```

### Request Hint
```bash
POST /api/puzzle/hint
Authorization: Bearer <token>
Content-Type: application/json

{
  "level": "level1"
}
```

**Response:**
```json
{
  "hint": "Hint text here",
  "penalty": 300,
  "hints_used": 1
}
```

### Get Hint Info
```bash
GET /api/puzzle/hint-info/:level
Authorization: Bearer <token>
```

**Response:**
```json
{
  "hints_used": 0,
  "hints_available": 3,
  "penalty_per_hint": 300
}
```

## Leaderboard Endpoints (Public)

### Get Leaderboard
```bash
GET /api/leaderboard
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "team_name": "Team Alpha",
      "score": 1000,
      "level": 4,
      "completed": true
    }
  ]
}
```

### Get Live Leaderboard
```bash
GET /api/leaderboard/live
```

Real-time leaderboard with current standings.

## Admin Endpoints (Protected + Admin Only)

All admin endpoints require `Authorization: Bearer <admin_token>` header.

### Create Team
```bash
POST /api/admin/teams
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "team_name": "New Team",
  "password": "password123"
}
```

### Get All Teams
```bash
GET /api/admin/teams
Authorization: Bearer <admin_token>
```

### Get Team by ID
```bash
GET /api/admin/teams/:id
Authorization: Bearer <admin_token>
```

### Update Team
```bash
PUT /api/admin/teams/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "team_name": "Updated Name",
  "current_level": 2,
  "score": 500
}
```

### Delete Team
```bash
DELETE /api/admin/teams/:id
Authorization: Bearer <admin_token>
```

### Reset Team
```bash
POST /api/admin/teams/:id/reset
Authorization: Bearer <admin_token>
```

### Disqualify Team
```bash
POST /api/admin/teams/:id/disqualify
Authorization: Bearer <admin_token>
```

### Requalify Team
```bash
POST /api/admin/teams/:id/requalify
Authorization: Bearer <admin_token>
```

### Adjust Time
```bash
POST /api/admin/teams/:id/adjust-time
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "seconds": 300
}
```

### Adjust Score
```bash
POST /api/admin/teams/:id/adjust-score
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "points": 100
}
```

### Get Team Progress
```bash
GET /api/admin/teams/:id/progress
Authorization: Bearer <admin_token>
```

### Bulk Action
```bash
POST /api/admin/bulk-action
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "reset",
  "team_ids": ["uuid1", "uuid2"]
}
```

### Get Stats
```bash
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

### Get Admin Logs
```bash
GET /api/admin/logs
Authorization: Bearer <admin_token>
```

### Get Advanced Leaderboard
```bash
GET /api/admin/leaderboard
Authorization: Bearer <admin_token>
```

## Testing Endpoints

### Quick Health Check
```bash
# Test if server is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","message":"OMEGA Glitch Escape API is running"}
```

### Test Root Endpoint
```bash
# Get API info
curl http://localhost:3000/

# Expected response:
# {"name":"OMEGA Glitch Escape API","version":"1.0.0",...}
```

### Test Login
```bash
# Test team login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"team_name":"test","password":"test123"}'
```

### Test with Token
```bash
# Get current team info
curl http://localhost:3000/api/team/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## CORS Configuration

The API allows requests from the configured frontend URL.

**Allowed Headers:**
- Origin
- Content-Type
- Accept
- Authorization

**Allowed Methods:**
- GET
- POST
- PUT
- DELETE
- OPTIONS

## Rate Limiting

Currently no rate limiting is implemented at the application level. Consider adding Nginx rate limiting in production.

---

For more details, see the deployment guide and API documentation.
