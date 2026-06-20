# Scrunch & Create — Project Overview

> **Last updated:** 2026-06-19  
> **Stack:** React 19 + Vite 7 + Framer Motion + CSS Modules  
> **Deployment:** Vercel (frontend SPA)  
> **Status:** Production — fully client-side, no live backend

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
│       │    ├── WishlistProvider (localStorage)    │
│       │    └── CartProvider (localStorage + API)  │
│       │                                          │
│       ├── Layout (NavBar + Footer + CartDrawer)  │
│       │                                          │
│       └── Pages                                  │
│            ├── Home                              │
│            ├── Products (catalog + filters)       │
│            ├── ProductDetail                     │
│            ├── Cart                              │
│            ├── Wishlist                           │
│            ├── Checkout                          │
│            ├── OrderSuccess                      │
│            └── NotFound                          │
│                                                  │
│  Data Layer (all client-side)                    │
│  ├── data/products.json (89KB product catalog)   │
│  ├── localStorage (cart, wishlist, orders)       │
│  ├── services/api.js (mocked backend)            │
│  └── shared/ (common helpers, config & theme)    │
└──────────────────────────────────────────────────┘
```

---

## 3. Module Map

### App Layer (`src/app/`)
- `main.jsx` — React root entry: Router → Toast → Wishlist → Cart → App.
- `App.jsx` — Client-side route declarations wrapped in Layout.
- `App.css` / `index.css` — Global stylesheets and scroll behaviors.

### Feature Modules (`src/features/`)

| Feature | Component/Context | Purpose |
|---------|-------------------|---------|
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
| **wishlist** | `WishlistContext.jsx` | Wishlist state and cross-tab storage synchronizer |

### Reusable UI / Layout (`src/components/`)
- `ErrorBoundary/` — Fallback boundary wrapper to catch UI crashes.
- `Layout/` — Main page frame container (attaches NavBar, Footer, CartDrawer).
- `NavBar/` — Responsive header navigation and mega-menus.
- `Footer/` — Global footer.
- `ToastContext/` — Toast provider and animation styles.
- `TrustBadges/` — Handcrafted / secure checkout trust indicators.
- `Banner/` — Homepage hero banner carousel.
- `FeaturesSection/` — USP / store features strip.
- `InstagramSection/` — UGC photo gallery feed.
- `SectionHeader/` — Typography block for page sections.

### Page View Controllers (`src/pages/`)
- `home/` — Homepage.
- `products/` — Catalog page.
- `product/` — Product details.
- `cart/` — Cart page.
- `wishlist/` — Wishlist view page.
- `checkout/` — Checkout form.
- `NotFound.jsx` — 404 page.

### Shared Modules (`src/shared/`)
- `config/` — Configuration files (`config.js` and `coupons.js`).
- `utils/` — Business utility functions (`pricing.js`, `whatsappUtils.js`, `pincodeUtils.js`, etc.).
- `theme/` — Custom design tokens and CSS properties (`theme.css`).

---

## 4. Entry Points

- `index.html` — Main HTML document loader. Loads `/src/app/main.jsx`.
- `src/app/main.jsx` — Mounts the React application.
- `src/app/App.jsx` — Renders client routes and links.
