# Quick SSL Setup (30 Minutes)

## The Problem
```
HTTPS Frontend (Vercel) → HTTP Backend (EC2) = BLOCKED by browser
```

## The Solution
Add FREE SSL certificate to your EC2 backend.

## Step-by-Step Guide

### Step 1: Get a Free Domain (5 minutes)

**Option A: Freenom (Free)**
1. Go to https://www.freenom.com
2. Search for a domain name
3. Select a free extension (.tk, .ml, .ga, .cf, .gq)
4. Register (free for 12 months)

**Option B: Use Existing Domain**
If you have a domain, use a subdomain like `api.yourdomain.com`

### Step 2: Point Domain to EC2 (5 minutes)

1. **Get your EC2 IP**: `184.72.136.220`

2. **Add DNS A Record**:
   ```
   Type: A
   Name: api (or @ for root domain)
   Value: 184.72.136.220
   TTL: 300
   ```

3. **Wait for DNS propagation** (1-5 minutes)
   ```bash
   # Test if DNS is working
   ping api.yourdomain.com
   # Should show 184.72.136.220
   ```

### Step 3: Install SSL Certificate (10 minutes)

```bash
# SSH into your EC2
ssh -i your-key.pem ubuntu@184.72.136.220

# Update system
sudo apt update

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (automatic!)
sudo certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms (Y)
# - Share email? (N)
# - Redirect HTTP to HTTPS? (2 - Yes, recommended)

# Done! Certificate is installed and auto-renewal is set up
```

### Step 4: Verify SSL Works

```bash
# Test HTTPS endpoint
curl https://api.yourdomain.com/health

# Should return:
# {"status":"ok","message":"OMEGA Glitch Escape API is running"}
```

### Step 5: Update Vercel Environment Variable (5 minutes)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL` and update to:
   ```
   https://api.yourdomain.com/api
   ```
5. Click **Save**

### Step 6: Redeploy Frontend (5 minutes)

```bash
cd frontend
vercel --prod
```

Or push to GitHub if auto-deploy is enabled.

### Step 7: Test Everything

1. Open https://omega-glitch-escape.vercel.app
2. Open browser console (F12)
3. Try to login
4. **No more mixed content errors!** ✅

## Troubleshooting

### Issue: DNS not resolving
```bash
# Check DNS
nslookup api.yourdomain.com

# If not working, wait 5-10 minutes for propagation
```

### Issue: Certbot fails
```bash
# Make sure Nginx is running
sudo systemctl status nginx

# Make sure port 80 is open
sudo ufw allow 80
sudo ufw allow 443

# Try again
sudo certbot --nginx -d api.yourdomain.com
```

### Issue: Certificate works but app doesn't
```bash
# Check if backend is running
sudo systemctl status ctf-game

# Check Nginx config
sudo nginx -t

# Restart services
sudo systemctl restart ctf-game
sudo systemctl restart nginx
```

## Alternative: Use Free HTTPS Backend Service

If you don't want to deal with domains/SSL, deploy backend to a service with auto-HTTPS:

### Railway.app (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up
```

Railway gives you: `https://your-app.railway.app` (auto HTTPS!)

### Render.com
1. Go to https://render.com
2. Connect GitHub repo
3. Deploy backend
4. Get URL: `https://your-app.onrender.com`

### Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
cd backend
fly launch
```

## Cost Comparison

| Solution | Cost | Time | Difficulty |
|----------|------|------|------------|
| Free domain + Let's Encrypt | $0 | 30 min | Easy |
| Railway.app | $0 (free tier) | 10 min | Very Easy |
| Render.com | $0 (free tier) | 10 min | Very Easy |
| Paid domain + SSL | $12/year | 30 min | Easy |

## For Hackathon Demo

### Quick Fix (5 minutes)
Use Chrome with disabled security:
```bash
# Windows
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome"

# Mac
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome"

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome"
```

⚠️ **Only for demo** - judges need to use this too!

### Proper Fix (30 minutes)
Get free domain + SSL certificate (recommended)

## Summary

**Without Domain**: Can't get SSL, browsers block requests
**With Domain**: Free SSL with Let's Encrypt, everything works

**Recommendation**: Spend 30 minutes to get free domain + SSL for a professional setup.

---

**Need help?** The commands above are copy-paste ready!
