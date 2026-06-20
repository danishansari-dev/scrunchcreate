# Scrunch & Create — Changelog

> All notable changes to this project will be documented in this file.  
> Format: `[YYYY-MM-DD] Category: Description`

---

## [2026-06-20] Phase 4 — Supabase Auth Integration

### User Authentication
- Substituted mock localStorage authentication with secure **Supabase Auth** client integration.
- Developed global `AuthContext` (`src/features/auth/context/AuthContext.jsx`) to handle session subscriptions, user profile state, and login/registration flows.
- Built a premium glassmorphic Log In / Register combined page (`src/pages/auth/AuthPage.jsx`) featuring floating input labels, eyeball password toggling, client-side validations, and visual shake animations on failure.

### Profile Dashboard & Order History
- Built a user dashboard (`src/pages/profile/ProfilePage.jsx`) showing account details and a detailed order history list retrieved from Supabase.
- Expandable order detail cards display ordered items with thumbnails, subtotal breakdowns, delivery rates, cod fees, applied coupons, and address info.
- Included secondary call-to-actions: WhatsApp order checkout retry for pending orders and direct WhatsApp support queries pre-populated with order IDs.

### Navigation Header & Checkout Autofill
- Integrated user initials circular avatars in desktop navbar (`src/components/NavBar/index.jsx`) and mobile drawers with hover dropdown menus.
- Pre-fills contact name and email fields on the Checkout page (`src/pages/checkout/Checkout.jsx`) automatically for authenticated users.

### Database Schema Updates
- Executed migration (`scripts/auth-migration.sql`) to add `user_id` referencing `auth.users(id)` in the `orders` table.
- Created `idx_orders_user_id` index and updated RLS SELECT policy to match orders by `user_id` or `session_id`.

### Code Cleanup & Merging
- Implemented automatic guest-to-logged-in cart merging (`mergeGuestCartIntoUserCart` in `api.js`) upon authentication.
- Resolved and verified production Vite build and ESLint checks.

---

## [2026-06-20] Phase 3 — Supabase Backend Integration

### New Backend Infrastructure
- Installed `@supabase/supabase-js` and created client singleton at `src/shared/config/supabase.js`
- Created database schema (`scripts/supabase-schema.sql`) with `products`, `product_variants`, and `orders` tables
- Created data seeding script (`scripts/seed-supabase.js`) — seeded 20 products + 154 variants
- All tables secured with Row Level Security (RLS) policies

### Products Migration
- Rewrote `src/shared/utils/getProducts.js` to fetch from Supabase with automatic fallback to local JSON
- Direct Supabase queries for `getProductBySlug()` and `getProductsByCategory()` for efficiency
- In-memory cache retained for performance; `invalidateProductCache()` available for refresh

### Orders Migration
- `placeOrder()` now inserts orders into Supabase `orders` table
- `getMyOrders()` queries Supabase by `session_id` (browser UUID)
- Introduced `getSessionId()` helper — generates persistent UUID in localStorage for guest tracking
- localStorage fallback if Supabase is unreachable

### Unchanged
- Cart remains in localStorage (no auth system yet)
- Wishlist remains in localStorage (self-contained)
- All page/component imports unchanged — zero breaking changes

---

## [2026-06-19] Phase 2 — Clean Architecture Migration

### Architecture Refactoring
- Relocated entry points (`App.jsx`, `App.css`, `index.css`, `main.jsx`) under `src/app/` and updated `index.html`.
- Formed feature modules under `src/features/`:
  - `cart/` — Context provider and co-located components (`CartDrawer/`, `CouponField/`, `PaymentMethodSelector/`).
  - `products/` — Co-located components (`ProductCard/`, `ProductList/`, `ProductReviews/`, `FilterSidebar/`, `ProductSearch/`, `ActiveFilters/`, etc.) and `useProductsFilter.js` hook.
  - `wishlist/` — Wishlist context.
- Grouped config, utils, and theme sheets under `src/shared/` (`shared/config/`, `shared/utils/`, `shared/theme/`).
- Enforced component co-location rules (renamed files to `index.jsx` inside component folders with corresponding module sheets).
- Successfully resolved relative imports globally across all JS, JSX, and CSS files.

### Bug Fixes
- **Variant ID resolution in placeOrder / getCart:** Fixed a pre-existing bug where choosing a product variant set a variant ID in the cart, causing `api.js` to fail finding the parent product. This resulted in empty order totals and missing WhatsApp link CTAs on the Order Success page. Introduced the `resolveProductById` helper to accurately map variant IDs back to parent products.

---

## [2026-06-19] Phase 1 — Senior Engineer Onboarding

### Documentation
- Created `/docs/PROJECT_OVERVIEW.md` — full architecture, module map, data flow
- Created `/docs/AUDIT_REPORT.md` — 28 issues identified (3 Critical, 7 High, 10 Medium, 8 Low)
- Created `/docs/IMPLEMENTATION_PLAN.md` — 4-milestone execution plan
- Created `/docs/CHANGELOG.md` — this file
- Created `/docs/DECISIONS.md` — technical decision log
- Created `/docs/TODO.md` — pending work backlog
- Created `/docs/TEST_REPORT.md` — validation results
- Created `/docs/HANDOVER.md` — developer onboarding guide

### Audit Findings
- Identified Cloudinary API secret exposed in `.env` (committed to git)
- Found plaintext password storage in mock auth system
- Discovered duplicate pricing engines (`pricingConfig.js` vs `pricing.js`)
- Found 7 unused npm dependencies still installed
- Identified WhatsApp message total calculation mismatch
- Found missing 404 route, SEO meta tags, loading states, error boundaries
