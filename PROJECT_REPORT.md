# ScrunchCreate — Cloud Architecture Project Report

> **Author:** Danish Ansari  
> **Date:** April 2026  
> **Repository:** [github.com/danishansari-dev/scrunchcreate](https://github.com/danishansari-dev/scrunchcreate)  
> **Frontend (Live):** [scrunchcreate.vercel.app](https://scrunchcreate.vercel.app)  
> **Backend API (Live):** [scrunchcreate.onrender.com/api](https://scrunchcreate.onrender.com/api)

---

## 1. Project Overview

**ScrunchCreate** is a production e-commerce platform for a boutique brand selling handmade scrunchies, hair bows, hair clips, gift hampers, and flower jewellery. The original application was a static React SPA hosted on Hostinger with no backend — product data lived in a JSON file, cart state existed only in the browser, and orders were dispatched via WhatsApp deep links.

### What Was Upgraded

| Aspect | Before (Static SPA) | After (Cloud Architecture) |
|---|---|---|
| **Backend** | None | Node.js + Express REST API on **Render** |
| **Database** | Local JSON file | **MongoDB Atlas** (154 products seeded) |
| **Media Storage** | Local image files in repo | **Cloudinary CDN** (WebP, globally cached) |
| **Authentication** | None | JWT + bcrypt with role-based access |
| **Cart** | Browser-only (Context API) | Server-side cart (in-memory, persistence planned) |
| **Orders** | WhatsApp redirect | Persisted order model with status tracking |
| **Frontend Hosting** | Hostinger file manager (FTP) | **Vercel** (auto-deploy on push) |
| **Backend Hosting** | None | **Render** (auto-deploy on push) |
| **CI/CD** | Manual FTP upload | **GitHub → Vercel + Render** auto-deploy pipeline |
| **Health Monitoring** | None | `/api/health` endpoint |

The upgrade converts a client-only storefront into a cloud-native full-stack application with user authentication, persistent orders, stock management, and admin CRUD — while preserving the original frontend's offline-fallback capability.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEVELOPER WORKSTATION                      │
│                                                                 │
│   git push origin main ────────────────────┐                    │
└────────────────────────────────────────────┼────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB (main branch)                        │
│                                                                 │
│   On push to main, two parallel deployments trigger:            │
│                                                                 │
│   ┌──────────────────────┐    ┌──────────────────────────┐     │
│   │  Vercel Integration  │    │  Render Integration      │     │
│   │  ────────────────    │    │  ────────────────────    │     │
│   │  Detects push,       │    │  Detects push,           │     │
│   │  runs: vite build    │    │  runs: npm start         │     │
│   │  Deploys to CDN      │    │  Deploys to container    │     │
│   └──────────┬───────────┘    └──────────┬───────────────┘     │
└──────────────┼───────────────────────────┼──────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│  VERCEL EDGE          │    │  RENDER MANAGED CONTAINER     │
│  (Frontend)           │    │  (Backend)                    │
│                       │    │                               │
│  React 19 + Vite 7    │    │  Node.js + Express            │
│  scrunchcreate.       │    │  scrunchcreate.               │
│  vercel.app           │    │  onrender.com                 │
│                       │    │                               │
│  Env:                 │    │  Env:                         │
│  VITE_API_URL =       │    │  MONGO_URI, JWT_SECRET,       │
│  .../api              │    │  CLIENT_URL, PORT=10000       │
└───────────┬───────────┘    └──────────┬────────────────────┘
            │ Axios + JWT Bearer         │ Mongoose
            └──────────┬────────────────┘
                       ▼
        ┌───────────────────────────┐
        │   MongoDB Atlas (Cloud)    │
        │   Cluster: ac-e3sk0r9      │
        │   Tier: M0 (Free)          │
        │                            │
        │   Collections:             │
        │     products (154 docs)    │
        │     users                  │
        │     orders                 │
        └───────────────────────────┘

        ┌───────────────────────────┐
        │   Cloudinary CDN           │
        │   Cloud: duu26sqog         │
        │                            │
        │   All product images       │
        │   WebP format, organized   │
        │   by category/style/color  │
        └───────────────────────────┘
```

---

## 3. Tech Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend framework** | React | 19.1.1 | Component-based SPA |
| **Build tool** | Vite | 7.1.2 | Development server, production bundling |
| **Routing** | React Router DOM | 7.8.1 | Client-side page navigation |
| **Animation** | Framer Motion | 12.23.12 | Page transitions, list animations |
| **State management** | React Context API | — | Cart, Wishlist, Auth global state |
| **HTTP client** | Axios | 1.7.9 | API communication with JWT interceptor |
| **Styling** | CSS Modules | — | Scoped, conflict-free component styles |
| **Backend runtime** | Node.js (Alpine) | 20.x | Server-side JavaScript execution |
| **API framework** | Express | 4.21.2 | REST API routing and middleware |
| **Database** | MongoDB Atlas | — | Cloud-managed document store |
| **ODM** | Mongoose | 8.9.5 | Schema validation, query building |
| **Authentication** | jsonwebtoken | 9.0.2 | Stateless JWT-based auth |
| **Password hashing** | bcryptjs | 2.4.3 | Salted password hashing (12 rounds) |
| **Error handling** | express-async-errors | 3.1.1 | Automatic async error forwarding |
| **Image CDN** | Cloudinary | — | WebP product images, global delivery |
| **Frontend hosting** | Vercel | — | Edge-deployed React SPA |
| **Backend hosting** | Render | — | Managed Node.js container |
| **Environment config** | dotenv | 16.4.7 | Runtime secret injection |

---

## 4. CI/CD Pipeline

Both Vercel and Render are connected directly to the GitHub repository via native integrations. On every `git push` to `main`, deployments happen automatically and in parallel.

### Deployment Flow

```
git push origin main
         │
         ├──► Vercel (automatic)
         │     1. Detects changes in repository
         │     2. Runs: npm install → vite build
         │     3. Deploys static bundle to Vercel Edge Network
         │     4. Live at: scrunchcreate.vercel.app
         │     5. Environment: VITE_API_URL configured in dashboard
         │
         └──► Render (automatic)
               1. Detects changes in /backend directory
               2. Runs: npm install → node server.js
               3. Deploys to managed container (port 10000)
               4. Live at: scrunchcreate.onrender.com
               5. Environment: MONGO_URI, JWT_SECRET, CLIENT_URL configured in dashboard
```

### Environment Variables

Documented `.env.example` files are provided for developer onboarding:
- **Frontend:** `.env.example` (repo root)
- **Backend:** `backend/.env.example`

| Variable | Platform | Purpose |
|---|---|---|
| `VITE_API_URL` | Vercel | Backend API base URL (baked at build time) |
| `MONGO_URI` | Render | MongoDB Atlas connection string |
| `JWT_SECRET` | Render | Token signing secret |
| `JWT_EXPIRES_IN` | Render | Token lifetime (e.g. `30d`) |
| `PORT` | Render | Server port (`10000` in production) |
| `NODE_ENV` | Render | Runtime mode (`production`) |
| `CLIENT_URL` | Render | CORS origin whitelist |
| `CLOUDINARY_CLOUD_NAME` | Render | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Render | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Render | Cloudinary API secret |

> **Note:** No secrets are committed to version control. All `.env` files are gitignored. Copy the `.env.example` files to `.env` and fill in your values. In production, environment variables are configured through platform dashboards.

---

## 5. API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/products` | ❌ | List all products (154 currently) |
| `GET` | `/api/products/:id` | ❌ | Get a single product by ID |
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT |
| `GET` | `/api/cart` | 🔐 JWT | Get current user's cart |
| `POST` | `/api/cart` | 🔐 JWT | Add item to cart |
| `PUT` | `/api/cart/:productId` | 🔐 JWT | Update item quantity |
| `DELETE` | `/api/cart/:productId` | 🔐 JWT | Remove item from cart |
| `DELETE` | `/api/cart` | 🔐 JWT | Clear entire cart |
| `POST` | `/api/orders` | 🔐 JWT | Place a new order |
| `GET` | `/api/orders/my` | 🔐 JWT | Get current user's orders |

---

## 6. Security Architecture

### 6.1 Authentication — JWT

- Stateless authentication using `jsonwebtoken` with configurable expiry (`JWT_EXPIRES_IN`, default `7d`).
- Tokens are signed with a server-side secret (`JWT_SECRET`) and never stored on the backend — the client holds the token in `localStorage` and attaches it as a `Bearer` header via an Axios request interceptor.
- The `protect` middleware verifies the token on every request, rejects expired/tampered tokens with `401`, and attaches the hydrated user document to `req.user`.
- Role-based authorization via the `authorize(...roles)` middleware restricts admin routes.

### 6.2 Password Storage — bcrypt

- Passwords are hashed with `bcryptjs` using **12 salt rounds** in a Mongoose `pre('save')` hook.
- The `password` field has `select: false` on the schema, ensuring it is excluded from all query results by default.
- Login explicitly uses `.select('+password')` to retrieve the hash only when needed for comparison.
- The registration response strips the password before sending the user object.

### 6.3 Credential Handling

| Credential | Storage | Accessed By |
|---|---|---|
| `MONGO_URI` | Render dashboard (encrypted) | Backend at runtime |
| `JWT_SECRET` | Render dashboard (encrypted) | Backend at runtime |
| `VITE_API_URL` | Vercel dashboard | Injected at build time |
| `CLOUDINARY_*` | Render dashboard | Backend scripts only |

- No secrets are committed to version control. `.env` files are gitignored.
- All environment variables are configured through platform-native dashboards with encryption at rest.

### 6.4 Additional Hardening

- **CORS whitelist:** Backend restricts `Access-Control-Allow-Origin` to `CLIENT_URL` (configurable).
- **Centralized error handler:** Production mode suppresses stack traces to prevent internal path/dependency leaks.
- **Mongoose validation:** All models enforce field-level constraints (required, min, max, enum, regex) before data reaches MongoDB.
- **express-async-errors:** Automatically catches unhandled rejections in async route handlers, preventing silent failures.

---

## 7. Frontend Resilience — Offline Fallback

The frontend API layer (`src/services/api.js`) implements a transparent fallback mechanism:

```
GET /api/products
       │
       ├── Success (154 products) ──► Cache in memory, render catalog
       │
       └── Failure (server down / empty) ──► Fallback to local JSON
                                              └── Console warns: "⚠️ OFFLINE/FALLBACK MODE"
                                              └── UI renders normally from local data
```

This ensures the product catalog is always visible, even when:
- The Render backend is cold-starting (~40s on free tier)
- The developer is working offline without a running server
- The database connection is temporarily unavailable

---

## 8. Database Schema

### Products Collection (154 documents)

```javascript
{
  _id: ObjectId,
  name: String,          // "Tulip Scrunchie — black"
  description: String,   // "Elegant Tulip Scrunchies. Color: black."
  price: Number,         // 69 (INR)
  category: String,      // enum: scrunchie | hairbow | hairclip | gifthamper | flowerjewellery
  stock: Number,         // default: 100
  images: [String],      // Array of Cloudinary WebP URLs
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,         // unique, lowercase
  password: String,      // bcrypt hash (select: false)
  role: String,          // enum: user | admin (default: user)
  createdAt: Date
}
```

### Orders Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,        // ref → User
  items: [{
    product: ObjectId,   // ref → Product
    name: String,        // snapshot at purchase time
    price: Number,       // snapshot at purchase time
    quantity: Number
  }],
  totalAmount: Number,
  status: String,        // enum: pending | processing | shipped | delivered | cancelled
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. Product Categories & Pricing

| Category | Example Styles | Price Range (₹) | Count |
|---|---|---|---|
| **Scrunchie** | Classic, Tulip, Tulip Sheer, Satin Mini, Satin Printed, Combo | 30 – 99 | ~65 |
| **Hairbow** | Satin, Satin Mini, Satin Princes, Satin Tulip, Scarf, Sheer Satin, Velvet, Jimmychoo, Printed Mini, Combo | 49 – 399 | ~75 |
| **Hairclip** | Rose | 99 | ~6 |
| **Gift Hamper** | Satin Hamper, General | 199 – 699 | ~15 |
| **Flower Jewellery** | Rose | 399 | ~1 |
| | | **Total:** | **154** |

---

## 10. Known Limitations & Planned Improvements

### 10.1 Cart — In-Memory Store → Persistent Storage

**Current state:** The cart is stored in a JavaScript `Map` inside the backend process. Cart data is lost on every container restart or deployment.

**Planned fix:** Migrate to a MongoDB `carts` collection (or Redis) for persistence across restarts.

### 10.2 Cold-Start Latency (Render Free Tier)

**Current state:** The backend on Render's free tier spins down after ~15 minutes of inactivity. First requests take ~40 seconds to cold-start.

**Planned fix:** Set up a cron ping service (e.g., UptimeRobot free tier) to keep the backend warm, or upgrade to Render's paid tier.

### 10.3 No Rate Limiting

**Current state:** No `express-rate-limit` on authentication routes — brute-force login attacks are possible.

**Planned fix:** Add rate limiting middleware to `/api/auth/login` and `/api/auth/register`.

### 10.4 No HTTP Security Headers

**Current state:** Missing `helmet` middleware for HSTS, CSP, X-XSS-Protection headers.

**Planned fix:** Install and configure `helmet` as global middleware.

### 10.5 Other Limitations

| Limitation | Impact | Mitigation Path |
|---|---|---|
| No pagination on products endpoint | 137KB response for 154 products | Add `?page=&limit=` query params |
| N+1 query in cart controller | Slow cart reads as items grow | Use `Product.find({ _id: { $in: ids } })` |
| No code splitting in frontend | Larger initial bundle | Add `React.lazy()` for route components |
| No automated tests in pipeline | No test gate before deploy | Add Jest + Supertest as CI stage |
| No database backups | Atlas free tier has limited backup | Upgrade to M10+ or `mongodump` cron |
| Frontend fallback masks backend failures | Users may not notice API outages | Add visible offline indicator banner |

---

## 11. How to Run Locally

### Prerequisites

- **Node.js** ≥ 20.x
- **Git**
- A **MongoDB Atlas** cluster (free M0 tier is sufficient)

### Step-by-Step

**1. Clone the repository**

```bash
git clone https://github.com/danishansari-dev/scrunchcreate.git
cd scrunchcreate
```

**2. Configure backend environment**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your values. Every variable is documented
inside the example file. At minimum you need:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/scrunchcreate
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

The remaining variables (`PORT`, `NODE_ENV`, `CLIENT_URL`, `CLOUDINARY_*`) have
sane defaults in the example file.

**3. Configure frontend environment**

```bash
cp .env.example .env
```

The default value (`http://localhost:5000/api`) works out of the box for local development.

**4. Start the backend**

```bash
cd backend
npm install
npm run dev
```

**5. Start the frontend (new terminal)**

```bash
npm install
npm run dev
```

**6. Verify the stack is running**

```bash
# Health check
curl http://localhost:5000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Product catalog
curl http://localhost:5000/api/products
# Expected: {"success":true,"count":154,"data":[...]}
```

Open http://localhost:5173 in the browser. If the backend is down, the frontend automatically falls back to local JSON data and continues to render the product catalog.

---

## 12. Project Health Summary (Audit: April 8, 2026)

| Dimension | Score | Notes |
|---|---|---|
| **Deployment** | 9/10 | Both services live, auto-deploy on push to main |
| **Database** | 9/10 | 154 products seeded, all Cloudinary image URLs verified |
| **Security** | 7/10 | Solid auth (JWT + bcrypt), needs rate-limiting + Helmet |
| **Performance** | 6/10 | Cold-start latency, in-memory cart, no pagination |
| **Code Quality** | 8/10 | Well-documented, JSDoc, centralized error handling |
| **CI/CD** | 7/10 | Auto-deploy works via Vercel + Render, no lint/test gate |
| **Production Readiness** | 7/10 | Strong foundation, needs persistence & hardening |

### **Overall: 7.6/10 — Solid cloud-native MVP, ready for portfolio presentation**
