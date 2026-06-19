# Scrunch & Create — Developer Handover Guide

> **Last updated:** 2026-06-19  
> **For:** Any developer continuing work on this project

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd scrunchcreate
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your values (only VITE_API_URL matters for dev)

# 3. Start development
npm run dev
# Opens at http://localhost:5173 (or next available port)

# 4. Build for production
npm run build
npm run preview  # Preview at http://localhost:4173
```

---

## Architecture Summary

This is a **React 19 + Vite SPA** for a boutique hair accessories e-commerce store. There is **no live backend** — all data is client-side.

### Key Concept: WhatsApp-Based Orders
Orders are stored in `localStorage` and a WhatsApp deep link is generated for the customer to finalize with the store owner. No payment processing happens in-app.

### Data Flow
```
products.json → getProducts() → pricing engine → Cloudinary CDN URLs
    → in-memory cache → components
```

All cart, wishlist, and order data lives in `localStorage`.

---

## Project Structure

```
src/
├── main.jsx           # Entry: Router → Toast → Wishlist → Cart → App
├── App.jsx            # Route definitions
├── components/        # Shared UI components + Context providers
│   ├── CartContext.jsx     # ⚠️ Should be in context/
│   ├── ToastContext.jsx
│   ├── NavBar.jsx         # Responsive nav with mega-menus
│   ├── CartDrawer.jsx     # Slide-out cart panel
│   ├── ProductCard.jsx    # Product grid card (large: 17KB)
│   └── products/          # Products page sub-components
├── context/           # State management
│   └── WishlistContext.jsx
├── pages/             # Route components
│   ├── home/          # Landing page
│   ├── products/      # Catalog with filters
│   ├── product/       # Single product detail
│   ├── cart/          # Full cart page
│   ├── wishlist/      # Saved items
│   ├── checkout/      # Checkout + OrderSuccess
│   └── legal/         # Privacy, Terms
├── services/
│   └── api.js         # Mock API (localStorage-backed)
├── hooks/
│   └── useProductsFilter.js  # Complex filter/sort/facet hook
├── utils/             # Business logic utilities
│   ├── pricing.js         # Price calculation engine
│   ├── getProducts.js     # Product data loading + formatting
│   ├── colorNormalization.js  # Color aliasing system
│   ├── couponUtils.js     # Coupon validation
│   ├── pincodeUtils.js    # Indian pincode lookup
│   └── whatsappUtils.js   # WhatsApp link generation
├── config/            # Configuration constants
│   ├── config.js          # WhatsApp number
│   ├── coupons.js         # Coupon definitions
│   └── pricingConfig.js   # ⚠️ DEAD CODE (duplicate pricing)
├── data/
│   └── products.json      # Product catalog (89KB, ~200+ items)
└── theme/
    └── theme.css          # CSS custom properties (design tokens)
```

---

## Common Tasks

### Adding a New Product
1. Add entry to `src/data/products.json`
2. Upload images to Cloudinary
3. Update `scripts/cloudinary-url-map.json` with new paths
4. Verify pricing rules in `src/utils/pricing.js` cover the product's category/type

### Adding a New Coupon
1. Edit `src/config/coupons.js`
2. Add entry to `COUPONS` object with type, value, minOrder, maxDiscount
3. Validation logic in `src/utils/couponUtils.js` handles all types automatically

### Adding a New Product Category
1. Add category to slug mappings in:
   - `src/components/NavBar.jsx` (`categoryToSlug`, `categoryDisplayNames`, `navCategories`)
   - `src/pages/products/Products.jsx` (`categorySlugMap`)
   - `src/utils/catalogDisplay.js` (`CATEGORY_DISPLAY_NAMES`, `CATEGORY_SLUGS`)
2. Add pricing rules in `src/utils/pricing.js` (`OFFER_PRICE_TABLE`, `MRP_MARKUP`)

### Modifying the Checkout Flow
- Form logic: `src/pages/checkout/Checkout.jsx`
- Order placement: `src/services/api.js` → `placeOrder()`
- Post-checkout: `src/pages/checkout/OrderSuccess.jsx`
- WhatsApp message: `src/utils/whatsappUtils.js`

---

## Known Issues

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for the full list. Key ones:

1. **Security:** Cloudinary API secret was committed to git history
2. **Dead code:** 7 unused npm packages, duplicate pricing engine, dead components
3. **Bug:** WhatsApp message doesn't include coupon/COD fee adjustments
4. **UX:** No 404 page, no loading states, no error boundaries
5. **SEO:** Missing meta tags in index.html

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_API_URL` | Backend API URL (currently unused) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account (scripts only) | Only for image scripts |
| `CLOUDINARY_API_KEY` | Cloudinary auth (scripts only) | Only for image scripts |
| `CLOUDINARY_API_SECRET` | Cloudinary auth (scripts only) | Only for image scripts |

---

## Deployment

### Vercel (Current)
1. Push to `main` branch
2. Vercel auto-deploys
3. SPA routing handled by `vercel.json` rewrites

### Manual Deploy
```bash
npm run build
# Upload contents of dist/ to any static host
```

---

## Testing

```bash
npm run test         # Single run
npm run test:watch   # Watch mode
npm run lint         # ESLint check
```

Test infrastructure is set up (Vitest + Testing Library) but test coverage is minimal.

---

## Documentation Index

| File | Purpose |
|------|---------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Architecture, modules, data flow |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Issues, risks, technical debt |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Milestones and execution plan |
| [CHANGELOG.md](./CHANGELOG.md) | Change history |
| [DECISIONS.md](./DECISIONS.md) | Technical decision rationale |
| [TODO.md](./TODO.md) | Pending work backlog |
| [TEST_REPORT.md](./TEST_REPORT.md) | Validation results |
| [HANDOVER.md](./HANDOVER.md) | This file |
| [VERCEL_SETUP.md](./VERCEL_SETUP.md) | Vercel deployment guide |

---

## Contacts

- **WhatsApp Business:** +91 7300969491 (configured in `src/config/config.js`)
- **Cloudinary Account:** `duu26sqog` (cloud name from `.env`)
