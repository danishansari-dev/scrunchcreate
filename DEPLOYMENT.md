# ScrunchCreate Deployment Guide

## Overview

ScrunchCreate uses a modern cloud deployment architecture with automatic deployments from GitHub:

- **Frontend**: Deployed to Vercel (static site hosting)
- **Backend**: Deployed to Render (Node.js API server)
- **Database**: MongoDB Atlas (cloud database)

Both frontend and backend automatically deploy when changes are pushed to the `main` branch on GitHub.

## Deployment Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│  Vercel (Frontend)                      │
│  https://scrunchcreate.vercel.app       │
│                                         │
│  - Static React application             │
│  - Built with Vite                      │
│  - VITE_API_URL embedded at build time  │
└──────┬──────────────────────────────────┘
       │
       │ API Calls
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│  Render (Backend)                       │
│  https://scrunchcreate.onrender.com     │
│                                         │
│  - Node.js/Express API server           │
│  - Runtime environment variables        │
│  - Authentication & business logic      │
└──────┬──────────────────────────────────┘
       │
       │ Database
       │ Queries
       ▼
┌─────────────────────────────────────────┐
│  MongoDB Atlas (Database)               │
│                                         │
│  - Cloud-hosted MongoDB                 │
│  - Stores users, products, orders       │
└─────────────────────────────────────────┘
```

### Connection Flow

1. **User accesses application**: Browser loads `https://scrunchcreate.vercel.app`
2. **Vercel serves frontend**: Static HTML, CSS, and JavaScript files are delivered
3. **Frontend makes API calls**: React app sends requests to `https://scrunchcreate.onrender.com/api`
4. **Backend processes requests**: Render server handles authentication, business logic, and database operations
5. **Database operations**: Backend queries MongoDB Atlas for data
6. **Response flows back**: Data flows back through backend → frontend → browser

### Environment Variable Flow

**Frontend (Vercel)**:
- Environment variables are set in Vercel Dashboard
- `VITE_*` variables are **build-time** variables
- Values are embedded into the JavaScript bundle during build
- Changes require a full redeployment to take effect

**Backend (Render)**:
- Environment variables are set in Render Dashboard
- Variables are **runtime** variables
- Values are read when the server starts
- Changes take effect after service restart (automatic)

## Frontend Deployment (Vercel)

### Initial Setup

1. **Connect GitHub Repository**:
   - Log in to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import the `scrunchcreate` repository from GitHub
   - Vercel will auto-detect the Vite configuration

2. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Configure Environment Variables** (see section below)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy the application
   - You'll receive a production URL: `https://scrunchcreate.vercel.app`

### Environment Variables Configuration

**Required Variables**:

| Variable | Value | Scope | Description |
|----------|-------|-------|-------------|
| `VITE_API_URL` | `https://scrunchcreate.onrender.com/api` | Production, Preview, Development | Backend API base URL |

**How to Add/Edit Variables**:

1. Navigate to your project in Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Click "Add New" or edit existing variable
4. Enter the key and value
5. Select environments: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**

**Important**: `VITE_API_URL` is a **build-time** variable. After adding or changing this variable, you MUST redeploy the application:

**Option A - Redeploy from Dashboard**:
1. Go to **Deployments** tab
2. Click the three-dot menu (⋯) on the latest deployment
3. Select **Redeploy**

**Option B - Trigger via Git**:
```bash
git commit --allow-empty -m "Trigger redeploy for env variable update"
git push origin main
```

### Auto-Deploy Workflow

Vercel automatically deploys when changes are pushed to GitHub:

```
Developer pushes to main branch
         ↓
GitHub webhook triggers Vercel
         ↓
Vercel pulls latest code
         ↓
Vercel runs: npm install
         ↓
Vercel runs: npm run build
  (VITE_API_URL is embedded here)
         ↓
Vercel deploys to production
         ↓
Live at: https://scrunchcreate.vercel.app
```

### Deployment Verification

After deployment, verify everything works:

1. **Access the application**: Visit `https://scrunchcreate.vercel.app`
2. **Check browser console** (F12 → Console tab):
   - ✅ No errors about `localhost:5000`
   - ✅ No "Failed to fetch" errors
3. **Check network requests** (F12 → Network tab):
   - ✅ API calls go to `https://scrunchcreate.onrender.com/api`
   - ✅ Requests return 200 OK or expected status codes
4. **Test functionality**:
   - ✅ Homepage loads with products
   - ✅ Navigation works
   - ✅ Login/Register flows work
   - ✅ Cart and checkout work

### Troubleshooting

#### Issue: Blank Page After Deployment

**Symptoms**: White screen, no content visible

**Possible Causes**:
- `VITE_API_URL` is not configured
- `VITE_API_URL` is set to `localhost:5000`
- Application was not redeployed after adding the variable

**Solutions**:
1. Verify `VITE_API_URL` exists in Settings → Environment Variables
2. Verify the value is `https://scrunchcreate.onrender.com/api`
3. Verify "Production" scope is checked
4. Redeploy the application (see above)
5. Check build logs for `VITE_API_URL` in the build output

#### Issue: Network Errors in Console

**Symptoms**: `Failed to fetch http://localhost:5000/api/...`

**Possible Causes**:
- Application was not redeployed after adding `VITE_API_URL`
- Build cache is serving an old version

**Solutions**:
1. Force a clean redeploy:
   - Deployments → Redeploy
   - Uncheck "Use existing Build Cache"
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Try incognito/private browsing mode

#### Issue: API Connection Errors (500, 502, 503)

**Symptoms**: API calls fail with server errors

**Possible Causes**:
- Backend is down or unreachable
- CORS configuration issue
- Backend URL is incorrect

**Solutions**:
1. Verify backend is running: Visit `https://scrunchcreate.onrender.com/api/health`
2. Check Render dashboard for backend status
3. Verify CORS allows `https://scrunchcreate.vercel.app` in backend `CLIENT_URL`
4. Check backend logs in Render dashboard

#### Issue: Build Failures

**Symptoms**: Deployment fails during build step

**Possible Causes**:
- Syntax errors in code
- Missing dependencies
- Build command errors

**Solutions**:
1. Review build logs in Vercel deployment details
2. Test build locally: `npm run build`
3. Fix any errors shown in the logs
4. Ensure all dependencies are in `package.json`

## Backend Deployment (Render)

### Initial Setup

1. **Connect GitHub Repository**:
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select the `scrunchcreate` repository
   - Render will detect the Node.js backend

2. **Configure Service Settings**:
   - Name: `scrunchcreate-backend`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Configure Environment Variables** (see section below)

4. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy the backend
   - You'll receive a production URL: `https://scrunchcreate.onrender.com`

### Environment Variables Configuration

**Required Variables**:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | Server port (Render uses 10000) | `10000` |
| `NODE_ENV` | Runtime mode | `production` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/scrunchcreate` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | JWT token expiration | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | `https://scrunchcreate.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your Cloudinary API secret |

**How to Add/Edit Variables**:

1. Navigate to your service in Render Dashboard
2. Go to **Environment** tab in the left sidebar
3. Click "Add Environment Variable"
4. Enter the key and value
5. Click **Save Changes**
6. Render will automatically restart the service

**Important**: Backend environment variables are **runtime** variables. Changes take effect immediately after the service restarts (automatic).

### Auto-Deploy Workflow

Render automatically deploys when changes are pushed to GitHub:

```
Developer pushes to main branch
         ↓
GitHub webhook triggers Render
         ↓
Render pulls latest code
         ↓
Render runs: npm install (in backend/)
         ↓
Render starts: node server.js
  (Environment variables loaded at runtime)
         ↓
Live at: https://scrunchcreate.onrender.com
```

### Backend URL for Frontend

The frontend must use this exact URL in `VITE_API_URL`:

```
https://scrunchcreate.onrender.com/api
```

**Note**: Include the `/api` suffix as the backend routes are prefixed with `/api`.

### Deployment Verification

After deployment, verify the backend is running:

1. **Check service status**: Render Dashboard → Service should show "Live"
2. **Test health endpoint**: Visit `https://scrunchcreate.onrender.com/api/health`
   - Should return: `{"status": "ok"}` or similar
3. **Check logs**: Render Dashboard → Logs tab
   - ✅ No startup errors
   - ✅ "Server running on port 10000" message
   - ✅ "MongoDB connected" message
4. **Test API endpoints**:
   - `GET /api/products` - Should return product list
   - `POST /api/auth/login` - Should accept login requests

### Troubleshooting

#### Issue: Service Won't Start

**Symptoms**: Service shows "Deploy failed" or keeps restarting

**Possible Causes**:
- Missing environment variables
- MongoDB connection failure
- Port configuration issue

**Solutions**:
1. Check logs for specific error messages
2. Verify all required environment variables are set
3. Test MongoDB connection string locally
4. Ensure `PORT` is set to `10000` (Render's default)
5. Verify start command is `node server.js`

#### Issue: MongoDB Connection Errors

**Symptoms**: "MongoNetworkError" or "Authentication failed" in logs

**Possible Causes**:
- Incorrect `MONGO_URI`
- MongoDB Atlas IP whitelist doesn't include Render
- Database user credentials are wrong

**Solutions**:
1. Verify `MONGO_URI` format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
2. In MongoDB Atlas, add `0.0.0.0/0` to IP whitelist (allow all IPs)
3. Verify database user exists and password is correct
4. Test connection string locally first

#### Issue: CORS Errors from Frontend

**Symptoms**: Frontend shows "CORS policy" errors in console

**Possible Causes**:
- `CLIENT_URL` is not set correctly
- CORS middleware is not configured properly

**Solutions**:
1. Verify `CLIENT_URL` is set to `https://scrunchcreate.vercel.app`
2. Check backend `src/app.js` for CORS configuration
3. Ensure CORS allows credentials: `credentials: true`
4. Restart the service after changing `CLIENT_URL`

#### Issue: API Returns 500 Errors

**Symptoms**: API endpoints return Internal Server Error

**Possible Causes**:
- Application code errors
- Missing environment variables
- Database query failures

**Solutions**:
1. Check Render logs for stack traces
2. Verify all environment variables are set
3. Test the same request locally
4. Check database connectivity

## Database Setup (MongoDB Atlas)

### Initial Setup

1. **Create MongoDB Atlas Account**:
   - Visit [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign up for a free account

2. **Create a Cluster**:
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select a cloud provider and region
   - Name your cluster (e.g., `scrunchcreate-cluster`)

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Grant "Read and write to any database" role

4. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - This allows Render to connect to your database

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `scrunchcreate`

6. **Add to Render**:
   - Paste the connection string as `MONGO_URI` in Render environment variables

### Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/scrunchcreate?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://scrunchuser:MySecurePassword123@cluster0.abc123.mongodb.net/scrunchcreate?retryWrites=true&w=majority
```

## Complete Deployment Checklist

### First-Time Deployment

- [ ] **MongoDB Atlas**:
  - [ ] Create cluster
  - [ ] Create database user
  - [ ] Configure network access (0.0.0.0/0)
  - [ ] Get connection string

- [ ] **Render (Backend)**:
  - [ ] Create web service from GitHub
  - [ ] Configure root directory: `backend`
  - [ ] Set start command: `node server.js`
  - [ ] Add all environment variables (see table above)
  - [ ] Deploy and verify service is "Live"
  - [ ] Test health endpoint

- [ ] **Vercel (Frontend)**:
  - [ ] Create project from GitHub
  - [ ] Configure build settings (Vite preset)
  - [ ] Add `VITE_API_URL` environment variable
  - [ ] Deploy and verify build succeeds
  - [ ] Test application in browser

- [ ] **Verification**:
  - [ ] Frontend loads without blank page
  - [ ] API calls go to correct backend URL
  - [ ] No console errors
  - [ ] Login/Register works
  - [ ] Products load correctly

### Updating After Code Changes

When you push code to the `main` branch:

1. **Automatic Deployments**:
   - GitHub triggers webhooks to Vercel and Render
   - Both services automatically pull, build, and deploy
   - No manual intervention needed

2. **Monitor Deployments**:
   - Check Vercel dashboard for frontend build status
   - Check Render dashboard for backend deploy status
   - Review logs if any failures occur

3. **Verify Changes**:
   - Test the live application
   - Check that new features work as expected
   - Monitor error logs for issues

### Updating Environment Variables

**Frontend (Vercel)**:
1. Update variable in Vercel Dashboard
2. **Must redeploy** for changes to take effect
3. Verify new value in build logs

**Backend (Render)**:
1. Update variable in Render Dashboard
2. Service automatically restarts
3. Changes take effect immediately

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

For detailed Vercel setup instructions, see: [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md)

If you encounter issues:
1. Check the troubleshooting sections above
2. Review deployment logs in Vercel/Render dashboards
3. Check browser console for frontend errors
4. Check Render logs for backend errors
5. Verify all environment variables are set correctly
