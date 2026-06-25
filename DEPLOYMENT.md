# ScrunchCreate Deployment Guide

## Overview

ScrunchCreate is deployed as a Vite/React single-page app on Vercel and uses Supabase directly for products, orders, authentication, cart, wishlist, and admin data.

- **Frontend:** Vercel static hosting
- **Backend/data layer:** Supabase project APIs, Auth, Postgres, and Row Level Security
- **Fallback state:** localStorage for guest cart, guest wishlist, and offline checkout fallback

There is no active Render, Express, or MongoDB backend in the current architecture.

## Deployment Architecture

```text
Browser
  |
  | HTTPS
  v
Vercel
  - Serves the built React/Vite app
  - Embeds VITE_* variables at build time
  |
  | Supabase JS client
  v
Supabase
  - Auth sessions
  - products and product_variants
  - orders
  - cart_items and wishlist_items
  - RLS policies for user-owned and admin writes
```

## Required Vercel Environment Variables

Set these in the Vercel project under **Settings -> Environment Variables** for Production, Preview, and Development as needed.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL used by the browser client |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key used by the browser client under RLS |
| `VITE_ADMIN_EMAILS` | Required for admin UI | Comma-separated allowlist for client-side admin route checks |

`VITE_API_URL` is legacy-only and is not used by the current Supabase app flow.

## Supabase Setup

1. Create or open the Supabase project.
2. Apply migrations from `supabase/migrations/` in order.
3. Seed products and variants with `node scripts/seed-supabase.js` when catalog data changes.
4. Compile and apply admin RLS SQL after setting `VITE_ADMIN_EMAILS` locally:

```bash
node scripts/run-admin-migration.js
```

The script writes `scripts/admin-migration-compiled.sql`; paste that SQL into the Supabase SQL Editor.

## Vercel Deployment

1. Import the repository into Vercel.
2. Use the Vite preset.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Add the Supabase environment variables listed above.
6. Deploy.

Because Vite embeds `VITE_*` variables during build, redeploy after changing any Supabase or admin environment variable.

## Verification Checklist

Run local checks before shipping:

```bash
npm run lint
npm run test
npm run build
```

Then verify the deployed app:

- Homepage loads products from Supabase or local JSON fallback.
- Login/register uses Supabase Auth.
- Guest cart and wishlist work without signing in.
- Guest cart and wishlist merge after login.
- Checkout creates an order and redirects to order success.
- WhatsApp order message uses stored order totals.
- `/profile` shows authenticated user order history.
- `/admin` is visible only for allowlisted admins.
- Admin product/order mutations succeed only when Supabase RLS permits them.

## Troubleshooting

### Blank page or no products

- Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel.
- Redeploy after changing variables.
- Check browser console for Supabase configuration warnings.
- Confirm RLS policies allow public product reads.

### Admin page blocked

- Confirm the logged-in user email is included in `VITE_ADMIN_EMAILS`.
- Confirm the Supabase admin RLS function was compiled with the same email list.
- Re-run `node scripts/run-admin-migration.js` and apply the generated SQL if the allowlist changed.

### Orders fail to save

- Check Supabase `orders` table policies.
- Confirm the migration for `orders.user_id` and session fallback has been applied.
- The app falls back to localStorage when Supabase is unavailable, so inspect browser storage if no remote row appears.

### Cart or wishlist does not sync

- Confirm `cart_items` and `wishlist_items` migrations are applied.
- Confirm RLS allows `auth.uid() = user_id`.
- Test as both guest and logged-in user because the app intentionally uses different persistence paths.
