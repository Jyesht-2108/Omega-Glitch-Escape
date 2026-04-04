# Vercel 404 Error Fix

## The Problem

When accessing routes like `/admin` on Vercel, you get a 404 error. This happens because:

1. **React Router uses client-side routing**
2. **Vercel tries to find a file at `/admin`**
3. **No file exists, so it returns 404**

## The Solution

Tell Vercel to always serve `index.html` for all routes, letting React Router handle the routing.

## Files Created

### 1. `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel:
- For ANY route (`(.*)`)
- Serve the `index.html` file
- Let React Router handle the routing

### 2. `frontend/public/_redirects` (Backup)
```
/*    /index.html   200
```

Alternative configuration format.

## How It Works

### Before (404 Error)
```
User visits: https://your-app.vercel.app/admin
Vercel looks for: /admin file or /admin/index.html
Not found: Returns 404
```

### After (Works)
```
User visits: https://your-app.vercel.app/admin
Vercel rewrites to: /index.html
React loads: index.html
React Router: Sees /admin route and loads AdminLogin component
```

## Deploy the Fix

### Step 1: Commit the new files
```bash
git add frontend/vercel.json frontend/public/_redirects
git commit -m "Fix Vercel 404 routing for React Router"
git push origin main
```

### Step 2: Redeploy to Vercel
```bash
cd frontend
vercel --prod
```

Or wait for auto-deploy if connected to GitHub.

### Step 3: Test
Visit these URLs and verify they work:
- `https://your-app.vercel.app/` ✅
- `https://your-app.vercel.app/admin` ✅
- `https://your-app.vercel.app/level/1` ✅
- `https://your-app.vercel.app/intro` ✅

## Common Issues

### Issue 1: Still getting 404 after deploy

**Solution**: Clear Vercel cache
1. Go to Vercel Dashboard
2. Click on your project
3. Go to Settings → General
4. Scroll to "Build & Development Settings"
5. Click "Redeploy" and check "Use existing Build Cache" = OFF

### Issue 2: Works on homepage but 404 on refresh

**Solution**: This is exactly what `vercel.json` fixes. Make sure:
1. File is in `frontend/` directory (not root)
2. File is committed to git
3. Deployment includes the file

### Issue 3: Environment variables not working

**Solution**: Check Vercel Dashboard
1. Settings → Environment Variables
2. Make sure `VITE_API_URL` is set
3. Redeploy after adding variables

## Verification Checklist

After deploying:

- [ ] `vercel.json` exists in `frontend/` directory
- [ ] File is committed to git
- [ ] Deployed to Vercel
- [ ] Can access `/admin` without 404
- [ ] Can refresh on `/admin` without 404
- [ ] Can access `/level/1` without 404
- [ ] React Router navigation works
- [ ] Browser back/forward buttons work

## Why This Happens

### Single Page Applications (SPA)
React apps are SPAs - they have ONE HTML file (`index.html`) and JavaScript handles all routing.

### Server vs Client Routing
- **Server routing**: Server looks for files (Vercel default)
- **Client routing**: JavaScript handles routes (React Router)

### The Mismatch
Without configuration, Vercel uses server routing and can't find React Router's client-side routes.

## Alternative Solutions

### Option 1: vercel.json (Recommended) ✅
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

### Option 2: _redirects file
```
/*    /index.html   200
```

### Option 3: Hash Router (Not Recommended)
Change React Router to use hash routing (`/#/admin`). This works but looks ugly.

## Testing Locally

The issue only happens on Vercel, not locally because:
- Vite dev server handles SPA routing automatically
- Vercel production doesn't (without config)

To test locally:
```bash
npm run build
npm run preview
```

Then try accessing `/admin` directly.

## Framework-Specific Notes

### Vite (Your Setup)
- Uses `index.html` as entry point
- Needs `vercel.json` for Vercel deployment
- Works automatically with Vite preview server

### Create React App
- Similar issue
- Same solution with `vercel.json`

### Next.js
- No issue (has built-in routing)
- Vercel handles it automatically

## Quick Fix Summary

1. **Create** `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {"source": "/(.*)", "destination": "/index.html"}
     ]
   }
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Test**: Visit `/admin` - should work!

## Additional Resources

- [Vercel Rewrites Documentation](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [React Router Deployment Guide](https://reactrouter.com/en/main/guides/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Status**: ✅ FIXED

The `vercel.json` file will fix all 404 routing issues on Vercel!
