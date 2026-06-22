# Scrunch & Create — Project Overview

> **Last updated:** 2026-06-22  
> **Stack:** React 19 + Vite 7 + Framer Motion + CSS Modules + Supabase  
> **Deployment:** Vercel (frontend SPA)  
> **Status:** Production — Supabase-backed data layer with localStorage fallbacks

---

## 1. Purpose & Business Context

**Scrunch & Create** is an e-commerce storefront for a boutique hair accessories brand based in India. The store sells scrunchies, hair bows, earrings, gift hampers, flower jewellery, hair clips, and paraandis.

**Business model:** The store uses a **WhatsApp-based order conversion funnel**. Instead of native payment gateway integration, checkout details are formatted into a structured chat message and pushed to the owner's WhatsApp number (`+91 7300969491`). UPI, card, and COD payment methods are presented in the UI, but actual payment processing is handled offline via WhatsApp communication.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                    Browser (SPA)                  │
│                                                  │
│  index.html → app/main.jsx → app/App.jsx         │
│       │                                          │
│       ├── Context Providers                      │
│       │    ├── ToastProvider (notifications)      │
│       │    ├── AuthProvider (Supabase Auth)     │
│       │    ├── WishlistProvider (DB + local)    │
│       │    └── CartProvider (DB + local)        │
│       │                                          │
│       ├── Layout (NavBar + Footer + CartDrawer)  │
│       │                                          │
│       └── Pages                                  │
│            ├── Home, Products, ProductDetail     │
│            ├── Cart, Wishlist, Checkout          │
│            ├── OrderSuccess, NotFound            │
│            ├── Auth (/login)                     │
│            ├── Profile (/profile)                │
│            ├── Admin (/admin, AdminGuard)        │
│            └── Legal (privacy, terms)            │
│                                                  │
│  Data Layer                                      │
│  ├── Supabase (products, orders, cart, wishlist) │
│  ├── Supabase Auth (sessions, user metadata)     │
│  ├── localStorage (guest cart/wishlist, fallbacks)│
│  ├── data/products.json (offline catalog fallback)│
│  ├── services/api.js (unified data facade)       │
│  └── shared/ (config, utils, theme)              │
└──────────────────────────────────────────────────┘
```

---

## 3. Module Map

### App Layer (`src/app/`)
- `main.jsx` — React root entry: Router → Toast → Auth → Wishlist → Cart → App.
- `App.jsx` — Client-side route declarations wrapped in Layout; admin route wrapped in `AdminGuard`.
- `App.css` / `index.css` — Global stylesheets and scroll behaviors.

### Feature Modules (`src/features/`)

| Feature | Component/Context | Purpose |
|---------|-------------------|---------|
| **auth** | `AuthContext.jsx` | Supabase Auth session, login/signup/logout, cart/wishlist merge on sign-in |
|         | `AdminGuard/` | Client-side admin route protection via `VITE_ADMIN_EMAILS` allowlist |
| **cart** | `CartContext.jsx` | Cart state (items, coupon logic, delivery fees) |
|         | `CartDrawer/` | Slide-out cart panel component |
|         | `CouponField/` | Promo code validation form |
|         | `PaymentMethodSelector/` | Selection UI for UPI/Card/COD methods |
| **products** | `ActiveFilters/` | Active filter badges strip |
|         | `BestSellersSection/` | Featured products display block |
|         | `CollectionsSection/` | Product categories display cards |
|         | `FilterSidebar/` | Sorting and filtering panel |
|         | `KitsSection/` | Bundled kits showcase section |
|         | `ProductCard/` | Grid card for product items |
|         | `ProductList/` | Horizontal carousel product rails |
|         | `ProductReviews/` | User product review lists |
|         | `ProductSearch/` | Product search input box |
|         | `ProductSkeleton/` | Product list loading indicator |
|         | `useProductsFilter.js` | Product sorting, filtering, and variant image hooks |
| **wishlist** | `WishlistContext.jsx` | Wishlist state; Supabase sync for logged-in users, localStorage for guests |

### Reusable UI / Layout (`src/components/`)
- `ErrorBoundary/` — Fallback boundary wrapper to catch UI crashes.
- `Layout/` — Main page frame container (attaches NavBar, Footer, CartDrawer).
- `NavBar/` — Responsive header navigation, auth avatar/dropdown, mega-menus.
- `Footer/` — Global footer with legal links.
- `ToastContext/` — Toast provider and animation styles.
- `TrustBadges/` — Handcrafted / secure checkout trust indicators.
- `Banner/` — Homepage hero banner carousel.
- `FeaturesSection/` — USP / store features strip.
- `InstagramSection/` — UGC photo gallery feed.
- `SectionHeader/` — Typography block for page sections.

### Page View Controllers (`src/pages/`)

| Page folder | Route(s) | Purpose |
|-------------|----------|---------|
| `home/` | `/` | Homepage |
| `products/` | `/products`, `/products/:category` | Catalog with filters |
| `product/` | `/product/:slug` | Product detail |
| `cart/` | `/cart` | Full cart page |
| `wishlist/` | `/wishlist` | Saved items |
| `checkout/` | `/checkout`, `/order-success` | Checkout form and confirmation |
| `auth/` | `/login` | Combined login / register page |
| `profile/` | `/profile` | Account details and order history |
| `admin/` | `/admin` | Admin dashboard and product management (guarded) |
| `legal/` | `/privacy-policy`, `/terms-and-conditions` | Privacy policy and terms |
| `NotFound.jsx` | `*` | 404 page |

### Services (`src/services/`)
- `api.js` — Unified facade for Supabase products, orders, cart, wishlist, auth, and admin operations; localStorage fallbacks; Axios-shaped errors.

### Shared Modules (`src/shared/`)
- `config/` — `config.js`, `coupons.js`, `supabase.js`, `adminConfig.js`.
- `utils/` — Business utility functions (`getProducts.js`, `pricing.js`, `whatsappUtils.js`, `pincodeUtils.js`, etc.).
- `theme/` — Custom design tokens and CSS properties (`theme.css`).

---

## 4. Entry Points

- `index.html` — Main HTML document loader. Loads `/src/app/main.jsx`.
- `src/app/main.jsx` — Mounts the React application.
- `src/app/App.jsx` — Renders client routes and links.
