# Scrunch & Create — TODO / Backlog

> Pending work items organized by priority and milestone.  
> Updated: 2026-06-19

---

## 🟢 Completed Milestone 2: Clean Architecture Refactoring (2026-06-19)

- [x] Restructured entry files and sheets under `/src/app/`
- [x] Grouped global configurations, utility scripts, and variables under `/src/shared/`
- [x] Divided state containers, hooks, and views into modular slices under `/src/features/` (cart, products, wishlist)
- [x] Standardized UI directory co-location (renamed components to `index.jsx` inside folders alongside `.module.css` files)
- [x] Resolved variant product ID matching bug in mock database (`resolveProductById` in `api.js`)
- [x] Refactored relative imports globally across files
- [x] Verified zero console warnings and clean Vite bundles

---

## 🔴 Critical (Milestone 1 - Security)

- [x] Remove `.env` from git tracking
- [x] Remind project owner to rotate Cloudinary API secret
- [x] Add warning comment to plaintext password storage in `api.js`
- [x] Add input sanitization to Checkout form submission

---

## 🟠 High (Milestone 2 & 3 - Bug Fixes & UX)

- [x] Remove 7 unused npm dependencies (axios, jwt-decode, passport, etc.)
- [x] Delete dead `config/pricingConfig.js`
- [x] Delete dead `WhyChooseSection.jsx` + CSS module
- [x] Delete duplicate `components/FilterSidebar.jsx` (top-level)
- [x] Move `CartContext.jsx` from `components/` to `context/`
- [x] Clean up stale root files (events.json, gh_events.json, logs)
- [x] Archive `REBUILD_SPECIFICATION.md`, `findings.md`, `who-we-are.md` to `docs/archive/`
- [x] Fix WhatsApp message totals (use stored order data, not recalculated)
- [x] Add 404 catch-all route + NotFound page
- [x] Add SEO meta tags to `index.html`
- [x] Consolidate delivery fee to single source of truth

---

## 🟡 Medium (Milestone 3 & 4 - Performance & Code Quality)

- [x] Add product loading skeleton states
- [x] Add React Error Boundary component
- [x] Fix color lookup performance (`.includes()` → `.has()`)
- [x] Standardize API imports (all via `services/api.js`)
- [x] Improve coupon UX: show "already free shipping" message
- [x] Remove unnecessary `import React` statements

---

## 🟢 Low (Milestone 4 - UX Polish)

- [x] Replace `Math.random() - 0.5` shuffle with Fisher-Yates
- [x] Add eslint-disable explanation comments
- [x] Add `aria-label` to mobile nav overlay
- [x] Add proper favicon set + Apple touch icon
- [x] Consider splitting `ProductCard.jsx` (Kept unified for code coupling reasons)

---

## Future Considerations (Not in Current Scope)

- [ ] Backend integration (Supabase / Render)
- [ ] Payment gateway integration (Razorpay)
- [ ] Product inventory/stock management
- [ ] Order tracking system
- [ ] Analytics/tracking (Google Analytics, Meta Pixel)
- [ ] PWA manifest + service worker
- [ ] Per-page SEO with React Helmet
- [ ] Image lazy loading with Intersection Observer
- [ ] i18n support (Hindi)
- [ ] Admin panel for product/order management
