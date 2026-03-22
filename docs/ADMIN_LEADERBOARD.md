# Admin Leaderboard System

## Overview
The Admin Leaderboard provides a comprehensive ranking system that takes into account multiple factors beyond just score and time. It's designed to fairly rank teams based on their overall performance, including penalties for hints, wrong attempts, and suspicious behavior.

## Access
Navigate to: `http://localhost:8080/admin/leaderboard`

Or click the "LEADERBOARD" button from the Admin Dashboard.

## Ranking Formula

### Base Components

**Positive Factors (Bonuses):**
1. **Game Score**: Direct points earned during gameplay
2. **Level Completion Bonus**: `Level² × 100 points`
   - Level 1: 100 points
   - Level 2: 400 points
   - Level 3: 900 points
   - Level 4: 1,600 points
3. **Time Bonus**: `(Time Remaining / Total Time) × 500`
   - Only applied to completed games
   - Rewards faster completion

**Negative Factors (Penalties):**
1. **Hints Used**: `-50 points per hint`
2. **Wrong Attempts**: `-20 points per wrong answer`
3. **Tab Switches**: `-30 points per tab switch`
4. **Suspicious Activity**: `-100 points per suspicious event`
5. **Disqualification**: Ranking score set to -999,999

### Formula
```
Ranking Score = Base Score 
              + (Level² × 100)
              + (Time Remaining / 10800 × 500)
              - (Hints × 50)
              - (Wrong Attempts × 20)
              - (Tab Switches × 30)
              - (Suspicious Activity × 100)
```

## Features

### 1. Top 3 Podium
Visual display of the top 3 teams with special styling:
- **1st Place**: Gold crown, yellow glow
- **2nd Place**: Silver medal
- **3rd Place**: Bronze award

### 2. Detailed Rankings Table
Columns:
- **Rank**: Position with special icons for top 3
- **Team**: Team name with completion/disqualification badges
- **Level**: Current level reached
- **Score**: Game points earned
- **Time**: Time elapsed
- **Hints**: Total hints used across all levels
- **Wrong**: Total wrong attempts
- **Flags**: Tab switches and suspicious activity indicators
- **Ranking**: Final calculated ranking score

### 3. Filters
- **All**: Show all teams
- **Completed**: Only teams that finished
- **Active**: Only teams currently playing

### 4. Real-Time Updates
- Auto-refreshes every 10 seconds
- Live ranking adjustments
- Instant penalty tracking

### 5. Statistics Summary
Bottom panel showing:
- Total teams
- Completed teams
- Active teams
- Disqualified teams

## Visual Indicators

### Rank Badges
- **1st**: Gold border with crown icon
- **2nd**: Silver border with medal icon
- **3rd**: Bronze border with award icon
- **4th+**: Standard border with rank number

### Status Icons
- ✅ **Green Check**: Team completed the game
- 🚫 **Red Ban**: Team is disqualified
- ⚠️ **Yellow Warning**: High tab switches (>5)
- 🔴 **Red Alert**: Suspicious activity detected

### Level Badges
- **Level 4**: Accent color (green)
- **Level 3**: Secondary color (blue)
- **Level 1-2**: Muted color (gray)

## Example Scenarios

### Scenario 1: Fast Completion
```
Team: Alpha
- Base Score: 500
- Level: 4 (1600 bonus)
- Time Remaining: 3600s (167 bonus)
- Hints: 2 (-100)
- Wrong: 5 (-100)
- Tab Switches: 1 (-30)
- Suspicious: 0 (0)
= Ranking Score: 2037
```

### Scenario 2: Slow but Accurate
```
Team: Beta
- Base Score: 600
- Level: 4 (1600 bonus)
- Time Remaining: 600s (28 bonus)
- Hints: 0 (0)
- Wrong: 0 (0)
- Tab Switches: 0 (0)
- Suspicious: 0 (0)
= Ranking Score: 2228
```

### Scenario 3: High Penalties
```
Team: Gamma
- Base Score: 700
- Level: 3 (900 bonus)
- Time Remaining: 2000s (93 bonus)
- Hints: 10 (-500)
- Wrong: 20 (-400)
- Tab Switches: 15 (-450)
- Suspicious: 3 (-300)
= Ranking Score: 1043
```

## API Endpoint

### Get Advanced Leaderboard
```
GET /api/admin/leaderboard
Authorization: Bearer {admin_token}
```

**Response:**
```json
[
  {
    "rank": 1,
    "team_name": "Team Alpha",
    "team_id": "uuid",
    "current_level": 4,
    "score": 500,
    "time_elapsed": 7200,
    "time_remaining": 3600,
    "total_hints_used": 2,
    "total_attempts": 25,
    "total_wrong_attempts": 5,
    "tab_switches": 1,
    "suspicious_activity_count": 0,
    "is_completed": true,
    "is_disqualified": false,
    "completed_at": "2024-01-15 14:30:00",
    "ranking_score": 2037.5
  }
]
```

## Database Schema

### Enhanced team_progress Table
```sql
CREATE TABLE team_progress (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    level INTEGER,
    stage VARCHAR(50),
    hints_used INTEGER DEFAULT 0,
    attempts_count INTEGER DEFAULT 0,
    wrong_attempts INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP
);
```

## Best Practices

### For Fair Competition
1. **Consistent Penalties**: Apply the same penalty values for all teams
2. **Clear Communication**: Inform participants about the ranking system
3. **Regular Monitoring**: Check for anomalies in the leaderboard
4. **Audit Trail**: Review admin logs for any manual adjustments

### For Accurate Rankings
1. **Track Everything**: Ensure all metrics are properly recorded
2. **Validate Data**: Check for data integrity issues
3. **Handle Edge Cases**: Account for incomplete games, disconnections
4. **Time Synchronization**: Ensure server time is accurate

## Troubleshooting

### Rankings Don't Update
- Check if backend is running
- Verify admin token is valid
- Check browser console for errors
- Ensure database has latest data

### Incorrect Scores
- Verify team_progress records are complete
- Check for missing penalty data
- Review admin action logs for manual adjustments
- Validate formula calculations

### Missing Teams
- Check if teams are filtered out
- Verify teams exist in database
- Check for database connection issues

## Advanced Features

### Export Leaderboard
Future enhancement to export rankings to CSV/PDF for official records.

### Historical Rankings
Track ranking changes over time to see team progression.

### Custom Weights
Allow admins to adjust penalty/bonus weights for different events.

### Team Comparison
Side-by-side comparison of two teams' metrics.

## Performance Considerations

- Leaderboard calculation is done on-demand
- Results are not cached (always fresh)
- Suitable for up to 1000 teams
- For larger events, consider caching strategy

## Security

- Admin authentication required
- Read-only access (no modifications from leaderboard page)
- All data sourced from authoritative backend
- No client-side ranking manipulation possible

---

**The most comprehensive and fair ranking system for OMEGA!** 🏆
