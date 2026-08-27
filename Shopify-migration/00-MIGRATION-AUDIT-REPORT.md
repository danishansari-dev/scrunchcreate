# Scrunch & Create — Shopify Migration Audit Report

> **Date:** 2026-08-25  
> **Prepared by:** Engineering Agent  
> **Mediator:** Danish (Human)  
> **Status:** AUDIT COMPLETE — Awaiting AI Technical Lead Review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack Inventory](#2-technology-stack-inventory)
3. [Repository & Architecture Map](#3-repository--architecture-map)
4. [Data Model & Schema Analysis](#4-data-model--schema-analysis)
5. [UI Component → Liquid Section Mapping](#5-ui-component--liquid-section-mapping)
6. [Business Logic Audit](#6-business-logic-audit)
7. [Asset & Media Inventory](#7-asset--media-inventory)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [SEO & Routing Analysis](#9-seo--routing-analysis)
10. [Production Readiness Assessment](#10-production-readiness-assessment)
11. [MCP Tooling Status](#11-mcp-tooling-status)
12. [Risk Register & Migration Recommendations](#12-risk-register--migration-recommendations)

---

## 1. Executive Summary

**Scrunch & Create** is a handmade hair accessories brand operating from India, currently running a **React 19 + Vite 7 SPA** deployed on **Vercel**, with **Supabase** as the primary backend (Auth, Postgres DB, RLS policies). The storefront sells scrunchies, hair bows, hair clips, earrings, flower jewellery, paraandis, combos, and gift hampers.

### Key Findings

| Dimension | Current State | Migration Impact |
|-----------|--------------|-----------------|
| **Frontend** | React SPA with CSS Modules + Framer Motion | Full rewrite to Shopify Liquid + theme JS |
| **Backend** | Supabase (Postgres + Auth + RLS) | Replace with Shopify Admin API + native features |
| **Cart** | Custom React Context + localStorage fallback | Replace with Shopify Cart API |
| **Checkout** | Custom single-page checkout with pincode auto-fill | Replace with Shopify Checkout (native) |
| **Auth** | Supabase Auth (email/password) | Replace with Shopify Customer Accounts |
| **Payments** | Simulated (UPI/Card/COD forms, WhatsApp order relay) | Replace with Shopify Payments / Razorpay |
| **Products** | ~8 categories, variants by color, JSONB storage | Migrate to Shopify Products + Variants |
| **Pricing** | Hard-coded pricing engine in `pricing.js` | Migrate to Shopify variant pricing + compare-at prices |
| **Inventory** | Atomic stock decrement RPC in Supabase | Replace with Shopify Inventory Management |
| **Coupons** | Hard-coded coupon config (`coupons.js`) | Migrate to Shopify Discount Codes |

---

## 2. Technology Stack Inventory

### Frontend

| Technology | Version | Purpose | Migration Path |
|-----------|---------|---------|---------------|
| React | 19.x | UI rendering | → Shopify Liquid templates |
| Vite | 7.x | Build toolchain | → Shopify CLI / Theme Kit |
| React Router | v7 | Client-side routing | → Shopify URL structure |
| Framer Motion | Latest | Page transitions, card animations | → CSS animations + Shopify section JS |
| CSS Modules | Native | Component-scoped styles | → Shopify theme CSS (single namespace) |
| localStorage | Browser API | Guest cart/wishlist persistence | → Shopify Cart API (server-side) |

### Backend

| Technology | Purpose | Migration Path |
|-----------|---------|---------------|
| Supabase Auth | User registration, login, sessions | → Shopify Customer Accounts |
| Supabase Postgres | Products, orders, cart, wishlist tables | → Shopify Admin API |
| Supabase RLS | Row-level security policies | → Shopify's native access control |
| Supabase Edge Functions | `send-email` function (stub) | → Shopify Flow / Klaviyo |
| Cloudinary | Image CDN (referenced in env, used by scripts) | → Shopify CDN (`cdn.shopify.com`) |

### Deployment

| Component | Current | Target |
|-----------|---------|--------|
| Hosting | Vercel (SPA) | Shopify hosted |
| Domain | scrunchcreate.com | Same domain, DNS → Shopify |
| SSL | Let's Encrypt via Vercel | Shopify managed SSL |

---

## 3. Repository & Architecture Map

### Directory Structure

```
scrunchcreate/
├── public/
│   └── assets/
│       ├── guides/          # Size guide images
│       └── marketing/       # Banner slider images (slider1-3.png)
├── src/
│   ├── app/                 # App.jsx (router), main.jsx, index.css
│   ├── components/          # Shared UI: NavBar, Footer, Banner, ErrorBoundary,
│   │                        #   FeaturesSection, InstagramSection, ToastContext, TrustBadges
│   ├── features/
│   │   ├── auth/            # AuthContext (Supabase Auth wrapper)
│   │   ├── cart/            # CartContext, CartDrawer, CouponField,
│   │   │                    #   PaymentMethodSelector, coupon config/utils
│   │   ├── products/        # ProductCard, ProductList, BestSellersSection,
│   │   │                    #   CollectionsSection, KitsSection, FiltersSidebar,
│   │   │                    #   useProductsFilter hook, pricing.js, colorNormalization.js
│   │   └── wishlist/        # WishlistContext (localStorage + Supabase sync)
│   ├── pages/               # Route-level components
│   │   ├── home/            # Home.jsx
│   │   ├── products/        # Products.jsx (collection page)
│   │   ├── product/         # ProductDetail.jsx
│   │   ├── checkout/        # Checkout.jsx
│   │   ├── login/           # Login.jsx
│   │   ├── profile/         # Profile.jsx (dashboard)
│   │   └── [policy pages]/  # Privacy, Terms, Refund
│   ├── services/
│   │   └── api.js           # Core data layer (500+ lines, Supabase + localStorage)
│   └── shared/
│       ├── config/          # supabase.js, adminConfig.js, config.js
│       ├── theme/           # theme.css (design tokens)
│       └── utils/           # whatsappUtils.js, pincodeUtils.js, shuffle.js
├── supabase/
│   ├── config.toml          # Project: scrunchcreate, Postgres 17
│   ├── migrations/          # 6 SQL migration files
│   └── functions/           # send-email (edge function stub)
├── scripts/                 # Seeder/reseed/upload scripts
├── docs/                    # HANDOVER.md, ARCHITECTURE.md, etc.
└── data/
    └── products.json        # Offline/development product catalog fallback
```

### Routing Table

| React Route | Purpose | Shopify Equivalent |
|------------|---------|-------------------|
| `/` | Homepage | `index.liquid` (template) |
| `/products` | All products grid | `/collections/all` |
| `/products/:categorySlug` | Category filter | `/collections/:handle` |
| `/product/:slug` | Product detail | `/products/:handle` |
| `/cart` | Cart page (redirects to drawer) | `/cart` |
| `/checkout` | Custom checkout | Shopify Checkout |
| `/login` | Auth page | `/account/login` |
| `/profile` | User dashboard | `/account` |
| `/wishlist` | Saved items | Custom page or app |
| `/privacy-policy` | Legal | `/pages/privacy-policy` |
| `/terms-and-conditions` | Legal | `/pages/terms-and-conditions` |
| `/refund-policy` | Legal | `/pages/refund-policy` |
| `/order-success` | Confirmation | Shopify thank-you page |
| `/admin` | Admin dashboard | Shopify Admin |

---

## 4. Data Model & Schema Analysis

### Supabase Database Schema

#### `products` Table
- `id` (TEXT PK), `slug` (TEXT UNIQUE), `name` (TEXT), `category` (TEXT)
- `type` (TEXT), `color` (TEXT), `normalized_color` (TEXT), `color_hex` (TEXT)
- `price` (NUMERIC), `offer_price` (NUMERIC), `original_price` (NUMERIC), `discount_percent` (INTEGER)
- `description` (TEXT), `primary_image` (TEXT), `images` (TEXT[]), `available_colors` (TEXT[])
- `variants` (JSONB), `stock` (INTEGER), `badge` (TEXT), `in_stock` (BOOLEAN), `created_at` (TIMESTAMPTZ)

#### `product_variants` Table
- `id` (TEXT PK), `product_id` (TEXT FK→products), `slug` (TEXT), `color` (TEXT)
- `normalized_color` (TEXT), `color_hex` (TEXT), `price` (NUMERIC), `offer_price` (NUMERIC)
- `images` (TEXT[]), `stock` (INTEGER), `in_stock` (BOOLEAN)

#### `orders` Table
- `id` (TEXT PK), `session_id` (TEXT), `user_id` (UUID FK), `items` (JSONB)
- `shipping_address` (JSONB), `contact` (JSONB), `payment` (JSONB)
- `coupon` (TEXT), `coupon_discount` (NUMERIC), `delivery_fee` (NUMERIC), `cod_fee` (NUMERIC), `total` (NUMERIC)
- `status` (TEXT), `tracking_number` (TEXT), `tracking_url` (TEXT), `created_at` (TIMESTAMPTZ)

### Shopify Product Mapping

```
Supabase products.category      → Shopify Collection
Supabase products.type          → Shopify Product Type (or Tag)
Supabase products row           → Shopify Product
Supabase product_variants row   → Shopify Product Variant (Option: Color)
Supabase products.offer_price   → Shopify Variant Price
Supabase products.original_price → Shopify Variant Compare-at Price
Supabase products.stock         → Shopify Inventory Level
Supabase products.images        → Shopify Product Images
```

---

## 5. UI Component → Liquid Section Mapping

### Homepage Sections

| React Component | File | Shopify Section |
|----------------|------|----------------|
| `Banner` | `components/Banner/` | `slideshow.liquid` — 3-slide auto-rotating carousel with desktop image track + mobile gradient hero overlay |
| `FeaturesSection` | `components/FeaturesSection/` | `icon-with-text.liquid` — Trust badges (Handmade, Premium, Secure, Easy Returns) |
| `CollectionsSection` | `features/products/components/CollectionsSection/` | `collection-list.liquid` — Category cards (Scrunchies, Hair Bows, Hampers, etc.) |
| `BestSellersSection` | `features/products/components/BestSellersSection/` | `featured-collection.liquid` — "Customer Favourites" product grid |
| `ProductList` (New Arrivals) | `features/products/components/ProductList/` | `featured-collection.liquid` — Filtered by `isNew` tag |
| `KitsSection` | `features/products/components/KitsSection/` | `custom-liquid.liquid` — 3 hardcoded curated kit cards |
| `InstagramSection` | `components/InstagramSection/` | `instagram.liquid` — Static 4-image UGC grid linking to @scrunch_and_create |

### Design System Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-primary` | `#E78592` | Pink — CTAs, badges, accents |
| `--color-primary-strong` | `#D96B7A` | Hover state pink |
| `--color-secondary` | `#4A1C40` | Deep plum — headings, avatars |
| `--color-surface` | `#FFFFFF` | Background |
| `--color-surface-soft` | `#FAF5F7` | Blush white sections |
| `--color-text-main` | `#2D2024` | Body text |
| `--color-text-muted` | `#8B7D82` | Secondary text |
| `--color-border-soft` | `#F0E8EC` | Borders |
| `--font-heading` | `'Cormorant Garamond', serif` | Headings |
| `--font-body` | `'Plus Jakarta Sans', sans-serif` | Body text |

---

## 6. Business Logic Audit

### Pricing Engine (`pricing.js`)
Contains hard-coded pricing table mapping `(category, type)` → `{ base, mrp, discount }`.
- **Shopify Migration:** Direct variant pricing: `variant.price = offerPrice`, `variant.compare_at_price = originalPrice`.

### Coupon System (`coupons.js`)
- `WELCOME10`: 10% off (min ₹199, max ₹100)
- `FESTIVE20`: 20% off (min ₹499, max ₹200)
- `FLAT50`: Flat ₹50 off (min ₹299)
- `FREESHIP`: Free delivery
- **Shopify Migration:** Native Shopify Discount Codes.

### Shipping & Order Logic
- Free shipping threshold: ₹499 (Standard fee: ₹49, COD surcharge: ₹30).
- Order relay: Currently formatted into structured WhatsApp message deep-linked to +91 73009 69491.
- **Shopify Migration:** Shopify shipping profiles + Razorpay / Shopify Payments + WhatsApp notification app.

---

## 7. Asset & Media Inventory

- **Product Images:** Stored locally in `/assets/products/{category}/{type}/{color}/sc-*.webp`.
- **Marketing Assets:** 3 slider banner images (`slider1-3.png`).
- **Fonts:** Cormorant Garamond (headings) + Plus Jakarta Sans (body).

---

## 8. Third-Party Integrations

- **Supabase Auth & Database:** User auth and Postgres tables → Shopify Customer Accounts + Shopify Admin API.
- **WhatsApp:** `wa.me/917300969491` order conversion → Shopify Order Webhooks / SuperLemon app.
- **Socials:** Instagram (`@scrunch_and_create`), Facebook, Pinterest.

---

## 9. SEO & Routing Analysis

301 redirect mapping is critical for preserving existing indexing:
- `/products` → `/collections/all`
- `/products/:categorySlug` → `/collections/:handle`
- `/product/:slug` → `/products/:handle`
- `/login` → `/account/login`
- `/profile` → `/account`

---

## 10. Production Readiness Assessment

- **SSL & Build:** Current deployment had certificate issues and React hydration lag.
- **Payment processing:** Missing in existing SPA (simulated form + WhatsApp redirect).
- **Core strengths to preserve:** Elegant blush/plum color palette, mobile-first hero banner carousel, quick-view product card modals, and clean mega-menu navigation.

---

## 11. MCP Tooling Status

- **Supabase MCP:** Disabled in config (`mcp_config.json`).
- **Shopify MCP:** None installed; migration will use Shopify CLI / Admin GraphQL & REST APIs.

---

## 12. Risk Register & Recommended Phases

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Pricing discrepancies | High | Double-check import spreadsheets against `pricing.js` table |
| SEO loss from broken links | High | Complete 301 URL redirect map in Shopify navigation |
| WhatsApp flow disruption | Medium | Integrate WhatsApp notification app |
| Wishlist omission | Low | Install Shopify Wishlist app (e.g. Wishlist Plus) |

### Recommended 4-Phase Roadmap
1. **Phase 1 (Foundation):** Setup store, Dawn/Craft base theme, collection schema, product/variant import.
2. **Phase 2 (Theme Customization):** Custom Liquid sections (mega-menu, slider, card swatches, cart drawer).
3. **Phase 3 (Business Logic):** Shipping profiles, coupons, Razorpay integration, customer accounts.
4. **Phase 4 (Launch & Cutover):** 301 redirects, end-to-end checkout testing, DNS cutover.
