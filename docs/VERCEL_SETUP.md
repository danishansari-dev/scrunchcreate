# Vercel Environment Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring the `VITE_API_URL` environment variable in Vercel to fix the blank page issue in production.

**Important**: `VITE_API_URL` is a **build-time** environment variable. This means:
- The value is embedded into your application during the build process
- Changes to this variable require a **full redeployment** to take effect
- Simply updating the variable without redeploying will not fix the issue

## Prerequisites

- Access to the Vercel dashboard for the scrunchcreate project
- Backend API deployed and accessible at `https://scrunchcreate.onrender.com/api`

## Step-by-Step Configuration

### Step 1: Access Vercel Project Settings

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: **scrunchcreate**
3. Click on the **Settings** tab in the top navigation

### Step 2: Navigate to Environment Variables

1. In the Settings sidebar, click on **Environment Variables**
2. You should see a page titled "Environment Variables" with an input form

### Step 3: Add VITE_API_URL Variable

1. In the **Key** field, enter: `VITE_API_URL`
2. In the **Value** field, enter: `https://scrunchcreate.onrender.com/api`
3. Select the environments where this variable should be available:
   - ✅ **Production** (required)
   - ✅ **Preview** (recommended)
   - ✅ **Development** (recommended)
4. Click **Save** button

**Screenshot Reference**: You should see a form similar to this:
```
┌─────────────────────────────────────────────────┐
│ Key:   VITE_API_URL                             │
│ Value: https://scrunchcreate.onrender.com/api  │
│                                                 │
│ Environments:                                   │
│ ☑ Production  ☑ Preview  ☑ Development         │
│                                                 │
│ [Save]                                          │
└─────────────────────────────────────────────────┘
```

### Step 4: Verify Variable is Saved

1. After saving, you should see the variable listed in the Environment Variables table
2. The table should show:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://scrunchcreate.onrender.com/api` (may be partially hidden)
   - **Environments**: Production, Preview, Development

### Step 5: Redeploy the Application

**Option A: Redeploy from Vercel Dashboard**

1. Navigate to the **Deployments** tab
2. Find the most recent deployment
3. Click the three-dot menu (⋯) on the right side
4. Select **Redeploy**
5. Confirm the redeployment

**Option B: Trigger Auto-Deploy via Git**

1. Make a small change to your repository (e.g., update README.md)
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Trigger redeploy for VITE_API_URL configuration"
   git push origin main
   ```
3. Vercel will automatically detect the push and start a new deployment

### Step 6: Monitor the Build Process

1. Go to the **Deployments** tab
2. Click on the in-progress deployment to view build logs
3. Look for the Vite build step in the logs
4. **Verify** that `VITE_API_URL` appears in the build output:
   ```
   Building for production...
   VITE_API_URL: https://scrunchcreate.onrender.com/api
   ```
5. Wait for the build to complete successfully (green checkmark)

### Step 7: Verify Production Deployment

1. Once deployment is complete, visit: `https://scrunchcreate.vercel.app`
2. Open browser DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. **Verify** there are no errors like:
   - ❌ `Failed to fetch http://localhost:5000/api/auth/me`
   - ❌ `Network request failed`
5. Go to the **Network** tab
6. Refresh the page and **verify** API calls are made to:
   - ✅ `https://scrunchcreate.onrender.com/api/auth/me`
   - ✅ `https://scrunchcreate.onrender.com/api/products`
7. **Verify** the application renders correctly:
   - ✅ Navigation bar is visible
   - ✅ Content area displays products or homepage
   - ✅ Footer is visible
   - ✅ No blank white page

### Step 8: Test Authentication Flows

1. Test **Login**:
   - Click "Login" in the navigation
   - Enter valid credentials
   - Verify successful login and redirect
2. Test **Register**:
   - Click "Register" in the navigation
   - Fill out registration form
   - Verify successful registration
3. Test **Logout**:
   - Click "Logout" in the navigation
   - Verify successful logout

## Troubleshooting

### Issue: Blank Page Still Appears After Configuration

**Possible Causes**:
- Environment variable was not saved correctly
- Application was not redeployed after adding the variable
- Build cache is preventing the new variable from being used

**Solutions**:
1. **Verify the variable exists**:
   - Go to Settings → Environment Variables
   - Confirm `VITE_API_URL` is listed with the correct value
2. **Force a clean redeploy**:
   - Go to Deployments tab
   - Click the three-dot menu on the latest deployment
   - Select "Redeploy" and check "Use existing Build Cache" is OFF
3. **Check build logs**:
   - Open the deployment details
   - Verify `VITE_API_URL` appears in the build output
   - Look for any build errors or warnings

### Issue: Network Errors Pointing to localhost:5000

**Possible Causes**:
- The application was not redeployed after adding `VITE_API_URL`
- The variable was added only to Preview/Development, not Production
- Build cache is serving an old version

**Solutions**:
1. **Verify environment scope**:
   - Go to Settings → Environment Variables
   - Confirm `VITE_API_URL` has "Production" checked
2. **Redeploy the application**:
   - Follow Step 5 above to trigger a new deployment
3. **Clear browser cache**:
   - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
   - Or open in incognito/private browsing mode

### Issue: API Connection Errors (500, 502, 503)

**Possible Causes**:
- Backend API at `https://scrunchcreate.onrender.com/api` is down or unreachable
- Incorrect backend URL in `VITE_API_URL`
- CORS configuration issue on the backend

**Solutions**:
1. **Verify backend is running**:
   - Open `https://scrunchcreate.onrender.com/api/health` in browser
   - Should return a 200 OK response
2. **Check backend logs**:
   - Log in to Render dashboard
   - Check the backend service logs for errors
3. **Verify CORS configuration**:
   - Backend must allow requests from `https://scrunchcreate.vercel.app`
   - Check backend CORS settings in `backend/src/app.js`

### Issue: Build Fails After Adding Variable

**Possible Causes**:
- Syntax error in the environment variable value
- Build process has other unrelated errors

**Solutions**:
1. **Check variable syntax**:
   - Ensure no trailing spaces in the value
   - Ensure the URL is valid: `https://scrunchcreate.onrender.com/api`
2. **Review build logs**:
   - Open the failed deployment
   - Read the error messages carefully
   - Fix any code issues unrelated to the environment variable

## Understanding Build-Time vs Runtime Variables

### Build-Time Variables (VITE_*)

- **When they're used**: During the Vite build process
- **How they work**: Values are embedded directly into the JavaScript bundle
- **When changes take effect**: Only after a full rebuild and redeploy
- **Examples**: `VITE_API_URL`, `VITE_APP_TITLE`

**Important**: If you change a `VITE_*` variable, you MUST redeploy the application for the change to take effect.

### Runtime Variables

- **When they're used**: When the application is running in the browser or server
- **How they work**: Values are read from the environment at runtime
- **When changes take effect**: Immediately after updating (may require restart)
- **Examples**: `DATABASE_URL`, `JWT_SECRET` (backend only)

**Note**: Frontend applications deployed to Vercel cannot use runtime environment variables because they run in the browser, not on a server.

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Render Backend Deployment](https://render.com/docs)

## Quick Reference

| Variable | Value | Scope | Type |
|----------|-------|-------|------|
| `VITE_API_URL` | `https://scrunchcreate.onrender.com/api` | Production, Preview, Development | Build-time |

## Support

If you continue to experience issues after following this guide:
1. Check the browser console for specific error messages
2. Review the Vercel deployment logs for build errors
3. Verify the backend API is accessible and responding
4. Contact the development team with screenshots and error messages
