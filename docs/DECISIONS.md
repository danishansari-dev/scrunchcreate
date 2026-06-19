# Scrunch & Create — Technical Decisions

> Log of significant technical decisions and their rationale.

---

## D-1: Keeping Mock API Layer (2026-06-19)

**Decision:** Preserve the `services/api.js` mock layer rather than deleting it.  
**Reason:** The mock API mimics Axios error shapes (`error.response.data.message`), which means all existing error handling code in components works correctly. Removing it would require refactoring every component's error handling. If a real backend is re-introduced, only `api.js` needs to change — the rest of the app is insulated.  
**Trade-off:** Carries dead mock auth code (register/login) that should be cleaned if auth is not planned.

---

## D-2: `utils/pricing.js` as Canonical Pricing Engine (2026-06-19)

**Decision:** Delete `config/pricingConfig.js` in favor of `utils/pricing.js`.  
**Reason:** `utils/pricing.js` is the actively used pricing engine (imported by `getProducts.js`). `config/pricingConfig.js` is dead code with a different API shape. Having two systems with the same exported function name (`getProductPrice`) is a bug waiting to happen.  
**Trade-off:** If the rule-based approach is preferred in the future, it would need to be re-implemented.

---

## D-3: CartContext Relocation to `context/` (2026-06-19)

**Decision:** Move `CartContext.jsx` from `components/` to `context/`.  
**Reason:** Context providers are architectural concerns, not UI components. WishlistContext is already in `context/`. Consistency matters for developer onboarding.  
**Trade-off:** Import paths change in ~8 files. A single-pass find-and-replace handles it.

---

## D-4: Cloudinary URL Map as Static JSON (Pre-existing)

**Decision:** Product images are mapped to Cloudinary CDN via a static JSON file (`scripts/cloudinary-url-map.json`), not a runtime API call.  
**Reason:** Eliminates runtime API dependency, enables fully offline-capable frontend, zero latency overhead.  
**Trade-off:** New products require running the upload script and rebuilding the map. Not suitable for a CMS-driven store with frequent product additions.

---

## D-5: WhatsApp-First Checkout (Pre-existing)

**Decision:** Use WhatsApp as the order finalization channel instead of integrating a payment gateway.  
**Reason:** For a small boutique store, direct communication allows color/size customization. Avoids payment gateway integration complexity and fees.  
**Trade-off:** No automated order tracking, no payment confirmation, manual order processing.

---

## D-6: localStorage for All State (Pre-existing)

**Decision:** Cart, wishlist, orders, and user data all persist in browser localStorage.  
**Reason:** Enables fully offline-capable frontend without any backend dependency.  
**Trade-off:** Data is lost on browser clear. No cross-device sync. No server-side analytics. Privacy-mode browsers may have storage limits.

---

## D-7: CSS Modules Over Tailwind (Pre-existing)

**Decision:** Use CSS Modules (`.module.css`) for component styling.  
**Reason:** Full control over CSS, no build-time class generation, familiar syntax, good encapsulation. Design tokens defined via CSS custom properties in `theme.css`.  
**Trade-off:** More verbose than utility-first approaches. Requires manual responsive breakpoints in each module.
