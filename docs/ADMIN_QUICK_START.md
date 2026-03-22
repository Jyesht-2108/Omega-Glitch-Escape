# Admin System Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup
Run the SQL migrations in Supabase:
```bash
# Execute the SQL in backend/database/supabase.sql
# This creates the enhanced tables with admin features
```

### 2. Start Backend
```bash
cd backend
go run main.go
# Backend runs on http://localhost:3000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:8080
```

### 4. Access Admin Panel
```
URL: http://localhost:8080/admin
Username: admin
Password: Vivek@123
```

## 📋 Common Tasks

### Create a Team
1. Login to admin dashboard
2. Click "CREATE NEW TEAM" button
3. Enter team name and password
4. Click "CREATE"

### Adjust Team Time
1. Find team in the table
2. Click Edit icon (pencil)
3. Enter minutes to add/subtract
4. Add reason
5. Click "APPLY TIME CHANGE"

### Disqualify a Team
1. Find team in the table
2. Click Ban icon (circle with slash)
3. Enter disqualification reason
4. Confirm

### View Team Progress
1. Click on team name
2. View detailed progress breakdown
3. See hints used, attempts, completion times

### Monitor Suspicious Activity
- Teams with >5 tab switches show yellow warning icon
- Teams with suspicious activity show red alert icon
- Click team to see detailed activity log

## 🎯 Key Features

### Real-Time Dashboard
- Auto-refreshes every 5 seconds
- Live team statistics
- Level distribution chart
- Average metrics

### Time Management
- Add time: Enter positive number (e.g., `10` for +10 minutes)
- Subtract time: Enter negative number (e.g., `-5` for -5 minutes)
- All adjustments are tracked and logged

### Score Management
- Add points: Enter positive number (e.g., `50`)
- Subtract points: Enter negative number (e.g., `-30`)
- Adjustments visible in team details

### Filters
- **All**: Show all teams
- **Active**: Only active, non-disqualified teams
- **Completed**: Teams that finished the game
- **Disqualified**: Disqualified teams only

## 🔒 Security

### Admin Credentials
Located in `backend/.env`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Vivek@123
```

**⚠️ IMPORTANT**: Change these in production!

### JWT Token
- Valid for 24 hours
- Stored in localStorage
- Auto-logout on expiry

### Audit Trail
- All admin actions logged
- View logs by clicking "LOGS" button
- Includes timestamp, action, target team, and details

## 📊 Statistics Explained

### Total Teams
All teams created in the system

### Active Teams
Teams currently playing (not disqualified, not completed)

### Completed Teams
Teams that finished all 4 levels

### Disqualified Teams
Teams removed from competition

### Level Distribution
Number of teams at each level (1-4)

### Average Score
Mean score across all teams

### Average Time
Mean completion time for finished teams

## 🛠️ Troubleshooting

### Cannot Login
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Verify credentials in backend/.env
cat backend/.env | grep ADMIN
```

### Teams Not Showing
```bash
# Check database connection
# Verify Supabase credentials in backend/.env
# Check browser console for errors
```

### Actions Not Working
```bash
# Verify JWT token is valid
# Check browser localStorage for 'adminToken'
# Review backend logs for errors
```

## 📱 Mobile Access

The admin dashboard is responsive and works on tablets and mobile devices:
- Touch-optimized controls
- Scrollable tables
- Adaptive layout
- All features available

## 🎨 UI Guide

### Color Coding
- **Red**: Destructive actions (delete, disqualify)
- **Cyan**: Primary actions (edit, refresh)
- **Green**: Success states (completed, requalify)
- **Yellow**: Warnings (suspicious activity)

### Icons
- ✏️ Edit: Modify team settings
- 🚫 Ban: Disqualify team
- ✅ Check: Requalify team
- 🔄 Reset: Clear progress
- 🗑️ Trash: Delete team

## 📈 Best Practices

1. **Document Everything**: Always provide reasons for adjustments
2. **Monitor Regularly**: Check dashboard during active games
3. **Review Logs**: Audit admin actions periodically
4. **Backup Data**: Export team data before bulk operations
5. **Secure Access**: Change default credentials
6. **Test First**: Try actions on test teams before live event

## 🔗 API Testing

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Vivek@123"}'
```

### Get All Teams
```bash
curl http://localhost:3000/api/admin/teams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Adjust Team Time
```bash
curl -X POST http://localhost:3000/api/admin/teams/TEAM_ID/adjust-time \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"time_adjustment":600,"reason":"Technical issue"}'
```

## 📞 Support

For issues:
1. Check browser console (F12)
2. Review backend logs
3. Verify database state in Supabase
4. Check admin action logs in dashboard

---

**Ready to manage OMEGA!** 🎮
