# Scrunch & Create — Audit Report

> **Audit date:** 2026-06-19  
> **Auditor:** Senior Engineer Onboarding  
> **Scope:** Full codebase review — code quality, security, performance, UX, technical debt

---

## Priority Legend

| Level | Description |
|-------|-------------|
| 🔴 **Critical** | Security vulnerabilities, data loss risk, production blockers |
| 🟠 **High** | Major functional issues, significant UX breaks, performance degradation |
| 🟡 **Medium** | Code quality issues, minor UX problems, maintenance burden |
| 🟢 **Low** | Nice-to-haves, cosmetic issues, minor optimizations |

---

## 🔴 Critical Issues

### C-1: Cloudinary API Secret Exposed in `.env` (Committed to Git)
**File:** [.env](file:///c:/Users/daans/Desktop/scrunchcreate/.env)  
**Problem:** The `.env` file contains `CLOUDINARY_API_SECRET=wMeZMOQFxZGT9i2jxhVaTQURiO8` and is checked into git. While `.env` is in `.gitignore`, the file was committed at some point and the secret is visible in git history.  
**Risk:** Attackers with repo access can abuse the Cloudinary account for uploads/deletions.  
**Fix:** Rotate the Cloudinary API secret immediately. Use `git filter-branch` or BFG Repo Cleaner to purge from history.

### C-2: Plaintext Password Storage in localStorage
**File:** [api.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/services/api.js#L181-L206)  
**Problem:** The `register()` function stores user passwords as plaintext in `localStorage` (`mock_users` key). The `login()` function compares passwords with `===`.  
**Risk:** XSS attacks can trivially extract all user credentials. Any browser extension can read localStorage.  
**Fix:** Since the backend is mocked and auth is essentially unused, either: (a) remove auth code entirely, or (b) hash passwords with a client-side library if auth is planned to return.

### C-3: No Input Sanitization on Order Data
**File:** [api.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/services/api.js#L240-L288)  
**Problem:** Order data from user forms is stored directly in localStorage and passed to WhatsApp without sanitization. The `generateWhatsAppLink()` uses `encodeURIComponent` for the URL but the underlying data is not validated.  
**Risk:** While client-side only, if a backend is re-introduced, this becomes an injection vector.  
**Fix:** Add server-side validation when backend returns; for now, sanitize form inputs at the checkout component level.

---

## 🟠 High Issues

### H-1: Duplicate Pricing Systems (Critical Conflict Risk)
**Files:**  
- [config/pricingConfig.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/config/pricingConfig.js) — Rule-based pricing (162 lines)  
- [utils/pricing.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/pricing.js) — Lookup-table pricing (221 lines)  

**Problem:** Two completely independent pricing engines exist. `pricingConfig.js` exports `getProductPrice(product)` returning a number. `utils/pricing.js` exports `getProductPrice(product)` returning `{ offerPrice, originalPrice, discountPercent }`. The **active** system is `utils/pricing.js` (used by `getProducts.js`). `config/pricingConfig.js` is **dead code** — imported by nothing.  
**Risk:** If someone imports from the wrong file, prices will be wrong. Both have the same comment block ("Updated: 2026-02-24") but may drift.  
**Fix:** Delete `config/pricingConfig.js` or consolidate into one system.

### H-2: Dead Dependencies in package.json (6 unused packages)
**File:** [package.json](file:///c:/Users/daans/Desktop/scrunchcreate/package.json#L14-L22)  
**Problem:** The following production dependencies are installed but completely unused:
- `axios` (mocked API doesn't use it)
- `jwt-decode` (auth removed)
- `passport` (server-side, not used in frontend)
- `passport-google-oauth20` (server-side)
- `compression` (server-side)
- `express-rate-limit` (server-side)
- `helmet` (server-side)

**Impact:** ~1.5MB+ unnecessary node_modules weight; confusing for new developers.  
**Fix:** Remove all 7 unused packages from `dependencies`.

### H-3: CartContext Misplaced in `components/` Instead of `context/`
**Files:**  
- [components/CartContext.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/CartContext.jsx)  
- [context/WishlistContext.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/context/WishlistContext.jsx)  

**Problem:** CartContext is in `components/` while WishlistContext is in `context/`. Inconsistent organization. The CartContext file is ~317 lines — too large for a "component" directory.  
**Fix:** Move `CartContext.jsx` to `src/context/` and update imports.

### H-4: No 404 / Catch-All Route
**File:** [App.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/App.jsx)  
**Problem:** No `<Route path="*" element={<NotFound />} />` exists. Visiting any undefined route shows a blank page.  
**Impact:** Poor UX; users hitting broken links see nothing.  
**Fix:** Add a 404 page component and catch-all route.

### H-5: `index.html` Missing Meta Tags
**File:** [index.html](file:///c:/Users/daans/Desktop/scrunchcreate/index.html)  
**Problem:** No `<meta name="description">`, no Open Graph tags, no Twitter cards, no canonical URL. Only a `<title>` tag exists.  
**Impact:** Poor SEO and social sharing experience.  
**Fix:** Add comprehensive meta tags for SEO and social previews.

### H-6: WhatsApp Message Ignores Coupon Discount and COD Fee
**File:** [whatsappUtils.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/whatsappUtils.js#L35-L41)  
**Problem:** The WhatsApp message recalculates subtotal and delivery from scratch, hardcoding `subtotal >= 499 ? 0 : 49`. It ignores the coupon discount and COD fee that were applied during checkout.  
**Impact:** Store owner receives incorrect order totals. Customer and owner see different prices.  
**Fix:** Use `order.couponDiscount`, `order.codFee`, and `order.total` from the stored order object.

### H-7: Delivery Fee Mismatch Between Config and WhatsApp
**Files:**  
- [config/coupons.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/config/coupons.js#L8) — `FREE_SHIPPING_THRESHOLD = 499`  
- [config/coupons.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/config/coupons.js#L55) — `DELIVERY_FEE = 49`  
- [config/pricingConfig.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/config/pricingConfig.js#L30) — Comment says "Delivery charge: ₹65"  
- [whatsappUtils.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/whatsappUtils.js#L40) — Hardcoded `49`  

**Problem:** The comment in `pricingConfig.js` says delivery is ₹65, but actual code uses ₹49. Three different places define delivery logic.  
**Fix:** Consolidate delivery fee to single source of truth (`coupons.js`). Update stale comments.

---

## 🟡 Medium Issues

### M-1: Dead Component: WhyChooseSection
**Files:**  
- [WhyChooseSection.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/WhyChooseSection.jsx)  
- [WhyChooseSection.module.css](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/WhyChooseSection.module.css)  

**Problem:** Commented out in Home.jsx ("Removed per FIX #8") but files still exist.  
**Fix:** Delete both files.

### M-2: Duplicate FilterSidebar Components
**Files:**  
- [components/FilterSidebar.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/FilterSidebar.jsx) (3.6KB)  
- [components/products/FilterSidebar.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/products/FilterSidebar.jsx) (14.5KB)  

**Problem:** Two FilterSidebar files exist. The Products page imports from `products/FilterSidebar`. The top-level one appears unused.  
**Fix:** Verify the top-level one is unused and delete it.

### M-3: Duplicate API Functions (api.js vs getProducts.js)
**Files:**  
- [services/api.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/services/api.js) — Exports `getProducts`, `getProductBySlug`, `getProductsByCategory`, `getProductVariants`  
- [utils/getProducts.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/getProducts.js) — Exports identical function names  

**Problem:** Both files export the same function names. `api.js` wraps `getProducts.js`. Components inconsistently import from either file.  
**Fix:** Standardize: all components should import from `services/api.js` as the canonical interface.

### M-4: `React` Import Unnecessary in React 19
**Files:** Multiple components still have `import React from 'react'`  
**Problem:** React 19 with the new JSX transform doesn't require explicit React imports. While harmless, it adds noise.  
**Fix:** Remove unnecessary `import React from 'react'` from files that don't use `React.*` APIs directly.

### M-5: Missing Loading States on Product Pages
**File:** [Products.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/pages/products/Products.jsx)  
**Problem:** While products load, the page shows an empty grid with no skeleton/spinner. Same for Home.jsx.  
**Fix:** Add skeleton loading states for product grids.

### M-6: No Error Boundaries
**Problem:** No React Error Boundaries exist. An error in any component crashes the entire app.  
**Fix:** Add Error Boundary wrapper components around critical sections.

### M-7: `events.json` and `gh_events.json` in Project Root
**Files:** `events.json`, `gh_events.json` (91KB)  
**Problem:** Appear to be GitHub webhook event dumps. Not used by any application code.  
**Fix:** Add to `.gitignore` or delete.

### M-8: Stale Log Files in Project Root
**Files:** `vite-dev.err.log`, `vite-dev.out.log`  
**Problem:** Development log files committed to repo.  
**Fix:** Add `*.log` pattern is already in `.gitignore` but files were already tracked. Remove them.

### M-9: `REBUILD_SPECIFICATION.md` is 103KB
**File:** `REBUILD_SPECIFICATION.md`  
**Problem:** Very large specification document (103KB) in project root. Likely a legacy planning document.  
**Fix:** Archive or move to `docs/archive/`.

### M-10: Inconsistent Coupon Validation Behavior
**File:** [couponUtils.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/couponUtils.js#L58-L61)  
**Problem:** The `freeShipping` coupon type gives `discount = DELIVERY_FEE` (49) when subtotal is below threshold, but `discount = 0` when subtotal is already above threshold (free shipping already applies). This is correct behavior but confusing — applying FREESHIP coupon on a ₹500 order shows ₹0 discount.  
**Fix:** Show a message like "Free shipping already applies to your order" instead of silently returning 0 discount.

---

## 🟢 Low Issues

### L-1: `Math.random() - 0.5` Used for Shuffling
**Files:** [CartContext.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/CartContext.jsx#L225), [OrderSuccess.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/pages/checkout/OrderSuccess.jsx#L38)  
**Problem:** `arr.sort(() => Math.random() - 0.5)` is not a true shuffle (biased). Fisher-Yates is the standard.  
**Fix:** Use a proper Fisher-Yates shuffle utility function.

### L-2: `CANONICAL_COLORS.includes()` Instead of Set Lookup
**File:** [colorNormalization.js](file:///c:/Users/daans/Desktop/scrunchcreate/src/utils/colorNormalization.js#L166-L168)  
**Problem:** A `CANONICAL_COLOR_SET` Set exists (line 56) but `normalizeColor()` still uses `CANONICAL_COLORS.includes()` (O(n)) instead.  
**Fix:** Use `CANONICAL_COLOR_SET.has()` for O(1) lookup.

### L-3: No `aria-label` on Mobile Overlay
**File:** [NavBar.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/NavBar.jsx#L287-L291)  
**Problem:** The mobile overlay div has `aria-hidden="true"` but clicking it closes the menu. Screen readers can't interact with it.  
**Fix:** Use a proper modal pattern with focus trapping.

### L-4: `findings.md` and `who-we-are.md` in Project Root
**Problem:** Content/planning files mixed with source code.  
**Fix:** Move to `docs/` directory.

### L-5: `ProductCard.jsx` is 17KB / 400+ Lines
**File:** [ProductCard.jsx](file:///c:/Users/daans/Desktop/scrunchcreate/src/components/ProductCard.jsx)  
**Problem:** Very large single component. Handles image display, pricing, badges, wishlist, add-to-cart, variant selection all in one file.  
**Fix:** Consider splitting into smaller sub-components.

### L-6: No Favicon Optimized for Modern Browsers
**File:** [index.html](file:///c:/Users/daans/Desktop/scrunchcreate/index.html#L5)  
**Problem:** Uses `logotitle.png` as favicon. No SVG icon, no Apple touch icon, no manifest.json.  
**Fix:** Add proper favicon set and PWA manifest.

### L-7: `eslint-disable` Comments Without Explanation
**Files:** CartContext.jsx, WishlistContext.jsx, ToastContext.jsx, Layout.jsx  
**Problem:** `/* eslint-disable react-refresh/only-export-components */` at top of files without explaining why the rule is disabled.  
**Fix:** Add comments explaining the disable reason, or configure ESLint rules properly.

### L-8: Inconsistent CSS Approach
**Problem:** Most components use CSS Modules (`.module.css`). Global styles are in `index.css` and `theme.css`. Some CSS custom properties are defined but inconsistently used.  
**Fix:** Ensure all components use theme tokens consistently.

---

## Summary Statistics

| Priority | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 7 |
| 🟡 Medium | 10 |
| 🟢 Low | 8 |
| **Total** | **28** |

---

## Risk Assessment

| Area | Risk Level | Notes |
|------|-----------|-------|
| Security | 🔴 High | API secret exposed, plaintext passwords |
| Data Integrity | 🟡 Medium | localStorage-only storage, no backup |
| Performance | 🟢 Low | Static data, Cloudinary CDN, vendor chunking |
| SEO | 🟠 High | Missing meta tags, no per-page titles |
| Accessibility | 🟡 Medium | Missing ARIA patterns, no focus management |
| Maintainability | 🟡 Medium | Duplicate code, dead dependencies, inconsistent structure |
| UX | 🟡 Medium | No 404 page, no loading states, no error boundaries |
