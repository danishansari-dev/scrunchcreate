# Scrunch & Create — Implementation Plan

> **Created:** 2026-06-19  
> **Status:** Awaiting Approval  
> **Estimated effort:** 4-6 hours across 4 milestones

---

## Goal

Address all 28 identified issues from the audit report, prioritized by severity. Preserve existing behavior unless explicitly improving it. Each milestone is independently deployable.

---

## Milestone 1: Critical Security Fixes (30 min)

> **Priority:** 🔴 Critical — Must be done before any other work

### Changes

#### 1.1 Remove `.env` from Git Tracking
- **Action:** `git rm --cached .env` to untrack (file stays local)
- **Impact:** Prevents future commits of secrets
- **Note:** The Cloudinary API secret should be rotated by the project owner

#### 1.2 Remove Dead Auth Code / Plaintext Passwords
- **Files:** [api.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/services/api.js)
- **Action:** Keep `register()` and `login()` functions (they may be needed later) but add a warning comment about plaintext storage
- **Side effects:** None — auth is not used in the current UI

#### 1.3 Add Input Sanitization on Checkout Form
- **File:** [Checkout.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/pages/checkout/Checkout.jsx)
- **Action:** Trim and sanitize all form inputs before submission
- **Side effects:** None — defensive improvement

---

## Milestone 2: Dead Code & Dependency Cleanup (45 min)

> **Priority:** 🟠 High / 🟡 Medium — Reduces confusion, improves build

### Changes

#### 2.1 Remove Unused Dependencies
- **File:** [package.json](file:///c:/Users/daans/Desktop/scrunchcreate/package.json)
- **Remove:** `axios`, `jwt-decode`, `passport`, `passport-google-oauth20`, `compression`, `express-rate-limit`, `helmet`
- **Verify:** `npm run build` succeeds after removal

#### 2.2 Delete Dead Pricing Config
- **Delete:** [config/pricingConfig.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/config/pricingConfig.js)
- **Verify:** No imports reference this file

#### 2.3 Delete Dead WhyChooseSection
- **Delete:** `components/WhyChooseSection.jsx`, `components/WhyChooseSection.module.css`
- **Verify:** No imports reference these files

#### 2.4 Delete Duplicate FilterSidebar
- **File:** [components/FilterSidebar.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/FilterSidebar.jsx)
- **Verify:** Only `components/products/FilterSidebar.jsx` is imported by Products page
- **Delete:** The top-level `FilterSidebar.jsx` and `FilterSidebar.module.css`

#### 2.5 Clean Up Stale Root Files
- **Delete or move:** `events.json`, `gh_events.json`, `vite-dev.err.log`, `vite-dev.out.log`
- **Move:** `findings.md`, `who-we-are.md`, `REBUILD_SPECIFICATION.md` → `docs/archive/`

#### 2.6 Move CartContext to `context/`
- **Move:** `components/CartContext.jsx` → `context/CartContext.jsx`
- **Update imports:** `main.jsx`, `CartDrawer.jsx`, `NavBar.jsx`, all pages that use `useCart()`

---

## Milestone 3: Bug Fixes & UX Improvements (1.5 hrs)

> **Priority:** 🟠 High / 🟡 Medium — Fixes broken behavior and UX gaps

### Changes

#### 3.1 Fix WhatsApp Message Totals
- **File:** [whatsappUtils.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/whatsappUtils.js)
- **Action:** Use order's stored `couponDiscount`, `codFee`, `deliveryFee`, and `total` instead of recalculating
- **Side effects:** WhatsApp messages now show correct totals including discounts

#### 3.2 Add 404 Catch-All Route
- **New file:** `src/pages/NotFound.jsx` + `NotFound.module.css`
- **Modify:** [App.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/App.jsx) — add `<Route path="*">`
- **Side effects:** Unknown URLs now show a friendly 404 page

#### 3.3 Add SEO Meta Tags
- **File:** [index.html](file:///c:/Users/daans/Desktop/scrunchcreate/index.html)
- **Action:** Add meta description, Open Graph tags, Twitter card tags, Apple touch icon
- **Side effects:** Better search engine and social media presence

#### 3.4 Add Loading States
- **New file:** `src/components/ProductSkeleton.jsx` + `ProductSkeleton.module.css`
- **Modify:** [Products.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/pages/products/Products.jsx), [Home.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/pages/home/Home.jsx)
- **Action:** Show skeleton cards while products load
- **Side effects:** Better perceived performance

#### 3.5 Add Error Boundary
- **New file:** `src/components/ErrorBoundary.jsx`
- **Modify:** [Layout.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/Layout.jsx)
- **Action:** Wrap page content in error boundary with fallback UI
- **Side effects:** Prevents full app crash on component errors

#### 3.6 Fix Color Lookup Performance
- **File:** [colorNormalization.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/colorNormalization.js)
- **Action:** Replace `CANONICAL_COLORS.includes()` with `CANONICAL_COLOR_SET.has()`
- **Side effects:** O(n) → O(1) lookup; trivial but correct

---

## Milestone 4: Code Quality & Documentation (1 hr)

> **Priority:** 🟢 Low / 🟡 Medium — Maintainability improvements

### Changes

#### 4.1 Remove Unnecessary React Imports
- **Files:** All component files with `import React from 'react'` that don't use `React.*` directly
- **Side effects:** None — React 19 JSX transform handles this

#### 4.2 Standardize API Imports
- **Action:** Audit all files importing from `utils/getProducts.js` directly vs `services/api.js`
- **Ensure:** Consistent import patterns

#### 4.3 Add eslint-disable Explanations
- **Files:** CartContext, WishlistContext, ToastContext, Layout
- **Action:** Add `// Why: ...` comments next to `eslint-disable` directives

#### 4.4 Implement Proper Shuffle Utility
- **New file:** `src/utils/shuffle.js`
- **Modify:** CartContext, OrderSuccess to use Fisher-Yates shuffle
- **Side effects:** Better randomization for recommendations

#### 4.5 Update All Documentation
- **Action:** Ensure all `/docs/` files reflect final state

---

## Impacted Files Summary

| Milestone | Files Modified | Files Created | Files Deleted |
|-----------|---------------|---------------|---------------|
| M1 | 2 | 0 | 0 |
| M2 | 3 | 0 | 7+ |
| M3 | 5 | 5 | 0 |
| M4 | 10+ | 1 | 0 |

---

## Verification Plan

### After Each Milestone
1. `npm run build` — verify clean build
2. `npm run lint` — verify no new lint errors
3. Visual check of all routes in browser
4. Verify cart/checkout/order flow end-to-end

### Final Verification
- Test all 10 routes
- Test mobile responsive behavior
- Test cart → checkout → order success → WhatsApp flow
- Test coupon codes (WELCOME10, FESTIVE20, FLAT50, FREESHIP)
- Test pincode auto-fill (110001, 400001, 560001)
- Verify 404 page for unknown routes
- Check error boundary by intentionally triggering errors
- Confirm build output is deployable

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should the mock auth system (`register`/`login` in api.js) be removed entirely, or preserved for future backend integration?

> [!IMPORTANT]
> **Q2:** Is there a plan to re-introduce a backend (Supabase, Render, etc.)? This affects whether we should invest in cleaning up the mock API layer or replacing it.

> [!NOTE]
> **Q3:** Should the `REBUILD_SPECIFICATION.md` (103KB) be archived or deleted? It appears to be a legacy planning document.

> [!NOTE]
> **Q4:** The Cloudinary API secret needs to be rotated by the account owner. Can you confirm this has been done?
