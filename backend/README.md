# OMEGA Glitch Escape - Backend API

Go backend server with Supabase integration for the OMEGA Glitch Escape game.

## Features

- **JWT Authentication**: Secure team and admin authentication
- **Supabase Integration**: PostgreSQL database with Row Level Security
- **Team Management**: Create, update, and track team progress
- **Admin Panel**: Full admin control over teams and game state
- **Leaderboard**: Real-time leaderboard tracking
- **Progress Tracking**: Track team progress through levels and stages

## Tech Stack

- **Go 1.21+**
- **Fiber v2**: Fast HTTP framework
- **Supabase**: PostgreSQL database and authentication
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing

## Setup

### 1. Install Dependencies

```bash
cd backend
go mod download
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_secret_key
PORT=3000
FRONTEND_URL=http://localhost:8080
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `database/supabase.sql`

### 4. Run the Server

```bash
go run main.go
```

Or build and run:

```bash
go build -o omega-backend
./omega-backend
```

## API Endpoints

### Public Endpoints

#### Health Check
```
GET /api/health
```

#### Team Login
```
POST /api/auth/login
Body: {
  "team_name": "team1",
  "password": "password123"
}
Response: {
  "token": "jwt_token",
  "team": { ... }
}
```

#### Admin Login
```
POST /api/auth/admin/login
Body: {
  "team_name": "admin",
  "password": "admin_password"
}
Response: {
  "token": "jwt_token",
  "admin": true
}
```

#### Get Leaderboard
```
GET /api/leaderboard
Response: [
  {
    "rank": 1,
    "team_name": "Team Alpha",
    "score": 1500,
    "time_elapsed": "01:23:45",
    "completed_at": "2026-03-18 20:30:00"
  }
]
```

### Protected Team Endpoints

All team endpoints require `Authorization: Bearer <token>` header.

#### Get Current Team
```
GET /api/team/me
Response: {
  "id": "uuid",
  "team_name": "team1",
  "current_level": 2,
  "score": 500,
  "time_remaining": 9000,
  ...
}
```

#### Update Progress
```
PUT /api/team/progress
Body: {
  "current_level": 2,
  "score": 500,
  "time_remaining": 9000,
  "stage": "python"
}
```

#### Complete Game
```
POST /api/team/complete
Body: {
  "final_score": 1500,
  "time_remaining": 3600
}
```

### Protected Admin Endpoints

All admin endpoints require admin JWT token.

#### Create Team
```
POST /api/admin/teams
Body: {
  "team_name": "team1",
  "password": "password123"
}
```

#### Get All Teams
```
GET /api/admin/teams
```

#### Get Team by ID
```
GET /api/admin/teams/:id
```

#### Update Team
```
PUT /api/admin/teams/:id
Body: {
  "score": 1000,
  "current_level": 3,
  "time_remaining": 5400
}
```

#### Delete Team
```
DELETE /api/admin/teams/:id
```

#### Reset Team
```
POST /api/admin/teams/:id/reset
```

#### Get Stats
```
GET /api/admin/stats
Response: {
  "total_teams": 10,
  "active_teams": 5,
  "completed_teams": 3,
  "average_score": 850
}
```

## Database Schema

### teams
- `id` (UUID, PK)
- `team_name` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hashed)
- `current_level` (INTEGER)
- `score` (INTEGER)
- `time_remaining` (INTEGER, seconds)
- `is_active` (BOOLEAN)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### team_progress
- `id` (UUID, PK)
- `team_id` (UUID, FK)
- `level` (INTEGER)
- `stage` (VARCHAR)
- `hints_used` (INTEGER)
- `attempts_count` (INTEGER)
- `completed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

## Development

### Project Structure

```
backend/
├── config/          # Configuration management
├── database/        # SQL schemas
├── handlers/        # HTTP request handlers
├── middleware/      # Authentication middleware
├── models/          # Data models
├── routes/          # Route definitions
├── services/        # Business logic
├── main.go          # Entry point
├── go.mod           # Go dependencies
└── .env             # Environment variables
```

### Adding New Endpoints

1. Define models in `models/`
2. Add business logic in `services/`
3. Create handlers in `handlers/`
4. Register routes in `routes/routes.go`

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Row Level Security enabled on Supabase
- CORS configured for frontend origin
- Admin endpoints require admin role

## License

MIT
