# Scrunch & Create — Changelog

> All notable changes to this project will be documented in this file.  
> Format: `[YYYY-MM-DD] Category: Description`

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
