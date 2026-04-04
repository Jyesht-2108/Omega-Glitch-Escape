# Deploy Frontend + Backend on Same EC2 Server

## Overview
Deploy both frontend and backend on the same EC2 instance using HTTP. Perfect for hackathons and 1-day events.

**Benefits**:
- ✅ No mixed content errors (both HTTP)
- ✅ No domain needed
- ✅ No SSL certificate needed
- ✅ Simple setup
- ✅ Everything on one server

**Architecture**:
```
http://YOUR_EC2_IP:80 → Frontend (Nginx)
http://YOUR_EC2_IP/api → Backend (Go via Nginx proxy)
```

---

## Prerequisites

- EC2 instance running (t3.medium)
- SSH access to EC2
- Backend already deployed (from previous guide)
- Node.js installed on EC2

---

## Step 1: Install Node.js on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@184.72.136.220

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version   # Should show 9.x or higher
```

---

## Step 2: Clone and Build Frontend

```bash
# Navigate to home directory
cd ~

# If repo not cloned yet, clone it
# (Skip if already cloned for backend)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Navigate to frontend
cd YOUR_REPO/frontend

# Create production environment file
nano .env.production
```

**Add this content to `.env.production`**:
```env
# API URL - same server, different path
VITE_API_URL=/api

# Auto-save interval
VITE_AUTO_SAVE_INTERVAL=30000

# Anti-cheat
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=3
```

**Important**: Use `/api` (relative path) not `http://localhost:3000/api`

```bash
# Install dependencies
npm install

# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

---

## Step 3: Configure Nginx to Serve Frontend

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ctf-game
```

**Replace the entire file with this**:
```nginx
server {
    listen 80;
    server_name _;  # Accept any hostname

    # Root directory for frontend
    root /home/ubuntu/YOUR_REPO/frontend/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend - Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Go server
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

**Important**: Replace `YOUR_REPO` with your actual repository name!

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

---

## Step 4: Update Backend CORS

```bash
# Edit backend .env
cd ~/YOUR_REPO/backend
nano .env
```

**Update FRONTEND_URL** (though with CORS: "*" it doesn't matter):
```env
FRONTEND_URL=http://184.72.136.220
```

```bash
# Restart backend service
sudo systemctl restart ctf-game

# Check backend status
sudo systemctl status ctf-game
```

---

## Step 5: Configure EC2 Security Group

1. Go to **AWS Console** → **EC2** → **Security Groups**
2. Find your instance's security group
3. **Edit Inbound Rules**:
   ```
   Type        Protocol    Port    Source          Description
   SSH         TCP         22      Your IP         SSH access
   HTTP        TCP         80      0.0.0.0/0       Frontend + API
   Custom TCP  TCP         3000    127.0.0.1/32    Backend (localhost only)
   ```

**Note**: Port 3000 should only be accessible from localhost since Nginx proxies to it.

---

## Step 6: Test the Deployment

### Test Frontend
```bash
# From your computer
curl http://184.72.136.220/

# Should return HTML content
```

### Test Backend API
```bash
# Test health endpoint
curl http://184.72.136.220/health

# Should return:
# {"status":"ok","message":"OMEGA Glitch Escape API is running"}

# Test API endpoint
curl http://184.72.136.220/api/health

# Should return same response
```

### Test in Browser
1. Open: `http://184.72.136.220`
2. Should see your CTF game login page
3. Open browser console (F12)
4. Should see NO mixed content errors
5. Try to login - should work!

---

## Step 7: Update Frontend When Needed

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@184.72.136.220

# Navigate to frontend
cd ~/YOUR_REPO/frontend

# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Nginx automatically serves the new files
# No restart needed!
```

---

## Step 8: Setup Auto-Deploy Script (Optional)

```bash
# Create deploy script
nano ~/deploy-frontend.sh
```

**Add this content**:
```bash
#!/bin/bash

echo "🚀 Deploying Frontend..."

# Navigate to repo
cd ~/YOUR_REPO

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Navigate to frontend
cd frontend

# Install dependencies (if package.json changed)
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building frontend..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
    echo "🌐 Access at: http://184.72.136.220"
else
    echo "❌ Build failed!"
    exit 1
fi
```

```bash
# Make executable
chmod +x ~/deploy-frontend.sh

# Run it
~/deploy-frontend.sh
```

---

## Troubleshooting

### Issue 1: Frontend shows blank page

**Check Nginx logs**:
```bash
sudo tail -f /var/log/nginx/error.log
```

**Check if dist folder exists**:
```bash
ls -la ~/YOUR_REPO/frontend/dist/
```

**Rebuild frontend**:
```bash
cd ~/YOUR_REPO/frontend
npm run build
```

### Issue 2: API calls fail

**Check backend is running**:
```bash
sudo systemctl status ctf-game
```

**Check backend logs**:
```bash
sudo journalctl -u ctf-game -f
```

**Test backend directly**:
```bash
curl http://localhost:3000/health
```

### Issue 3: 404 on page refresh

**Check Nginx config has**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This is crucial for React Router!

### Issue 4: Changes not showing

**Clear browser cache**:
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux)
- Or: `Cmd + Shift + R` (Mac)

**Check file timestamps**:
```bash
ls -lt ~/YOUR_REPO/frontend/dist/
```

### Issue 5: Permission denied

**Fix permissions**:
```bash
sudo chown -R ubuntu:ubuntu ~/YOUR_REPO
chmod -R 755 ~/YOUR_REPO/frontend/dist
```

---

## Performance Optimization

### Enable Gzip Compression
Already included in Nginx config above.

### Enable Browser Caching
Add to Nginx config:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Optimize Build
```bash
# Build with optimizations
cd ~/YOUR_REPO/frontend
npm run build -- --mode production
```

---

## Monitoring

### Check Service Status
```bash
# Backend
sudo systemctl status ctf-game

# Nginx
sudo systemctl status nginx
```

### View Logs
```bash
# Backend logs
sudo journalctl -u ctf-game -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitor Resources
```bash
# Install htop
sudo apt install htop

# Monitor
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Backup Strategy

### Backup Script
```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup frontend dist
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz ~/YOUR_REPO/frontend/dist

# Backup backend
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz ~/YOUR_REPO/backend

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x ~/backup.sh
```

---

## Quick Reference

### Important URLs
- **Frontend**: `http://184.72.136.220`
- **Admin Panel**: `http://184.72.136.220/admin`
- **API Health**: `http://184.72.136.220/health`
- **API Endpoint**: `http://184.72.136.220/api/*`

### Important Paths
- **Frontend Build**: `~/YOUR_REPO/frontend/dist/`
- **Backend Binary**: `~/YOUR_REPO/backend/ctf-game-server`
- **Nginx Config**: `/etc/nginx/sites-available/ctf-game`
- **Backend Logs**: `/var/log/ctf-game/`

### Important Commands
```bash
# Restart backend
sudo systemctl restart ctf-game

# Reload Nginx
sudo systemctl reload nginx

# Rebuild frontend
cd ~/YOUR_REPO/frontend && npm run build

# View backend logs
sudo journalctl -u ctf-game -f

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Security Notes

### For 1-Day Event
Current setup is fine:
- ✅ HTTP is acceptable
- ✅ Firewall configured
- ✅ Backend not directly exposed
- ✅ CORS configured

### For Production
Consider:
- Add SSL certificate
- Use environment-specific configs
- Add rate limiting
- Enable fail2ban
- Regular security updates

---

## Cost

**Total Monthly Cost**: ~$33-37
- EC2 t3.medium: ~$30/month
- Storage: ~$2/month
- Data transfer: ~$1-5/month

**No additional costs** for:
- Vercel (not using)
- Domain (not needed)
- SSL (not needed for 1-day event)

---

## Final Checklist

- [ ] Node.js installed on EC2
- [ ] Frontend built successfully
- [ ] Nginx configured and reloaded
- [ ] Backend running
- [ ] Security group allows port 80
- [ ] Can access frontend at `http://YOUR_EC2_IP`
- [ ] Can access admin at `http://YOUR_EC2_IP/admin`
- [ ] API calls work (no CORS errors)
- [ ] No mixed content errors
- [ ] Login works
- [ ] Game functions properly

---

## Support

If you encounter issues:
1. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Check backend logs: `sudo journalctl -u ctf-game -f`
3. Test backend: `curl http://localhost:3000/health`
4. Test frontend: `curl http://YOUR_EC2_IP/`
5. Check services: `sudo systemctl status nginx ctf-game`

---

**You're all set!** Your CTF game is now fully deployed on EC2 with no mixed content issues. 🚀

Access it at: `http://184.72.136.220`
