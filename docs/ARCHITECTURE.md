# Scrunch & Create — Architectural Design Document

> **Created:** 2026-06-19  
> **Last updated:** 2026-06-22  
> **Topic:** Feature-Sliced Design / Clean Modular Architecture  

---

## 1. Architectural Philosophy

The codebase uses a **Feature-Sliced / Clean Modular Architecture** to divide business capabilities into isolated features, reusable components, and global application entries.

### Key Goals:
- **High Cohesion:** Co-locate component markup, logic, and styles inside a single directory.
- **Low Coupling:** Shared configurations and utilities reside inside `/shared`. Business logic features reside inside `/features` and do not depend on other features directly.
- **Clear Dependency Flow:** 
  ```
  App Layer (app/) -> Pages Layer (pages/) -> Features Layer (features/) -> Shared Layer (shared/)
  ```

---

## 2. Directory breakdown

### 1. App Layer (`src/app/`)
Contains global, cross-cutting configurations, entry scripts, and index stylesheets.
- `main.jsx` — Mounts providers (Toast → Auth → Wishlist → Cart) and the router.
- `App.jsx` — Client-side route declarations wrapped in Layout.
- `App.css` / `index.css` — Global stylesheets and scroll behaviors.
- **Rules:** App layer handles application initialization and router mounting. It acts as the orchestration point for the layout wrapping.

### 2. Pages Layer (`src/pages/`)
Contains views corresponding to client routes. Pages are thin wrappers that compose features and reusable UI components.

| Route area | Folder | Purpose |
|------------|--------|---------|
| Storefront | `home/`, `products/`, `product/` | Homepage, catalog, product detail |
| Commerce | `cart/`, `wishlist/`, `checkout/` | Cart, wishlist, checkout, order success |
| Auth & account | `auth/`, `profile/` | Login/register page, user profile & order history |
| Admin | `admin/` | Admin dashboard (`AdminDashboard.jsx`) and product form (`ProductForm.jsx`) |
| Legal | `legal/` | Privacy policy and terms & conditions |
| Utility | `NotFound.jsx` | 404 page |

- **Rules:** Pages should not declare nested layout styles or business details directly. Route protection for admin views is applied in `App.jsx` via `AdminGuard` from the auth feature.

### 3. Features Layer (`src/features/`)
Contains independent business domains. All feature assets (components, hooks, contexts) are co-located inside the feature slice folder.

| Feature | Structure | Purpose |
|---------|-----------|---------|
| `auth/` | `context/AuthContext.jsx`, `components/AdminGuard/AdminGuard.jsx` | Supabase Auth session state, login/signup/logout, guest cart/wishlist merge on sign-in; client-side admin route guard |
| `cart/` | `context/CartContext.jsx`, `components/CartDrawer/`, `CouponField/`, `PaymentMethodSelector/` | Cart state, slide-out drawer, coupons, payment method UI |
| `products/` | `hooks/useProductsFilter.js`, `components/` (ProductCard, ProductList, FilterSidebar, ProductSearch, ActiveFilters, ProductReviews, ProductSkeleton, BestSellersSection, CollectionsSection, KitsSection) | Catalog filtering, search, product display rails and cards |
| `wishlist/` | `context/WishlistContext.jsx` | Wishlist state and synchronization (Supabase for authenticated users, localStorage for guests) |

- **Rules:** Features do not import from other features. Pages and the app layer compose multiple features as needed.

### 4. Components Layer (`src/components/`)
Contains globally reusable UI controls, presentation cards, and layout wrappers.
- `Layout/` — Main page frame (NavBar, Footer, CartDrawer).
- `NavBar/`, `Footer/` — Global chrome.
- `ToastContext/` — Toast notifications.
- `ErrorBoundary/`, `Banner/`, `FeaturesSection/`, `InstagramSection/`, `SectionHeader/`, `TrustBadges/` — Presentation blocks.
- **Rules:** Components must remain generic and business-agnostic. They are passed data via React props and do not query feature contexts or API wrappers directly (NavBar is an exception for auth-aware navigation).

### 5. Services Layer (`src/services/`)
- `api.js` — Central data-access facade: Supabase-backed products, orders, cart, wishlist, and auth; localStorage fallbacks for guests and offline resilience; Axios-shaped error helpers for existing consumers.
- **Rules:** All Supabase and persistence logic for pages/contexts flows through this file to keep a stable API surface.

### 6. Shared Layer (`src/shared/`)
Contains generic scripts, styling parameters, and constants.
- **Structure:**
  - `config/` — `config.js`, `coupons.js`, `supabase.js` (client singleton), `adminConfig.js` (`VITE_ADMIN_EMAILS` allowlist helper).
  - `utils/` — `getProducts.js`, `pricing.js`, `whatsappUtils.js`, `pincodeUtils.js`, and other helpers.
  - `theme/` — Global styling custom properties (`theme.css`).

---

## 3. Co-location Conventions

Components containing corresponding CSS module files must be restructured into directories where:
- The component code is stored in `index.jsx`.
- The stylesheet is stored in `[ComponentName].module.css`.

Example:
```
src/features/cart/components/CartDrawer/
├── index.jsx
└── CartDrawer.module.css
```
This isolates styles to the component context and prevents CSS contamination.

Page-level views follow the same pattern when they have dedicated styles:
```
src/pages/profile/
├── ProfilePage.jsx
└── ProfilePage.module.css
```

---

## 4. Data & persistence model

| Domain | Guest | Authenticated user | Backend |
|--------|-------|-------------------|---------|
| Products | Supabase (JSON fallback) | Supabase | `products`, `product_variants` |
| Orders | `session_id` in localStorage + Supabase | `user_id` + `session_id` | `orders` |
| Cart | localStorage (`mock_cart_guest`) | Supabase `cart_items` (+ local fallback) | RLS: `auth.uid() = user_id` |
| Wishlist | localStorage (`scrunch_wishlist`) | Supabase `wishlist_items` | RLS: `auth.uid() = user_id` |
| Auth | — | Supabase Auth JWT session | `auth.users` |
| Admin writes | — | `is_admin()` RLS on server; `AdminGuard` + `VITE_ADMIN_EMAILS` on client | products, variants, order status |
