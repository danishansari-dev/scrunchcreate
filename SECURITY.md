# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Scrunch & Create, please report it responsibly. Do not open a public GitHub issue for security vulnerabilities.

1. Email a detailed report to [22bds039@iiitdwd.ac.in](mailto:22bds039@iiitdwd.ac.in).
2. Use subject line `[SECURITY] Scrunch & Create - <brief description>`.
3. Include reproduction steps, impact, and a suggested fix if you have one.

## Response Timeline

| Action | Timeframe |
| --- | --- |
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix deployed, if confirmed | Within 14 business days |

## Current Security Architecture

Scrunch & Create uses Supabase as the canonical backend. There is no active Render, Express, Passport, JWT-server, or MongoDB backend in the current production architecture.

### Authentication

- Supabase Auth handles user registration, login, logout, session refresh, and credential storage.
- The frontend consumes Supabase sessions through `src/features/auth/context/AuthContext.jsx`.
- Auth-related exports in `src/services/api.js` delegate to Supabase Auth.

### Authorization

- Supabase Row Level Security protects persisted user data.
- Cart and wishlist rows are scoped to `auth.uid() = user_id`.
- Orders are scoped by authenticated `user_id` and guest `session_id` fallback behavior.
- Admin writes require Supabase RLS policies backed by the `is_admin()` function.
- `VITE_ADMIN_EMAILS` only controls client-side admin UI visibility; it is not treated as a secret or a server-side authority.

### Data Storage

| Data | Primary storage | Fallback |
| --- | --- | --- |
| Products | Supabase `products`, `product_variants` | `src/data/products.json` |
| Orders | Supabase `orders` | localStorage |
| Cart | Supabase `cart_items` for logged-in users | localStorage guest cart |
| Wishlist | Supabase `wishlist_items` for logged-in users | localStorage guest wishlist |
| Auth | Supabase Auth | None |

### Secret Management

Sensitive credentials must stay out of git.

| Variable | Secret? | Location | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | No | Vercel/local `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No, but scoped by RLS | Vercel/local `.env` | Browser Supabase client key |
| `VITE_ADMIN_EMAILS` | No | Vercel/local `.env` | Client admin allowlist |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Local operator shell only | Seeding/admin scripts when needed |
| `CLOUDINARY_API_SECRET` | Yes | Local operator shell only | Media upload scripts |

Never expose `SUPABASE_SERVICE_ROLE_KEY` or Cloudinary secrets in browser code, committed files, screenshots, logs, or public issue text.

### Cloudinary Note

The historical audit found a committed Cloudinary API secret. The project owner should rotate that secret in Cloudinary and keep the replacement outside git.

## Supported Versions

This project follows a rolling release model on the `main` branch. Only the latest deployment is actively maintained.

| Branch | Status |
| --- | --- |
| `main` | Actively maintained |
| Feature branches | Merged and deleted after review |
| Legacy Render/Mongo deployment | Not active |

## Scope

### In Scope

- Supabase Auth and session handling
- Supabase RLS policies
- Product, order, cart, wishlist, and admin data access
- Cross-site scripting or injection risks in frontend flows
- Environment variable or credential exposure
- WhatsApp checkout data formatting issues that leak or corrupt order data

### Out of Scope

- Denial-of-service attacks
- Social engineering
- Vulnerabilities in third-party platforms such as Vercel, Supabase, or Cloudinary
- Findings that require physical access
- Automated scanner output without a demonstrated exploit
