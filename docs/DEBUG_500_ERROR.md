# Debug 500 Internal Server Error

## What's Happening

✅ **API works**: `http://184.72.136.220/api/health` returns 200 OK
❌ **Frontend fails**: `http://184.72.136.220/` returns 500 error

This means:
- Nginx is running
- Backend is working
- Frontend files are missing or Nginx can't access them

## Quick Fix Steps

### Step 1: Check Nginx Error Logs

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@184.72.136.220

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log
```

Look for errors like:
- `No such file or directory`
- `Permission denied`
- `Failed to open`

### Step 2: Check if Frontend is Built

```bash
# Check if dist folder exists
ls -la ~/Omega-Glitch-Escape/frontend/dist/

# Should show files like:
# index.html
# assets/
# etc.
```

**If folder doesn't exist or is empty**:
```bash
cd ~/Omega-Glitch-Escape/frontend
npm run build
```

### Step 3: Check Nginx Configuration

```bash
# View current Nginx config
sudo cat /etc/nginx/sites-available/ctf-game
```

Look for the `root` directive. It should point to your dist folder:
```nginx
root /home/ubuntu/Omega-Glitch-Escape/frontend/dist;
```

### Step 4: Fix Nginx Configuration

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/ctf-game
```

**Make sure it looks like this**:
```nginx
server {
    listen 80;
    server_name _;

    # IMPORTANT: Update this path to match your setup
    root /home/ubuntu/Omega-Glitch-Escape/frontend/dist;
    index index.html;

    # Frontend - Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Go server
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# Test configuration
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx
```

### Step 5: Check File Permissions

```bash
# Make sure Nginx can read the files
sudo chown -R ubuntu:ubuntu ~/Omega-Glitch-Escape
chmod -R 755 ~/Omega-Glitch-Escape/frontend/dist
```

### Step 6: Test Again

```bash
# From EC2
curl http://localhost/

# Should return HTML content
```

## Common Issues and Solutions

### Issue 1: Dist folder doesn't exist

**Solution**:
```bash
cd ~/Omega-Glitch-Escape/frontend
npm install
npm run build
```

### Issue 2: Wrong path in Nginx config

**Check your actual path**:
```bash
pwd
# Should show: /home/ubuntu

ls -la ~/Omega-Glitch-Escape/frontend/dist/
# Should show index.html and assets/
```

**Update Nginx config** with correct path:
```nginx
root /home/ubuntu/Omega-Glitch-Escape/frontend/dist;
```

### Issue 3: Permission denied

**Fix permissions**:
```bash
sudo chown -R www-data:www-data ~/Omega-Glitch-Escape/frontend/dist
# OR
sudo chmod -R 755 ~/Omega-Glitch-Escape/frontend/dist
```

### Issue 4: Nginx config syntax error

**Test config**:
```bash
sudo nginx -t
```

If errors, fix them and test again.

### Issue 5: Old Nginx config still active

**Remove old config and create new**:
```bash
# Remove old
sudo rm /etc/nginx/sites-enabled/ctf-game

# Create new symlink
sudo ln -s /etc/nginx/sites-available/ctf-game /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step-by-Step Checklist

Run these commands in order:

```bash
# 1. Check if frontend is built
ls -la ~/Omega-Glitch-Escape/frontend/dist/index.html

# 2. If not, build it
cd ~/Omega-Glitch-Escape/frontend
npm install
npm run build

# 3. Verify build succeeded
ls -la ~/Omega-Glitch-Escape/frontend/dist/

# 4. Check Nginx config
sudo cat /etc/nginx/sites-available/ctf-game | grep root

# 5. Update Nginx config if needed
sudo nano /etc/nginx/sites-available/ctf-game

# 6. Test Nginx config
sudo nginx -t

# 7. Reload Nginx
sudo systemctl reload nginx

# 8. Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log

# 9. Test locally
curl http://localhost/

# 10. Test externally
curl http://184.72.136.220/
```

## Quick Fix Script

Save this as `fix-frontend.sh`:

```bash
#!/bin/bash

echo "🔍 Checking frontend setup..."

# Check if dist exists
if [ ! -d ~/Omega-Glitch-Escape/frontend/dist ]; then
    echo "❌ Dist folder not found. Building..."
    cd ~/Omega-Glitch-Escape/frontend
    npm install
    npm run build
else
    echo "✅ Dist folder exists"
fi

# Fix permissions
echo "🔧 Fixing permissions..."
chmod -R 755 ~/Omega-Glitch-Escape/frontend/dist

# Test Nginx config
echo "🔍 Testing Nginx config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config OK"
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Done!"
else
    echo "❌ Nginx config has errors. Please fix manually."
fi

# Test
echo "🧪 Testing..."
curl -I http://localhost/
```

```bash
# Make executable and run
chmod +x fix-frontend.sh
./fix-frontend.sh
```

## What to Send Me

If still not working, send me the output of:

```bash
# 1. Check dist folder
ls -la ~/Omega-Glitch-Escape/frontend/dist/

# 2. Check Nginx config
sudo cat /etc/nginx/sites-available/ctf-game

# 3. Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# 4. Test Nginx config
sudo nginx -t
```

---

**Most likely issue**: Frontend not built or wrong path in Nginx config. Follow the checklist above!
