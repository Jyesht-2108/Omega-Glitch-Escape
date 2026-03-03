🧠 PROJECT OVERVIEW
Codename: Project AURORA (temporary name – depends on
the storyline)
A secure, real-time, multi-level competitive escape room platform deployed in a controlled lab
environment using Safe Exam Browser.
🏗️ SYSTEM ARCHITECTURE (Production-
Level)
Lab PCs (Safe Exam Browser)
|
React (Vite + TS)
|
HTTPS (JWT Auth + CSRF Protection)
|
Go Backend (REST + WebSocket)
|
PostgreSQL | Redis (Cache + PubSub)
|
Logging + Monitoring
🔥 CORE DESIGN PRINCIPLES
1. Backend authoritative — frontend is dumb.
2. Every action logged.
3. Real-time updates via WebSockets.
4. Stateless API with JWT sessions.
5. Deterministic scoring logic.
6. Race-condition safe.
7. Anti-cheat layered defense.
8. Horizontally scalable (even if you don’t need it).👥 USER ROLES
Participant (Team Account)
• Authenticated session
• Single active login
• Level progression
• Score tracking
• Activity monitored
Admin
• Event controller
• Score authority
• Elimination executor
• Audit viewer
🧩 EVENT STRUCTURE
4 Levels
Each level contains:
• Story block
• 4–6 mini puzzles
• Final composite key
• Hard time limit
• Progressive scoring
Elimination:
• After Level 2 → bottom 30% auto eliminated
• After Level 3 → bottom 50% of remaining eliminated
• Level 4 → Finalists
Winner:
• Highest Level
• Highest Score
• Lowest Completion Time• Fewest Wrong Attempts
Deterministic tie-breaker logic built-in.
⚙️ DETAILED FEATURE BREAKDOWN
🔐 AUTHENTICATION SYSTEM
Features
• Pre-created team accounts
• Passwords hashed (bcrypt/argon2)
• JWT-based session tokens
• Single active session per team
• Token expiry enforcement
• Device fingerprint stored
• Re-login invalidates old session
⏱️ TIMER ARCHITECTURE
Two timers:
Global Event Timer
• Controlled by admin
• Broadcast via WebSocket
• Stored in DB
• Server authoritative
Level Timer
• Stored per team
• Countdown calculated server-side
• On expiry → auto lock / elimination
Frontend timer is display only.
Backend decides reality.🧠 LEVEL ENGINE SYSTEM
Each level contains:
• MiniPuzzle[] array
• Each puzzle independently validated
• Final key derived from mini puzzle outputs
State tracking per team:
team_level_state:
- level_id
- mini_puzzles_completed
- attempts
- hints_used
- start_time
- completion_time
- locked_status
🏆 SCORING ENGINE (Deterministic &
Transparent)
Formula:
score =
base_level_points
+ time_bonus
- wrong_attempts * penalty
- hints_used * penalty
- tab_switch_penalty
Time bonus formula:
time_bonus = (remaining_time / total_time) * time_weight
All scoring computed server-side.
Never trust frontend calculations.
🚨 ANTI-CHEAT ENGINE
Layer 1: Environment (SEB)
Layer 2: Frontend Restrictions
• Fullscreen auto-trigger
• Tab switch detection
• Copy/paste block• Context menu block
Layer 3: Backend Monitoring
• Attempt rate limit
• Brute force lock
• Suspicious activity counter
• Rapid submission detection
• Abnormal completion time flag
Layer 4: Admin Dashboard Alerts
• Flag icon for suspicious teams
• Tab switch counter
• Unusual attempt frequency
All activity logged in audit_logs.
📊 REAL-TIME LEADERBOARD ENGINE
Architecture:
• Redis PubSub
• WebSocket broadcast
• Sorted score cache
Leaderboard ranking computed as:
ORDER BY level DESC,
score DESC,
completion_time ASC,
wrong_attempts ASC
Admin sees full leaderboard.
Participants see top 5 + their own rank.
🛠️ ADMIN PORTAL (Full Control Center)
Dashboard
• Event status
• Active teams
• Eliminated teams• Real-time level distribution chart
• Average solve time per level
Team Monitor Panel
For each team:
• Current level
• Time remaining
• Wrong attempts
• Hints used
• Tab switches
• Submission log
• Manual override options
Controls
• Start / Pause / Resume event
• Trigger elimination
• Unlock next level manually
• Add/remove penalty
• Force eliminate
• Export leaderboard CSV
🗄️ DATABASE SCHEMA (Production-
Grade)
teams
id (UUID)
team_name
password_hash
current_level
total_score
is_eliminated
session_token
device_fingerprint
created_at
updated_atteam_level_state
id
team_id
level_id
start_time
end_time
wrong_attempts
hints_used
tab_switch_count
completion_time
locked
submissions
id
team_id
level_id
mini_puzzle_id
submitted_answer
is_correct
response_time_ms
created_at
levels
id
level_number
base_points
time_limit
is_active
mini_puzzles
id
level_id
question_data (JSON)
answer_hash
points
order_index
audit_logs
id
team_id
event_type
metadata (JSON)
timestamp🔌 BACKEND MODULE STRUCTURE (Go)
/cmd
/internal
/auth
/teams
/levels
/submissions
/scoring
/leaderboard
/admin
/websocket
/anticheat
/middleware
/pkg
Middleware:
• JWT validation
• Rate limiting
• Role checking
• Logging
• Panic recovery
📡 REAL-TIME SYSTEM DESIGN
WebSocket Channels:
• leaderboard_updates
• team_status_updates
• event_status_updates
• elimination_broadcast
Server pushes updates on:
• Score change
• Level completion
• Elimination trigger
• Timer update
📦 DEPLOYMENT ARCHITECTURE
Recommended:• Backend hosted on dedicated VPS (or local server in lab)
• PostgreSQL local or managed
• Redis for caching
• Nginx reverse proxy
• HTTPS enforced
For lab reliability:
Host on local LAN server to avoid internet dependency.
📊 MONITORING & LOGGING
Implement:
• Structured logging (Zap or Logrus)
• Error logging
• Panic recovery
• Request logging
• Event logs
Optional:
Prometheus + Grafana (if you really want to flex 😄)
🧪 TESTING STRATEGY
1. Unit tests (scoring, level logic)
2. Load test (simulate 100 teams)
3. Edge case testing
4. Forced crash recovery
5. SEB test dry run
🚀 PERFORMANCE TARGETS
• API response < 100ms
• WebSocket latency < 200ms
• Support 100 concurrent teams• Zero race conditions
• No duplicate submissions allowed
🧠 FAILURE RECOVERY PLAN
If server crashes:
• All team states stored persistently
• On restart → resume from DB
• Timers recalculated using timestamps
No data loss allowed.
🏁 EVENT DAY CHECKLIST
• Server running
• SEB tested
• Backup server ready
• Admin panel open
• CSV export ready
• Volunteers assigned
• Phones collected