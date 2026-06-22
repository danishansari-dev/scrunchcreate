# Scrunch & Create — Technical Decisions

> Log of significant technical decisions and their rationale.

---

## D-1: Keeping Mock API Layer (2026-06-19)

**Decision:** Preserve the `services/api.js` mock layer rather than deleting it.  
**Reason:** The mock API mimics Axios error shapes (`error.response.data.message`), which means all existing error handling code in components works correctly. Removing it would require refactoring every component's error handling. If a real backend is re-introduced, only `api.js` needs to change — the rest of the app is insulated.  
**Trade-off:** Carries dead mock auth code (register/login) that should be cleaned if auth is not planned.

**Update (2026-06-22):** Auth exports in `api.js` now delegate to Supabase Auth (`signUp`, `signInWithPassword`, `signOut`, `getUser`). Remaining mock-auth remnants (`mock_current_user` localStorage reads, `mockApi.get('/auth/me')` fallback) are a legacy/dead path — not removed yet per Phase 0 constraints (minimal-diff policy). See **D-8**.

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

## D-6: localStorage for Guest & Fallback State (2026-06-19, updated 2026-06-22)

**Decision:** Guest cart, wishlist, and order fallbacks persist in browser localStorage; authenticated users sync to Supabase.  
**Reason:** Enables instant guest shopping without sign-in. localStorage provides resilience when Supabase is unreachable.  
**Trade-off:** Guest data is lost on browser clear. No cross-device sync until the user signs in.

**Supersedes:** The original D-6 decision ("localStorage for all state") no longer applies to logged-in cart/wishlist, which now live in `cart_items` and `wishlist_items` tables.

---

## D-7: CSS Modules Over Tailwind (Pre-existing)

**Decision:** Use CSS Modules (`.module.css`) for component styling.  
**Reason:** Full control over CSS, no build-time class generation, familiar syntax, good encapsulation. Design tokens defined via CSS custom properties in `theme.css`.  
**Trade-off:** More verbose than utility-first approaches. Requires manual responsive breakpoints in each module.

---

## D-8: Supabase Auth as Canonical Identity (2026-06-22, Phase 0 finding)

**Decision:** Supabase Auth is the single source of truth for user identity and sessions.  
**Reason:** Phase 0 audit confirmed the legacy mock auth path (plaintext passwords in `localStorage`, `mock_users` key) is insecure and unused by the live login flow. `AuthContext` subscribes to `supabase.auth.onAuthStateChange`; `api.js` auth exports call `supabase.auth.signUp`, `signInWithPassword`, `signOut`, and `getUser`.  
**Implementation:** `src/features/auth/context/AuthContext.jsx` manages session state; `src/shared/config/supabase.js` provides the client singleton.  
**Trade-off:** Requires Supabase project configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Email confirmation behavior depends on Supabase project settings.

**Legacy note:** `api.js` still contains dead mock-auth fallbacks (`mock_current_user` in `getLocalUserEmail()`, `mockApi.get('/auth/me')`). These are not on the active login path but remain until a dedicated cleanup pass is approved.

---

## D-9: Dual-Layer Admin Authorization (2026-06-22)

**Decision:** Admin access uses client-side route guarding plus server-side RLS — not either alone.  
**Client layer:** `AdminGuard` checks `isUserAdmin(user)` from `src/shared/config/adminConfig.js`, which parses the `VITE_ADMIN_EMAILS` environment variable (comma-separated email allowlist, case-insensitive). This prevents non-admins from rendering admin UI and provides immediate feedback.  
**Server layer:** Supabase RLS policies on `products`, `product_variants`, and `orders` call `is_admin()` (`scripts/admin-migration.sql`), which compares `auth.email()` against the deployed admin email list. This enforces that admin mutations cannot succeed without a valid admin JWT regardless of client-side bypass.  
**Trade-off:** `VITE_ADMIN_EMAILS` is visible in the client bundle (acceptable for a small-team allowlist, not a secrets mechanism). Admin email list must be kept in sync between Vercel env vars and the Supabase `is_admin()` function placeholder.
