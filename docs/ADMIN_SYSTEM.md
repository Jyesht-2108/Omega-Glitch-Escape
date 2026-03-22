# OMEGA Admin Control Center

## Overview
The Admin Control Center is a comprehensive dashboard for managing the OMEGA Glitch Escape game. It provides real-time monitoring, team management, and advanced control features.

## Access

### URL
```
http://localhost:8080/admin
```

### Credentials
Configured in `backend/.env`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Vivek@123
```

## Features

### 1. Real-Time Dashboard
- **Live Statistics**: Total teams, active teams, completed teams, disqualified teams
- **Level Distribution**: Visual breakdown of teams across all 4 levels
- **Average Metrics**: Average score and completion time
- **Auto-Refresh**: Dashboard updates every 5 seconds

### 2. Team Management

#### View Teams
- Filter by: All, Active, Completed, Disqualified
- See team details: Level, Score, Time Remaining, Status
- Visual indicators for suspicious activity and tab switches

#### Create Teams
- Add new teams with custom credentials
- Instant team creation with secure password hashing

#### Edit Teams
- **Time Adjustment**: Add or subtract time (in minutes)
  - Positive values add time
  - Negative values subtract time
  - Tracks custom time bonuses
  - Requires reason for audit trail

- **Score Adjustment**: Add or subtract points
  - Positive values add points
  - Negative values subtract points
  - Tracks custom score adjustments
  - Requires reason for audit trail

#### Team Actions
- **Disqualify**: Remove team from competition with reason
- **Requalify**: Restore disqualified team
- **Reset**: Clear all progress and restart team
- **Delete**: Permanently remove team

### 3. Disqualification Management
- Disqualify teams with custom reasons
- Track disqualification timestamp
- View disqualification history
- Requalify teams if needed
- Automatic status updates

### 4. Anti-Cheat Monitoring
- **Tab Switch Counter**: Visual indicator when > 5 switches
- **Suspicious Activity Counter**: Alert icon for flagged behavior
- Real-time activity tracking
- Historical activity logs

### 5. Admin Action Logs
- Complete audit trail of all admin actions
- Timestamps for every action
- Target team information
- Action details and reasons
- Last 50 actions displayed
- Searchable and filterable

### 6. Bulk Operations
- Select multiple teams
- Bulk disqualify with reason
- Bulk reset progress
- Bulk delete teams
- Success/failure reporting

### 7. Team Progress Tracking
- View detailed progress per team
- Level-by-level breakdown
- Hints used tracking
- Attempts count
- Completion timestamps

## API Endpoints

### Authentication
```
POST /api/auth/admin/login
Body: { "username": "admin", "password": "password" }
Response: { "token": "jwt_token", "admin": true }
```

### Team Management
```
GET    /api/admin/teams              - Get all teams
GET    /api/admin/teams/:id          - Get specific team
POST   /api/admin/teams              - Create team
PUT    /api/admin/teams/:id          - Update team
DELETE /api/admin/teams/:id          - Delete team
POST   /api/admin/teams/:id/reset    - Reset team progress
```

### Team Actions
```
POST /api/admin/teams/:id/disqualify
Body: { "reason": "Cheating detected" }

POST /api/admin/teams/:id/requalify

POST /api/admin/teams/:id/adjust-time
Body: { "time_adjustment": 300, "reason": "Technical issue" }

POST /api/admin/teams/:id/adjust-score
Body: { "score_adjustment": -50, "reason": "Penalty for violation" }
```

### Statistics & Logs
```
GET /api/admin/stats                  - Get game statistics
GET /api/admin/logs?limit=50          - Get admin action logs
GET /api/admin/teams/:id/progress     - Get team progress details
```

### Bulk Operations
```
POST /api/admin/bulk-action
Body: {
  "team_ids": ["uuid1", "uuid2"],
  "action": "disqualify|reset|delete",
  "reason": "Optional reason"
}
```

## Database Schema

### Teams Table (Enhanced)
```sql
- custom_time_bonus: INTEGER         -- Admin time adjustments
- custom_score_adjustment: INTEGER   -- Admin score adjustments
- tab_switches: INTEGER              -- Tab switch counter
- suspicious_activity_count: INTEGER -- Suspicious behavior counter
- last_activity: TIMESTAMP           -- Last activity timestamp
```

### Admin Actions Table
```sql
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY,
    admin_username VARCHAR(255),
    action_type VARCHAR(100),
    target_team_id UUID,
    target_team_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP
);
```

## Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Admin-Only Routes**: Middleware protection
3. **Audit Logging**: All actions logged
4. **Password Hashing**: Secure credential storage
5. **Session Management**: Token expiry (24 hours)

## UI Features

### Cyberpunk Theme
- Red glowing borders for admin sections
- Cyan accents for primary actions
- Green highlights for success states
- Monospace fonts for technical feel
- CRT-style effects (disabled on admin pages)

### Responsive Design
- Mobile-friendly layout
- Adaptive grid system
- Touch-optimized controls
- Scrollable tables

### Real-Time Updates
- Auto-refresh every 5 seconds
- Manual refresh button
- Live status indicators
- Instant action feedback

## Usage Examples

### Scenario 1: Technical Issue
A team experiences a browser crash and loses 10 minutes.

**Solution**:
1. Click Edit on the team
2. Enter `10` in Time Adjustment
3. Add reason: "Browser crash - technical issue"
4. Click Apply Time Change

### Scenario 2: Cheating Detected
A team is caught using external resources.

**Solution**:
1. Click Disqualify button
2. Enter reason: "Using external resources"
3. Confirm action
4. Team is immediately disqualified and marked inactive

### Scenario 3: Scoring Error
A team's score was incorrectly calculated.

**Solution**:
1. Click Edit on the team
2. Enter adjustment (e.g., `+50` or `-30`)
3. Add reason: "Scoring calculation error"
4. Click Apply Score Change

### Scenario 4: Mass Reset
Need to reset all teams for a new session.

**Solution**:
1. Select all teams
2. Choose "Bulk Action"
3. Select "Reset"
4. Confirm action
5. All teams reset to initial state

## Best Practices

1. **Always Provide Reasons**: Document all adjustments for audit trail
2. **Monitor Logs**: Regularly check admin action logs
3. **Watch Suspicious Activity**: Investigate teams with high tab switches
4. **Backup Before Bulk Actions**: Bulk operations cannot be undone
5. **Regular Refreshes**: Keep dashboard updated during active games
6. **Secure Credentials**: Change default admin password in production

## Troubleshooting

### Cannot Login
- Check credentials in `backend/.env`
- Verify backend is running on port 3000
- Check browser console for errors

### Teams Not Updating
- Click Refresh button
- Check network connection
- Verify backend API is accessible

### Actions Not Working
- Verify admin token is valid
- Check browser console for errors
- Ensure backend middleware is configured

## Advanced Features

### Custom Time Bonuses
- Tracked separately from game time
- Visible in team details
- Included in leaderboard calculations
- Logged in admin actions

### Custom Score Adjustments
- Independent from game scoring
- Transparent to teams
- Affects final rankings
- Fully auditable

### Suspicious Activity Tracking
- Automatic detection
- Visual indicators
- Historical tracking
- Admin review capability

## Future Enhancements

- [ ] Export teams to CSV
- [ ] Import teams from CSV
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Team communication system
- [ ] Automated disqualification rules
- [ ] Performance analytics
- [ ] Custom report generation

## Support

For issues or questions:
1. Check logs: `/api/admin/logs`
2. Review team progress: `/api/admin/teams/:id/progress`
3. Verify database state
4. Check backend logs

---

**OMEGA Control Center** - Complete administrative control for the ultimate escape room experience.
