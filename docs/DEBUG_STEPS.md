# Debug Steps for Login Issue

## Issue
Error: "Cannot read properties of undefined (reading 'team_name')"
Black screen after login

## Root Cause
Old localStorage data with incorrect structure causing initialization errors

## Solution Steps

### 1. Clear Browser Storage
Open browser console (F12) and run:
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 2. Verify Backend is Running
```bash
# Check backend is running on port 3000
curl http://localhost:3000/api/leaderboard
```

### 3. Create Test Team
```bash
# Using curl
curl -X POST http://localhost:3000/api/admin/teams \
  -H "Content-Type: application/json" \
  -u "admin:your_admin_password" \
  -d '{
    "team_name": "test_team",
    "password": "test_pass"
  }'
```

Or using SQL:
```sql
INSERT INTO teams (team_name, password_hash, current_level, score, time_remaining)
VALUES ('test_team', crypt('test_pass', gen_salt('bf')), 1, 0, 10800);
```

### 4. Test Login Flow
1. Navigate to `http://localhost:8080`
2. Enter: `test_team` / `test_pass`
3. Click "AUTHENTICATE"
4. Should redirect to `/level/1`

### 5. Check Network Tab
Open DevTools > Network tab and verify:
- POST to `/api/auth/login` returns 200
- Response contains `token` and `team` object
- GET to `/api/leaderboard` returns 200

### 6. Check Console for Errors
Look for:
- Any red errors
- Failed API calls
- Token storage issues

## Common Issues

### Issue: "Authentication failed"
- **Check**: Backend is running
- **Check**: Team exists in database
- **Check**: Password is correct

### Issue: Black screen after login
- **Check**: localStorage is cleared
- **Check**: Token is stored (check Application > Local Storage)
- **Check**: No console errors

### Issue: Redirect to login immediately
- **Check**: Token is valid
- **Check**: ProtectedRoute is working
- **Check**: authService.isAuthenticated() returns true

## Manual Testing

### Check Token Storage
```javascript
// In browser console
localStorage.getItem('token')
```

### Check Game State
```javascript
// In browser console
JSON.parse(localStorage.getItem('gameState'))
```

### Test API Manually
```javascript
// In browser console
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ team_name: 'test_team', password: 'test_pass' })
})
.then(r => r.json())
.then(console.log)
```

## Fixed Issues

1. ✅ GameContext initialization now safely handles missing fields
2. ✅ Login page passes correct LoginResponse object
3. ✅ Added token validation on app mount
4. ✅ Timer always starts stopped (not running from localStorage)

## Next Steps After Fix

1. Clear all browser storage
2. Restart frontend dev server
3. Try login again
4. Should work correctly now
