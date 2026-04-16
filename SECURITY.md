# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Scrunch & Create, please report it responsibly. **Do not open a public GitHub issue** for security vulnerabilities.

### How to Report

1. **Email:** Send a detailed report to [22bds039@iiitdwd.ac.in](mailto:22bds039@iiitdwd.ac.in)
2. **Subject line:** `[SECURITY] Scrunch & Create — <brief description>`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix deployed (if confirmed) | Within 14 business days |

You will be credited in the fix commit (unless you prefer to remain anonymous).

---

## Security Architecture

Scrunch & Create implements defense-in-depth across all layers of the cloud stack.

### Authentication

- **JWT-based stateless authentication** — tokens signed with `JWT_SECRET`, include expiration
- **Google OAuth 2.0** via Passport.js (`passport-google-oauth20`) — no passwords stored for OAuth users
- **Password hashing** with `bcrypt` (salt rounds = 10) for email/password accounts

### Rate Limiting

- **Authentication endpoints** — 20 requests per 15-minute window per IP
- **Proxy trust configured** — `app.set('trust proxy', 1)` ensures `express-rate-limit` reads real client IPs from `X-Forwarded-For`, not the PaaS load balancer IP
- Without this configuration, all users behind Render's reverse proxy would share a single rate limit counter

### Transport Security

- **HTTPS enforced** on both Vercel (frontend) and Render (backend) — automatic TLS certificates
- **HTTP → HTTPS redirect** handled by the platform layer
- **CORS** restricted to `CLIENT_URL` origin with credentials enabled

### Security Headers

The [`helmet`](https://helmetjs.github.io/) middleware applies the following HTTP response headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | Enforce HTTPS (HSTS) |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Block clickjacking via iframes |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `X-DNS-Prefetch-Control` | `off` | Disable DNS prefetching |
| `Referrer-Policy` | `no-referrer` | Prevent referrer leakage |

### Secret Management

All sensitive credentials are stored as **platform environment variables** — never committed to source code:

| Secret | Platform | Purpose |
|--------|----------|---------|
| `MONGODB_URI` | Render | MongoDB Atlas connection string |
| `JWT_SECRET` | Render | Token signing key |
| `GOOGLE_CLIENT_ID` | Render | OAuth 2.0 client identifier |
| `GOOGLE_CLIENT_SECRET` | Render | OAuth 2.0 client secret |
| `CLOUDINARY_*` | Render | Image upload API credentials |
| `VITE_API_URL` | Vercel | Backend API endpoint (non-secret) |

A `.env.example` file documents required variables without exposing values. The `.gitignore` excludes `.env` from version control.

### Database Security

- **MongoDB Atlas network access** — restricted to Render service IPs and development IPs
- **Authentication required** — all connections use credentials from `MONGODB_URI`
- **M0 cluster encryption** — data encrypted at rest and in transit by Atlas

---

## Supported Versions

This project follows a rolling release model on the `main` branch. Only the latest deployment at [scrunchcreate.vercel.app](https://scrunchcreate.vercel.app) is actively maintained.

| Branch | Status |
|--------|--------|
| `main` | ✅ Actively maintained |
| Feature branches | ❌ Not supported — merged and deleted |
| Legacy VPS deployment | ❌ Decommissioned |

---

## Scope

### In Scope

- Authentication and session management
- API endpoints (`/api/*`)
- Rate limiting bypass or misconfiguration
- Data exposure through API responses
- Cross-site scripting (XSS) or injection vulnerabilities
- Insecure direct object references (IDOR)
- Environment variable or credential exposure

### Out of Scope

- Denial-of-service (DoS/DDoS) attacks
- Social engineering
- Vulnerabilities in third-party services (Vercel, Render, MongoDB Atlas, Cloudinary)
- Issues requiring physical access to infrastructure
- Automated scanning results without a demonstrated exploit
