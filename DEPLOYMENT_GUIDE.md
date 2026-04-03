# Production Deployment Guide

Complete guide to deploy the CTF Game to production using AWS EC2 (backend) and Vercel (frontend).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (AWS EC2)](#backend-deployment-aws-ec2)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing & Verification](#testing--verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- AWS Account with EC2 access
- Vercel Account (free tier works)
- Supabase Project (with database already set up)
- Domain name (optional but recommended)

### Required Tools
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Vercel CLI
npm install -g vercel

# Verify installations
aws --version
vercel --version
```

### Supabase Setup
Ensure your Supabase database is configured:
1. Run migrations from `backend/database/supabase.sql`
2. Run admin migrations from `backend/database/admin_migration.sql`
3. Configure connection pooling (see `docs/SUPABASE_CONNECTION_POOL.md`)

---

## Backend Deployment (AWS EC2)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   - **Name**: `ctf-game-backend`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: `t3.medium` (2 vCPU, 4GB RAM)
   - **Key Pair**: Create new or use existing (save the .pem file)
   - **Storage**: 20GB gp3

3. Configure Security Group:
   ```
   Type        Protocol    Port    Source          Description
   SSH         TCP         22      Your IP         SSH access
   HTTP        TCP         80      0.0.0.0/0       HTTP traffic
   HTTPS       TCP         443     0.0.0.0/0       HTTPS traffic
   Custom TCP  TCP         3000    0.0.0.0/0       Go application
   ```

4. Launch and note the **Public IP address**

### Step 2: Connect to EC2

```bash
# SSH into instance (replace with your key and IP)
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Dependencies

```bash
# Install Go 1.21+
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Git
sudo apt install git -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y

# Verify
go version
git --version
nginx -v
```

### Step 4: Clone and Setup Backend

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/backend

# Create production .env file
nano .env
```

**Production `.env` configuration:**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here

# Server Configuration
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app

# Admin Configuration (CHANGE THESE!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password_here
```

**Important**: 
- Get Supabase credentials from: Supabase Dashboard → Settings → API
- Change the admin password to something secure
- Update FRONTEND_URL after deploying frontend

### Step 5: Build Backend

```bash
# Install Go dependencies
go mod download

# Build the application
go build -o ctf-game-server .

# Test run
./ctf-game-server
# Should see: "Server running on :3000"
# Press Ctrl+C to stop
```

### Step 6: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/ctf-game.service
```

**Service configuration:**
```ini
[Unit]
Description=CTF Game Backend Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/YOUR_REPO/backend
ExecStart=/home/ubuntu/YOUR_REPO/backend/ctf-game-server
Restart=always
RestartSec=5
Environment=PATH=/usr/local/go/bin:/usr/bin:/bin
EnvironmentFile=/home/ubuntu/YOUR_REPO/backend/.env

# Logging
StandardOutput=append:/var/log/ctf-game/app.log
StandardError=append:/var/log/ctf-game/error.log

[Install]
WantedBy=multi-user.target
```

```bash
# Create log directory
sudo mkdir -p /var/log/ctf-game
sudo chown ubuntu:ubuntu /var/log/ctf-game

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ctf-game
sudo systemctl start ctf-game

# Check status
sudo systemctl status ctf-game

# View logs
sudo journalctl -u ctf-game -f
```

### Step 7: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ctf-game
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Or your domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
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
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ctf-game /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### Step 8: Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Step 9: Test Backend

```bash
# Test locally
curl http://localhost:3000/health

# Test externally (from your computer)
curl http://YOUR_EC2_PUBLIC_IP/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-03T..."}
```

### Step 10: Setup SSL (Optional but Recommended)

If you have a domain:
```bash
# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**Update Nginx config to use your domain:**
```bash
sudo nano /etc/nginx/sites-available/ctf-game
# Change: server_name YOUR_EC2_PUBLIC_IP;
# To: server_name api.yourdomain.com;

sudo nginx -t
sudo systemctl reload nginx
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Environment

Navigate to your frontend directory locally:

```bash
cd frontend
```

Create/update `.env.production`:
```env
# Backend API URL (use your EC2 IP or domain)
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP/api
# OR if you have SSL:
# VITE_API_URL=https://api.yourdomain.com/api

# Auto-save interval (milliseconds)
VITE_AUTO_SAVE_INTERVAL=30000

# Anti-Cheat Configuration
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=3
```

### Step 2: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? Your Account
# ? Link to existing project? [y/N] n
# ? Project name? ctf-game-frontend
# ? In which directory is your code? ./
# ? Override settings? [y/N] n
```

### Step 3: Configure Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables for **Production**:
   ```
   Name: VITE_API_URL
   Value: http://YOUR_EC2_PUBLIC_IP/api
   
   Name: VITE_AUTO_SAVE_INTERVAL
   Value: 30000
   
   Name: VITE_ANTI_CHEAT_ENABLED
   Value: true
   
   Name: VITE_ANTI_CHEAT_MAX_STRIKES
   Value: 3
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

### Step 4: Note Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://your-project-name.vercel.app
```

Save this URL - you'll need it for the next step.

---

## Post-Deployment Configuration

### Step 1: Update Backend CORS

SSH back into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Edit backend .env
cd YOUR_REPO/backend
nano .env
```

Update the `FRONTEND_URL`:
```env
FRONTEND_URL=https://your-project-name.vercel.app
```

Restart the backend:
```bash
sudo systemctl restart ctf-game
sudo systemctl status ctf-game
```

### Step 2: Verify CORS

Test from your browser console on the Vercel URL:
```javascript
fetch('http://YOUR_EC2_PUBLIC_IP/health')
  .then(r => r.json())
  .then(console.log)
```

Should return the health check without CORS errors.

### Step 3: Test Full Flow

1. Open your Vercel URL: `https://your-project-name.vercel.app`
2. Try to login with a test team
3. Check browser console for errors
4. Verify API calls are working

---

## Testing & Verification

### Backend Health Check

```bash
# From EC2
curl http://localhost:3000/health

# From outside
curl http://YOUR_EC2_PUBLIC_IP/health
```

### Frontend Tests

1. **Login Test**: Try logging in with a team
2. **Puzzle Test**: Submit answers to puzzles
3. **Leaderboard Test**: Check if leaderboard updates
4. **Admin Test**: Login to admin panel at `/admin`
5. **Mobile Test**: Test on mobile devices

### Load Test (Optional)

```bash
# Install Apache Bench on EC2
sudo apt install apache2-utils

# Test with 50 concurrent users
ab -n 1000 -c 50 http://localhost:3000/health
```

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
sudo journalctl -u ctf-game -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/ctf-game/app.log
```

### Service Management

```bash
# Restart backend
sudo systemctl restart ctf-game

# Stop backend
sudo systemctl stop ctf-game

# Start backend
sudo systemctl start ctf-game

# Check status
sudo systemctl status ctf-game
```

### Update Application

```bash
# SSH into EC2
cd YOUR_REPO
git pull origin main

# Rebuild
cd backend
go build -o ctf-game-server .

# Restart service
sudo systemctl restart ctf-game
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

### Setup Monitoring Script

```bash
# Create monitor script
nano ~/monitor.sh
```

```bash
#!/bin/bash
URL="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Backend healthy"
else
    echo "$(date): Backend down (HTTP $RESPONSE)"
    sudo systemctl restart ctf-game
fi
```

```bash
# Make executable
chmod +x ~/monitor.sh

# Add to cron (every 5 minutes)
crontab -e
# Add: */5 * * * * /home/ubuntu/monitor.sh >> /var/log/ctf-game/monitor.log 2>&1
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
sudo journalctl -u ctf-game -n 50

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Check environment variables
sudo systemctl show ctf-game --property=Environment
```

### CORS Errors

1. Check backend `.env` has correct `FRONTEND_URL`
2. Restart backend: `sudo systemctl restart ctf-game`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Database Connection Issues

```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/teams?select=count"
```

### Frontend Build Errors

1. Check Vercel build logs in dashboard
2. Verify environment variables are set
3. Redeploy: `vercel --prod`

---

## Cost Estimation

### Monthly Costs (USD)

**AWS EC2 t3.medium:**
- Instance: ~$30/month
- Storage (20GB): ~$2/month
- Data transfer: ~$1-5/month
- **Total**: ~$33-37/month

**Vercel:**
- Free tier: $0 (sufficient for this project)

**Supabase:**
- Free tier: $0 (sufficient for 50 players)

**Total**: ~$33-37/month

---

## Quick Reference

### Important URLs
- Frontend: `https://your-project.vercel.app`
- Backend: `http://YOUR_EC2_PUBLIC_IP`
- Admin Panel: `https://your-project.vercel.app/admin`
- Health Check: `http://YOUR_EC2_PUBLIC_IP/health`

### Important Commands
```bash
# Backend service
sudo systemctl status ctf-game
sudo systemctl restart ctf-game

# View logs
sudo journalctl -u ctf-game -f

# Nginx
sudo systemctl reload nginx
sudo nginx -t

# Frontend
vercel --prod
vercel logs
```

### Emergency Contacts
- AWS Support: AWS Console → Support
- Vercel Support: Vercel Dashboard → Help
- Supabase Support: Supabase Dashboard → Support

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Configured firewall (UFW)
- [ ] SSL certificate installed (if using domain)
- [ ] Environment variables secured
- [ ] Security groups configured
- [ ] Regular backups scheduled
- [ ] Monitoring enabled
- [ ] Log rotation configured

---

You're all set! Your CTF game is now deployed and ready for production use. 🚀
