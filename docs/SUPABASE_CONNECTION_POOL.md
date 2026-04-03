# Supabase Connection Pool Configuration

## Overview
For 50 concurrent players, you should increase the Supabase connection pool from the default 15 to 25-30 connections.

## How to Increase Connection Pool in Supabase

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open Database Settings**
   - Click on "Database" in the left sidebar
   - Go to "Connection Pooling" tab

3. **Configure Pool Size**
   - **Pool Mode**: Transaction (recommended for this app)
   - **Pool Size**: Change from 15 to **30**
   - **Default Pool Size**: 30
   - Click "Save"

### Method 2: Connection String Parameter

If using direct connection string, add pooling parameters:

```
postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true&pool_size=30
```

### Method 3: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Update pooler config (requires Pro plan)
supabase db pooler update --pool-size 30
```

## Connection Pool Settings Explained

### Pool Size
- **Default**: 15 connections
- **Recommended for 50 players**: 25-30 connections
- **Formula**: (concurrent_users × 0.5) + buffer
- **Why**: Each API request may hold a connection briefly

### Pool Mode Options

**Transaction Mode** (Recommended for this app)
- Connection held only during transaction
- Most efficient for stateless APIs
- Supports most SQL features
- ✅ Use this

**Session Mode**
- Connection held for entire session
- Required for prepared statements
- Less efficient
- ❌ Not needed for this app

## Verification

After changing pool size, verify it's working:

```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;

-- Check pool settings (if using pgbouncer)
SHOW POOLS;
```

## Free Tier Limitations

**Supabase Free Tier:**
- Max connections: 60 (database level)
- Default pool: 15
- Can increase pool to 30 without issues
- ✅ Sufficient for 50 players

**If you need more:**
- Upgrade to Pro plan ($25/month)
- Get 120 max connections
- Better performance
- Priority support

## Backend Configuration

The Go backend doesn't need changes - it uses Supabase's connection pooling automatically through the API.

However, if you want to configure it explicitly:

```go
// In services/team_service.go or config
// Supabase client handles pooling automatically
// No additional configuration needed
```

## Monitoring

### Check Connection Usage

In Supabase Dashboard:
1. Go to "Database" → "Connection Pooling"
2. View "Active Connections" graph
3. Monitor during peak usage

### Alerts

Set up alerts if connections exceed 80%:
1. Dashboard → "Database" → "Monitoring"
2. Set alert threshold: 24 connections (80% of 30)
3. Get notified before hitting limit

## Performance Impact

**Before (15 connections):**
- 50 players might experience occasional delays
- Some requests queue waiting for connection
- Response time: 100-500ms

**After (30 connections):**
- All 50 players get immediate connections
- No queuing
- Response time: 50-100ms
- ✅ Smooth experience

## Cost

**Connection pool increase:**
- Free tier: No cost (up to 60 connections)
- Pro tier: Included in $25/month

## Troubleshooting

### "Too many connections" error

**Solution 1**: Increase pool size (as above)

**Solution 2**: Check for connection leaks
```go
// Ensure all queries close properly
defer rows.Close()
```

**Solution 3**: Reduce connection hold time
- Use transactions efficiently
- Don't hold connections during long operations

### Slow queries

**Solution**: Add indexes (already done in supabase.sql)
```sql
CREATE INDEX IF NOT EXISTS idx_teams_current_level ON teams(current_level);
CREATE INDEX IF NOT EXISTS idx_team_progress_team_level ON team_progress(team_id, level);
```

## Summary

**For 50 concurrent players:**
1. ✅ Increase Supabase pool size to 30
2. ✅ Use Transaction mode
3. ✅ Indexes already added
4. ✅ Monitor during event
5. ✅ Free tier is sufficient

**Steps:**
1. Go to Supabase Dashboard
2. Database → Connection Pooling
3. Set Pool Size to 30
4. Save
5. Done!
