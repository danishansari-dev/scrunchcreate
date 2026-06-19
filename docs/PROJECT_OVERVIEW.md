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
│  index.html → main.jsx → App.jsx (Routes)        │
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
│            └── Legal (Privacy, T&C)              │
│                                                  │
│  Data Layer (all client-side)                    │
│  ├── products.json (89KB, ~200+ products)        │
│  ├── cloudinary-url-map.json (image CDN mapping) │
│  ├── localStorage (cart, wishlist, orders, users) │
│  └── services/api.js (mocked backend)            │
└──────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **No live backend:** The project was originally built with a Node/Express backend (Render) but has been fully decoupled. All backend endpoints are mocked client-side using `localStorage`. The `services/api.js` file mimics Axios error shapes so existing error handling code continues to work.

2. **WhatsApp-first checkout:** Orders are stored locally and a WhatsApp deep link is generated for the customer to finalize colors/sizes with the store owner.

3. **Image CDN:** Product images are hosted on Cloudinary. A static `cloudinary-url-map.json` maps local asset paths to Cloudinary CDN URLs.

---

## 3. Module Map

### Pages (`src/pages/`)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with banner, features, collections, best sellers, new arrivals, kits, Instagram |
| Products | `/products`, `/products/:category` | Full catalog with filters, search, sort, discovery rails |
| ProductDetail | `/product/:slug` | Single product view with images, variants, color selection, reviews |
| Cart | `/cart` | Full cart page with shipping bar, cross-sells, coupon field |
| Wishlist | `/wishlist` | Saved items page |
| Checkout | `/checkout` | Contact info, delivery address (pincode auto-fill), payment selection |
| OrderSuccess | `/order-success` | Post-checkout confirmation, WhatsApp CTA, cross-sells |
| PrivacyPolicy | `/privacy-policy` | Legal page |
| TermsAndConditions | `/terms-and-conditions` | Legal page |

### Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| **Layout** | Wraps all pages with NavBar, Footer, CartDrawer, and page transitions |
| **NavBar** | Responsive nav with mega-menu dropdowns, search, wishlist/cart icons |
| **CartDrawer** | Slide-out cart panel |
| **CartContext** | Global cart state (items, coupons, delivery fees, recommendations) |
| **ToastContext** | Toast notification system with Framer Motion animations |
| **ProductCard** | Product grid card with image, pricing, wishlist, add-to-cart |
| **ProductList** | Horizontal product rail (for home page sections) |
| **FilterSidebar** | Product catalog filter panel (type, color, price) |
| **CouponField** | Coupon input with validation |
| **PaymentMethodSelector** | UPI/Card/COD selector for checkout |
| **TrustBadges** | Trust signals (handcrafted, secure, returns) |
| **Banner** | Hero carousel/banner for home page |
| **CollectionsSection** | Category showcase cards |
| **BestSellersSection** | Featured product carousel |
| **FeaturesSection** | USP/value proposition strip |
| **KitsSection** | Curated kit bundles |
| **InstagramSection** | UGC-style Instagram grid |
| **WhyChooseSection** | Unused (removed per FIX #8, but file still exists) |
| **ProductReviews** | Customer review display |

### State Management (`src/context/`, `src/components/`)

| Context | Location | Storage | Purpose |
|---------|----------|---------|---------|
| CartContext | `components/CartContext.jsx` | localStorage (`mock_cart_*`) | Cart CRUD, coupon mgmt, shipping calc, cross-sell |
| WishlistContext | `context/WishlistContext.jsx` | localStorage (`scrunch_wishlist`) | Wishlist toggle, cross-tab sync |
| ToastContext | `components/ToastContext.jsx` | React state only | Ephemeral toast notifications |

### Services (`src/services/`)

| File | Purpose |
|------|---------|
| `api.js` | Fully mocked API layer mimicking the original Express backend. All data persisted in localStorage. |

### Utilities (`src/utils/`)

| File | Purpose |
|------|---------|
| `pricing.js` | Product pricing engine (offer price, MRP markup, discount %) |
| `getProducts.js` | Product data loading, formatting, Cloudinary URL resolution |
| `colorNormalization.js` | Color aliasing, canonical color mapping, hex values |
| `couponUtils.js` | Coupon validation and delivery fee calculation |
| `pincodeUtils.js` | Indian pincode → city/state lookup, delivery date estimation |
| `whatsappUtils.js` | WhatsApp deep link generation from order data |
| `catalogDisplay.js` | Category/type display name normalization |
| `productUtils.js` | Slug generation helper |

### Configuration (`src/config/`)

| File | Purpose |
|------|---------|
| `config.js` | WhatsApp phone number constant |
| `coupons.js` | Coupon definitions (WELCOME10, FESTIVE20, FLAT50, FREESHIP) |
| `pricingConfig.js` | Pricing rules engine (rule-based pricing, first match wins) |

### Hooks (`src/hooks/`)

| File | Purpose |
|------|---------|
| `useProductsFilter.js` | Complex product filtering, sorting, facet generation, variant image swapping |

---

## 4. Data Flow

### Product Loading
```
products.json → getProducts() (utils) → pricing engine → Cloudinary URL mapping
    → color normalization → cached in memory → consumed by pages/components
```

### Cart Flow
```
User adds item → CartContext.addToCart() → api.addToCartAPI() → localStorage
    → React state update → CartDrawer opens → toast notification
```

### Checkout Flow
```
Cart → /checkout → form validation → pincode auto-fill → payment method
    → placeOrder() → localStorage (last_order) → /order-success
    → WhatsApp deep link generation → customer contacts store owner
```

### Wishlist Flow
```
User clicks heart → WishlistContext.toggleWishlist() → localStorage
    → cross-tab sync via storage event listener
```

---

## 5. Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.1 | UI framework |
| react-dom | ^19.1.1 | DOM rendering |
| react-router-dom | ^7.8.1 | Client-side routing |
| framer-motion | ^12.23.12 | Page transitions, toast animations |
| axios | ^1.7.9 | Listed but **NOT actively used** (mocked) |
| jwt-decode | ^4.0.0 | Listed but **NOT actively used** (auth removed) |
| passport | ^0.7.0 | Listed but **NOT actively used** (server-side auth) |
| passport-google-oauth20 | ^2.0.0 | Listed but **NOT actively used** |
| compression | ^1.8.1 | Listed but **NOT actively used** (server-side) |
| express-rate-limit | ^8.3.2 | Listed but **NOT actively used** (server-side) |
| helmet | ^8.1.0 | Listed but **NOT actively used** (server-side) |

### Development
| Package | Purpose |
|---------|---------|
| vite | Build tool |
| @vitejs/plugin-react | React HMR & JSX transform |
| vitest + jsdom | Unit testing |
| @testing-library/react | Component testing |
| eslint | Code quality |

---

## 6. Environment Variables

| Variable | Used By | Required |
|----------|---------|----------|
| `VITE_API_URL` | `.env` | Configured but unused (API is mocked) |
| `CLOUDINARY_CLOUD_NAME` | Scripts only | For image upload scripts |
| `CLOUDINARY_API_KEY` | Scripts only | For image upload scripts |
| `CLOUDINARY_API_SECRET` | Scripts only | For image upload scripts |

---

## 7. Build & Development

```bash
# Development
npm run dev          # Vite dev server (HMR, port 5173/5174)

# Production build
npm run build        # Outputs to /dist

# Preview production build
npm run preview      # Serves /dist on port 4173

# Testing
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode

# Linting
npm run lint         # ESLint
```

### Build Configuration (vite.config.js)
- Manual chunks split: `react-vendor` (React + React Router) and `motion-vendor` (Framer Motion)
- Output directory: `dist/`

---

## 8. Deployment

- **Platform:** Vercel
- **Configuration:** `vercel.json` with SPA rewrite (`/(.*) → /index.html`)
- **Static assets:** `public/.htaccess` and `public/_redirects` also exist for alternative hosting (Netlify/Apache)
- **Images:** Served via Cloudinary CDN (mapped in `scripts/cloudinary-url-map.json`)

---

## 9. Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `sync_products.cjs` | Syncs product data from external source |
| `upload-to-cloudinary.js` | Uploads local product images to Cloudinary |
| `reseed-with-cloudinary.js` | Re-seeds product data with Cloudinary URLs |
| `exportToSheets.js` | Exports product data to Google Sheets |
| `cloudinary-url-map.json` | Static mapping of local paths → CDN URLs |

---

## 10. Entry Points

| File | Role |
|------|------|
| `index.html` | HTML shell, loads `/src/main.jsx` |
| `src/main.jsx` | React root: Router → Toast → Wishlist → Cart → App |
| `src/App.jsx` | Route definitions wrapped in Layout |
| `src/components/Layout.jsx` | Page wrapper with NavBar, Footer, CartDrawer, transitions |

---

## 11. Assumptions & Unknown Areas

### Confirmed Assumptions
- The backend is fully decommissioned; all data is client-side
- No real payment processing occurs; WhatsApp handles order finalization
- Product images are pre-uploaded to Cloudinary; no runtime upload
- No user authentication exists (mock auth code remains but is unused)

### Unknown / Needs Clarification
- Whether a backend will be re-introduced (Supabase/Render)
- Product inventory management — no stock tracking exists
- Order tracking — orders are stored in localStorage only (lost on clear)
- Analytics/tracking integration (none present)
- SEO strategy for product pages (no meta tags per page)
- Mobile app plans (PWA manifest not configured)
