# CORS and HTTPS/HTTP Configuration Guide

## Current CORS Setup

### Configuration
**File**: `backend/main.go`

```go
app.Use(cors.New(cors.Config{
    AllowOrigins:     "*", // Allow all origins
    AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
    AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
    AllowCredentials: false,
}))
```

### What This Means

✅ **Allows ALL origins** (`*`)
- Any domain can access your API
- Perfect for hackathons and demos
- No CORS errors
- Works with any Vercel deployment URL

✅ **No credentials required**
- Simpler setup
- Works with wildcard origins
- Sufficient for JWT in headers

## CORS Options Comparison

### Option 1: Allow All Origins (Current) ✅ RECOMMENDED FOR HACKATHON

```go
AllowOrigins: "*"
AllowCredentials: false
```

**Pros**:
- ✅ No CORS issues ever
- ✅ Works with any Vercel URL
- ✅ Works with preview deployments
- ✅ Easy to test
- ✅ Perfect for hackathons/demos

**Cons**:
- ⚠️ Less secure (anyone can call your API)
- ⚠️ Not recommended for production with sensitive data

**Use When**:
- Hackathon or demo
- Public API
- Short-term deployment
- Testing phase

### Option 2: Specific Domain

```go
AllowOrigins: "https://your-app.vercel.app"
AllowCredentials: true
```

**Pros**:
- ✅ More secure
- ✅ Only your domain can access
- ✅ Can use credentials

**Cons**:
- ❌ Must update for each deployment
- ❌ Preview URLs won't work
- ❌ More configuration needed

**Use When**:
- Production deployment
- Sensitive data
- Long-term project

### Option 3: Multiple Domains

```go
AllowOrigins: "https://app.vercel.app,https://app-preview.vercel.app,http://localhost:8080"
AllowCredentials: true
```

**Pros**:
- ✅ Supports multiple environments
- ✅ More secure than wildcard
- ✅ Can use credentials

**Cons**:
- ❌ Must list all domains
- ❌ Vercel preview URLs change
- ❌ More maintenance

## HTTPS Frontend + HTTP Backend Issue

### The Problem

```
HTTPS Frontend (Vercel) → HTTP Backend (EC2)
https://your-app.vercel.app → http://your-ec2-ip:3000
```

### Issues This Causes

#### 1. Mixed Content Warnings ⚠️
Modern browsers block HTTP requests from HTTPS pages by default.

**Error in Console**:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure resource 'http://...'. 
This request has been blocked.
```

#### 2. Browser Security Policies 🔒
- Chrome: Blocks by default
- Firefox: Blocks by default
- Safari: Blocks by default
- Edge: Blocks by default

#### 3. Service Workers & PWA 📱
If you add PWA features later, they require HTTPS everywhere.

#### 4. Cookies & Storage 🍪
Some browser features don't work properly with mixed content.

### Solutions

#### Solution 1: Add HTTPS to Backend (RECOMMENDED) ✅

**Using Let's Encrypt (Free SSL)**:

```bash
# On EC2 instance
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

**Benefits**:
- ✅ No mixed content issues
- ✅ Secure communication
- ✅ Professional setup
- ✅ Free SSL certificate
- ✅ Works everywhere

**Requirements**:
- Domain name pointing to EC2
- Nginx configured
- Port 80 and 443 open

**After Setup**:
```env
# Frontend .env
VITE_API_URL=https://api.yourdomain.com/api
```

#### Solution 2: Use HTTP Frontend (NOT RECOMMENDED) ❌

Deploy frontend to HTTP instead of HTTPS.

**Why Not**:
- ❌ Vercel forces HTTPS
- ❌ Insecure
- ❌ Bad user experience
- ❌ SEO penalties
- ❌ Browser warnings

#### Solution 3: Proxy Through Vercel (COMPLEX) ⚠️

Use Vercel serverless functions as proxy.

**Why Not**:
- ⚠️ More complex
- ⚠️ Additional latency
- ⚠️ Vercel function limits
- ⚠️ More moving parts

## Recommended Setup for Hackathon

### Quick & Easy (Works Now)

**Backend CORS**:
```go
AllowOrigins: "*"
AllowCredentials: false
```

**Frontend .env**:
```env
VITE_API_URL=http://YOUR_EC2_IP/api
```

**Limitations**:
- ⚠️ Mixed content warnings in browser
- ⚠️ May not work in all browsers
- ⚠️ Not production-ready

### Better Setup (30 minutes more)

1. **Get a domain** (free options):
   - Freenom.com (free domains)
   - Use existing domain
   - Use subdomain

2. **Point domain to EC2**:
   ```
   A Record: api.yourdomain.com → YOUR_EC2_IP
   ```

3. **Install SSL on EC2**:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

4. **Update frontend .env**:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

5. **Update backend CORS** (optional):
   ```go
   AllowOrigins: "https://your-app.vercel.app"
   ```

**Benefits**:
- ✅ No mixed content issues
- ✅ Works in all browsers
- ✅ Professional setup
- ✅ Production-ready
- ✅ Secure

## Testing CORS

### Test 1: Check CORS Headers

```bash
curl -I -X OPTIONS http://YOUR_EC2_IP/api/health \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

**Expected Response**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization
```

### Test 2: Browser Console

Open your Vercel app and check console:

```javascript
fetch('http://YOUR_EC2_IP/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**If CORS works**: You'll see the response
**If CORS fails**: You'll see CORS error

### Test 3: Network Tab

1. Open DevTools → Network tab
2. Make a request to your API
3. Check response headers
4. Look for `Access-Control-Allow-Origin`

## Common CORS Errors

### Error 1: No 'Access-Control-Allow-Origin' header

**Error**:
```
Access to fetch at 'http://...' from origin 'https://...' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

**Fix**:
- Check backend CORS configuration
- Verify backend is running
- Check if origin is allowed

### Error 2: Credentials flag is true

**Error**:
```
The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
```

**Fix**:
```go
// Either use wildcard without credentials
AllowOrigins: "*"
AllowCredentials: false

// Or use specific origin with credentials
AllowOrigins: "https://your-app.vercel.app"
AllowCredentials: true
```

### Error 3: Method not allowed

**Error**:
```
Method PUT is not allowed by Access-Control-Allow-Methods in preflight response.
```

**Fix**:
```go
AllowMethods: "GET, POST, PUT, DELETE, OPTIONS"
```

## Production Checklist

### For Hackathon (Quick) ✅
- [x] CORS set to `AllowOrigins: "*"`
- [x] Backend running on EC2
- [x] Frontend deployed to Vercel
- [ ] Test API calls from frontend
- [ ] Accept mixed content warnings

### For Production (Better) ✅
- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] CORS set to specific origin
- [ ] HTTPS backend URL
- [ ] No mixed content warnings
- [ ] All browsers tested

## Environment Variables

### Backend (.env)
```env
# For hackathon (not used with AllowOrigins: "*")
FRONTEND_URL=https://your-app.vercel.app

# For production (if using specific origin)
FRONTEND_URL=https://your-app.vercel.app,https://your-app-preview.vercel.app
```

### Frontend (.env.production)
```env
# Without SSL (hackathon)
VITE_API_URL=http://YOUR_EC2_IP/api

# With SSL (production)
VITE_API_URL=https://api.yourdomain.com/api
```

## Quick Decision Guide

### For Hackathon/Demo (Next 24-48 hours)
```
✅ Use: AllowOrigins: "*"
✅ Use: HTTP backend (http://EC2_IP)
⚠️ Accept: Mixed content warnings
⚠️ Accept: Less secure
✅ Benefit: Works immediately
✅ Benefit: No configuration needed
```

### For Production/Long-term
```
✅ Use: Specific origin
✅ Use: HTTPS backend (https://domain)
✅ Get: SSL certificate
✅ Get: Domain name
✅ Benefit: Secure
✅ Benefit: Professional
✅ Benefit: No browser warnings
```

## Summary

### Current Setup (Good for Hackathon)
- ✅ CORS allows all origins
- ✅ No CORS errors
- ✅ Works with any Vercel URL
- ⚠️ HTTP backend (mixed content warnings)
- ⚠️ Less secure

### Recommended Upgrade (30 min)
- ✅ Add SSL to backend
- ✅ Use HTTPS everywhere
- ✅ No mixed content issues
- ✅ Production-ready
- ✅ Secure

### The Choice
**For hackathon**: Current setup is fine, accept the warnings
**For production**: Add SSL certificate (30 minutes, free)

---

**Bottom Line**: Your current CORS setup is perfect for a hackathon. The HTTPS/HTTP issue will cause browser warnings but won't break functionality. For production, add SSL to your backend (easy with Let's Encrypt).
