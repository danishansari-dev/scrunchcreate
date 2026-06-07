# 🎀 Scrunch & Create — E-commerce Redesign & Rebuild Specification

This document serves as a comprehensive business overview, technical specification, and full product catalog export for **Scrunch & Create**. It is structured to provide other AI models and code generators (such as Cursor, Windsurf, v0, etc.) with everything they need to recreate, redesign, or vibe-code this boutique e-commerce application from scratch.

---

## 1. 📖 What is Scrunch & Create? (About the Business)

**Scrunch & Create** is a boutique, cloud-native direct-to-consumer (D2C) brand specializing in **handmade, high-quality decorative hair accessories, festive wear, and custom gift hampers**.

### Core Value Propositions
- **Artisanal Handcraftsmanship**: Every scrunchie, hair bow, hair clip, and jewellery piece is handmade with meticulous attention to detail.
- **Premium Materials**: The products utilize high-end fabrics, including premium satin, velvet, organza, printed chiffon, and delicate sheer materials.
- **Perfect for Gifting**: The brand caters heavily to gift-givers with curated satin hampers, flower jewellery combos, and festive hair accessory packs.
- **High Visual Vibe**: The business relies on rich aesthetics, premium packaging, and vibrant colors (from rose gold, pastel mint, and lilac, to deep burgundy and olive green).

### Core Customer Persona & Journey
1. **Browse**: Customers explore high-density product cards showcasing vibrant, color-specific variants.
2. **Filter & Refine**: Customers easily toggle categories (Scrunchies, Hairbows, Hairclips, Hampers, Flower Jewellery) and sub-types (Tulip, Jimmychoo, Satin, Classic, etc.).
3. **Cart & Wishlist**: A seamless cart interaction that holds the products.
4. **Checkout & Personalization**: Order data is saved, with deep links redirecting to **WhatsApp Chat** with the boutique owner to finalize color preferences, custom gift notes, and local shipping options.

---

## 2. 🎨 Brand Identity & Redesign Goals

To stand out as a premium boutique store, the redesign should incorporate the following design aesthetics:

### Visual Language & Theme
- **Chic Boutique Palette**: Soft pastels (Lilac, Mint, Peach, Champagne Gold) coupled with clean dark-mode contrast. Avoid generic, harsh primary colors.
- **Glassmorphism & Texture**: Use subtle blurs, translucent cards, thin borders, and organic shadows to mirror the soft, luxurious texture of the hair accessories.
- **Micro-Animations**: Implement buttery-smooth animations using **Framer Motion** or CSS transitions (e.g., hover scaling, slide-in carts, smooth category filter transitions).
- **Zero Placeholders**: The catalog must render high-definition WebP images served via a CDN (Cloudinary) or local storage to represent the real products accurately.

### Enhanced Features for the Redesign
1. **Persistent Server-Side Cart**: Replace the transient in-memory cart with a fully persistent cart saved in MongoDB/Redis per user session.
2. **Offline Resilience with Fallback Banner**: Preserve the smart frontend catalog fallback (loading from a local JSON) but add a subtle, non-intrusive offline indicator badge.
3. **Product Pagination & Virtual Lists**: Optimize the products listing endpoint with pagination to handle future catalog expansions efficiently.
4. **Secured Infrastructure**: Implement rate-limiting and security headers (using Helmet) on the backend server.

---

## 3. 🏗️ High-Level Technical Architecture

```mermaid
graph TD
    User([Customer Web Browser]) -->|HTTPS / Axios| Frontend[React 19 + Vite 7 SPA]
    Frontend -->|Served via| Vercel[Vercel Edge Network]
    Frontend -->|Images served via| CDN[Cloudinary Image CDN]
    
    Frontend -->|JWT Authentication / CRUD API| Backend[Node.js + Express REST API]
    Backend -->|Hosted on| Render[Render Container Service]
    
    Backend -->|Mongoose ODM| DB[(MongoDB Atlas Cloud)]
    
    Frontend -.->|API Down / Offline Fallback| LocalJSON[Local Cached products.json]
    Frontend -->|Checkout Redirect| WhatsApp[WhatsApp Order deep-linking]
```

### Tech Stack Summary
- **Frontend**: React 19, Vite 7, CSS Modules, React Router Dom, Framer Motion, Axios (with JWT interceptors).
- **Backend**: Node.js, Express, Mongoose ODM, jsonwebtoken (JWT-based session authentication), bcryptjs (password hashing with 12 salt rounds), express-async-errors.
- **Database & Media**: MongoDB Atlas (Cloud Database), Cloudinary CDN (Organized image storage in WebP formats).

---

## 4. 🗄️ Database Schemas & REST API

### 4.1 Product Schema
Each variant of a product (e.g. Satin Bow in "black" vs "red") is stored as an individual item or represented within a parent-child relationship. In the current iteration, products are defined with:
- `name`: (String, e.g., "Satin Hairbow — black")
- `description`: (String, including parent + variant details)
- `price`: (Number, auto-calculated selling price)
- `category`: (String, Enum: `scrunchie` | `hairbow` | `hairclip` | `gifthamper` | `flowerjewellery` | `earring` | `paraandi`)
- `stock`: (Number, default 100)
- `images`: (Array of Strings, full CDN WebP URLs)

### 4.2 Dynamic Pricing Table (Pricing Logic)
The brand uses a specific pricing table matching categories and subtypes. Additionally, MRP is calculated using a dynamic markup and rounded to a "nice" price (ending in 9 or 99):
- **Scrunchies**: Classic (₹40), Tulip (₹69), Tulip Sheer (₹79), Satin Mini (₹30), Satin Printed (₹40), Combos (₹99 - ₹1599). Default: ₹40. Markup: 20%.
- **Hairbows**: Jimmy Choo (₹99), Satin (₹79), Sheer Satin (₹79), Velvet (₹79), Scarf (₹99), Satin Princes (₹79), Satin Tulip (₹89), Satin Mini (₹49), Printed Mini (₹59), Combos (₹399). Default: ₹79. Markup: 20%.
- **Gift Hampers**: Satin Hamper (₹699), Glimmer/Grace (₹189). Default: ₹199. Markup: 15%.
- **Flower Jewellery**: Rose/Combos (₹399). Default: ₹399. Markup: 15%.
- **Earrings**: Default ₹99. Markup: 25%.
- **Paraandis**: Default ₹399. Markup: 15%.

### 4.3 API Endpoints Reference
- **Health Check**: `GET /api/health`
- **Authentication**:
  - `POST /api/auth/register` (Register user, hash passwords with 12 rounds)
  - `POST /api/auth/login` (Login user, return stateless JWT)
- **Products**:
  - `GET /api/products` (List all products)
  - `GET /api/products/:id` (Get specific product details)
- **Cart (Requires JWT)**:
  - `GET /api/cart` (Fetch user cart)
  - `POST /api/cart` (Add product to cart)
  - `PUT /api/cart/:productId` (Update quantity)
  - `DELETE /api/cart/:productId` (Remove product)
  - `DELETE /api/cart` (Clear cart)
- **Orders (Requires JWT)**:
  - `POST /api/orders` (Place order, saving details before WhatsApp handover)
  - `GET /api/orders/my` (Fetch authenticated user's order history)

---

## 5. 📦 Complete Product Catalog Details

Below is the fully extracted catalog of all products, categories, types, variant colors, description specs, and official pricing.

# Scrunch & Create — Product Catalog Export

This catalog contains **20** top-level products, expanding to **154** distinct variants when flattened by color.

## Summary Table

| Category | Products Count | Variant Count | Subtypes | Price Range (₹) |
| --- | --- | --- | --- | --- |
| **flowerjewellery** | 1 | 1 | `rose` | ₹399 - ₹399 |
| **gifthamper** | 2 | 13 | `satin-hamper` | ₹199 - ₹699 |
| **hairbow** | 10 | 102 | `combo, jimmychoo, satin, satin-mini, satin-princes, satin-tulip, scarf, sheer-satin, velvet, printed-mini` | ₹49 - ₹399 |
| **scrunchie** | 6 | 33 | `classic, combo, satin-mini, tulip, tulip-sheer, satin-printed` | ₹30 - ₹99 |
| **hairclip** | 1 | 5 | `rose` | ₹99 - ₹99 |

---

## Category: FLOWERJEWELLERY

### Rose Flowerjewellery
- **ID**: `flowerjewellery-rose`
- **Slug**: `flowerjewellery-rose`
- **Type**: `rose`
- **Selling Price (Offer)**: ₹399
- **MRP (Original Price)**: ₹469 (~15% off)
- **Description**: Beautiful handmade Rose Flowerjewellery.
- **Variants (1)**:
  - **Color**: `yellow` (ID: `rose-flowerjewellery-yellow`, Slug: `rose-flowerjewellery-yellow`)
    - **Images (8)**:
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-2.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-3.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-4.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-5.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-6.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-7.webp`
      - `https://scrunchcreate.com/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-8.webp`


## Category: GIFTHAMPER

### Gifthamper
- **ID**: `gifthamper`
- **Slug**: `gifthamper`
- **Type**: `None`
- **Selling Price (Offer)**: ₹199
- **MRP (Original Price)**: ₹239 (~17% off)
- **Description**: Perfect for gifting.
- **Variants (1)**:
  - **Color**: `Standard` (ID: `gifthamper`, Slug: `gifthamper`)
    - **Images (22)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-1.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-10.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-11.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-12.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-13.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-14.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-15.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-16.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-17.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-18.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-19.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-2.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-20.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-21.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-22.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-3.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-4.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-5.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-6.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-7.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-8.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/sc-gifthamper-9.webp`

### Satin Hamper Gifthamper
- **ID**: `gifthamper-satin-hamper`
- **Slug**: `gifthamper-satin-hamper`
- **Type**: `satin-hamper`
- **Selling Price (Offer)**: ₹699
- **MRP (Original Price)**: ₹899 (~22% off)
- **Description**: Elegant Satin Hamper.
- **Variants (12)**:
  - **Color**: `black` (ID: `satin-hamper-gifthamper-black`, Slug: `satin-hamper-gifthamper-black`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/black/sc-gifthamper-satin-hamper-black-1.webp`
  - **Color**: `cream` (ID: `satin-hamper-gifthamper-cream`, Slug: `satin-hamper-gifthamper-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/cream/sc-gifthamper-satin-hamper-cream-1.webp`
  - **Color**: `grey` (ID: `satin-hamper-gifthamper-grey`, Slug: `satin-hamper-gifthamper-grey`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/grey/sc-gifthamper-satin-hamper-grey-1.webp`
  - **Color**: `light-yellow` (ID: `satin-hamper-gifthamper-light-yellow`, Slug: `satin-hamper-gifthamper-light-yellow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/light-yellow/sc-gifthamper-satin-hamper-light-yellow-1.webp`
  - **Color**: `lilac` (ID: `satin-hamper-gifthamper-lilac`, Slug: `satin-hamper-gifthamper-lilac`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/lilac/sc-gifthamper-satin-hamper-lilac-1.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/lilac/sc-gifthamper-satin-hamper-lilac-2.webp`
  - **Color**: `magenta` (ID: `satin-hamper-gifthamper-magenta`, Slug: `satin-hamper-gifthamper-magenta`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/magenta/sc-gifthamper-satin-hamper-magenta-1.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/magenta/sc-gifthamper-satin-hamper-magenta-2.webp`
  - **Color**: `peach` (ID: `satin-hamper-gifthamper-peach`, Slug: `satin-hamper-gifthamper-peach`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/peach/sc-gifthamper-satin-hamper-peach-1.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/peach/sc-gifthamper-satin-hamper-peach-2.webp`
  - **Color**: `petrol-blue` (ID: `satin-hamper-gifthamper-petrol-blue`, Slug: `satin-hamper-gifthamper-petrol-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/petrol-blue/sc-gifthamper-satin-hamper-petrol-blue-1.webp`
  - **Color**: `pistachio` (ID: `satin-hamper-gifthamper-pistachio`, Slug: `satin-hamper-gifthamper-pistachio`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/pistachio/sc-gifthamper-satin-hamper-pistachio-1.webp`
  - **Color**: `red` (ID: `satin-hamper-gifthamper-red`, Slug: `satin-hamper-gifthamper-red`)
    - **Images (5)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/red/sc-gifthamper-satin-hamper-red-1.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/red/sc-gifthamper-satin-hamper-red-2.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/red/sc-gifthamper-satin-hamper-red-3.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/red/sc-gifthamper-satin-hamper-red-4.webp`
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/red/sc-gifthamper-satin-hamper-red-5.webp`
  - **Color**: `sky-blue` (ID: `satin-hamper-gifthamper-sky-blue`, Slug: `satin-hamper-gifthamper-sky-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/sky-blue/sc-gifthamper-satin-hamper-sky-blue-1.webp`
  - **Color**: `wine` (ID: `satin-hamper-gifthamper-wine`, Slug: `satin-hamper-gifthamper-wine`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/gifthamper/satin-hamper/wine/sc-gifthamper-satin-hamper-wine-1.webp`


## Category: HAIRBOW

### Combo Hairbow
- **ID**: `hairbow-combo`
- **Slug**: `hairbow-combo`
- **Type**: `combo`
- **Selling Price (Offer)**: ₹399
- **MRP (Original Price)**: ₹499 (~20% off)
- **Description**: Stylish combo hairbow sets.
- **Variants (9)**:
  - **Color**: `Standard` (ID: `combo-hairbow`, Slug: `combo-hairbow`)
    - **Images (33)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-10.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-11.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-12.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-13.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-14.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-15.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-16.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-17.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-18.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-19.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-20.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-21.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-22.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-23.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-24.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-25.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-26.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-27.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-28.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-29.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-30.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-31.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-32.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-8.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/sc-hairbow-combo-9.webp`
  - **Color**: `satin-tulip` (ID: `combo-hairbow-satin-tulip`, Slug: `combo-hairbow-satin-tulip`)
    - **Images (7)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-7.webp`
  - **Color**: `3-layered` (ID: `combo-hairbow-3-layered`, Slug: `combo-hairbow-3-layered`)
    - **Images (5)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/3-layered-bow-combo/sc-hairbow-combo-3-layered-bow-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/3-layered-bow-combo/sc-hairbow-combo-3-layered-bow-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/3-layered-bow-combo/sc-hairbow-combo-3-layered-bow-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/3-layered-bow-combo/sc-hairbow-combo-3-layered-bow-combo-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/3-layered-bow-combo/sc-hairbow-combo-3-layered-bow-combo-5.webp`
  - **Color**: `jimmi-choo` (ID: `combo-hairbow-jimmi-choo`, Slug: `combo-hairbow-jimmi-choo`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/jimmi-choo-bow-combo/sc-hairbow-combo-jimmi-choo-bow-combo-1.webp`
  - **Color**: `mini-bow` (ID: `combo-hairbow-mini-bow`, Slug: `combo-hairbow-mini-bow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/mini-bow-combo/sc-hairbow-combo-mini-bow-combo-1.webp`
  - **Color**: `pigtail` (ID: `combo-hairbow-pigtail`, Slug: `combo-hairbow-pigtail`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/pigtail-bow-combo/sc-hairbow-combo-pigtail-bow-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/pigtail-bow-combo/sc-hairbow-combo-pigtail-bow-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/pigtail-bow-combo/sc-hairbow-combo-pigtail-bow-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/pigtail-bow-combo/sc-hairbow-combo-pigtail-bow-combo-4.webp`
  - **Color**: `princess` (ID: `combo-hairbow-princess`, Slug: `combo-hairbow-princess`)
    - **Images (5)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/princess-bow-combo/sc-hairbow-combo-princess-bow-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/princess-bow-combo/sc-hairbow-combo-princess-bow-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/princess-bow-combo/sc-hairbow-combo-princess-bow-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/princess-bow-combo/sc-hairbow-combo-princess-bow-combo-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/princess-bow-combo/sc-hairbow-combo-princess-bow-combo-5.webp`
  - **Color**: `scarf` (ID: `combo-hairbow-scarf`, Slug: `combo-hairbow-scarf`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/scarf-bow-combo/sc-hairbow-combo-scarf-bow-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/scarf-bow-combo/sc-hairbow-combo-scarf-bow-combo-2.webp`
  - **Color**: `tulip` (ID: `combo-hairbow-tulip`, Slug: `combo-hairbow-tulip`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/combo/tulip-bow-combo/sc-hairbow-combo-tulip-bow-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/tulip-bow-combo/sc-hairbow-combo-tulip-bow-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/tulip-bow-combo/sc-hairbow-combo-tulip-bow-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/combo/tulip-bow-combo/sc-hairbow-combo-tulip-bow-combo-4.webp`

### Jimmychoo Hairbow
- **ID**: `hairbow-jimmychoo`
- **Slug**: `hairbow-jimmychoo`
- **Type**: `jimmychoo`
- **Selling Price (Offer)**: ₹99
- **MRP (Original Price)**: ₹129 (~23% off)
- **Description**: Premium Jimmychoo hairbows.
- **Variants (8)**:
  - **Color**: `combo` (ID: `jimmychoo-hairbow-combo`, Slug: `jimmychoo-hairbow-combo`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/combo/sc-hairbow-jimmychoo-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/combo/sc-hairbow-jimmychoo-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/combo/sc-hairbow-jimmychoo-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/combo/sc-hairbow-jimmychoo-combo-4.webp`
  - **Color**: `light-mint` (ID: `jimmychoo-hairbow-light-mint`, Slug: `jimmychoo-hairbow-light-mint`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/light-mint/sc-hairbow-jimmychoo-light-mint-1.webp`
  - **Color**: `maroon` (ID: `jimmychoo-hairbow-maroon`, Slug: `jimmychoo-hairbow-maroon`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/maroon/sc-hairbow-jimmychoo-maroon-1.webp`
  - **Color**: `olive-green` (ID: `jimmychoo-hairbow-olive-green`, Slug: `jimmychoo-hairbow-olive-green`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/olive-green/sc-hairbow-jimmychoo-olive-green-1.webp`
  - **Color**: `peach-pink` (ID: `jimmychoo-hairbow-peach-pink`, Slug: `jimmychoo-hairbow-peach-pink`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/peach-pink/sc-hairbow-jimmychoo-peach-pink-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/peach-pink/sc-hairbow-jimmychoo-peach-pink-2.webp`
  - **Color**: `purple` (ID: `jimmychoo-hairbow-purple`, Slug: `jimmychoo-hairbow-purple`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/purple/sc-hairbow-jimmychoo-purple-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/purple/sc-hairbow-jimmychoo-purple-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/purple/sc-hairbow-jimmychoo-purple-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/purple/sc-hairbow-jimmychoo-purple-4.webp`
  - **Color**: `sky-blue` (ID: `jimmychoo-hairbow-sky-blue`, Slug: `jimmychoo-hairbow-sky-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/sky-blue/sc-hairbow-jimmychoo-sky-blue-1.webp`
  - **Color**: `teal` (ID: `jimmychoo-hairbow-teal`, Slug: `jimmychoo-hairbow-teal`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/jimmychoo/teal/sc-hairbow-jimmychoo-teal-1.webp`

### Satin Hairbow
- **ID**: `hairbow-satin`
- **Slug**: `hairbow-satin`
- **Type**: `satin`
- **Selling Price (Offer)**: ₹79
- **MRP (Original Price)**: ₹99 (~20% off)
- **Description**: Classic Satin Hairbow.
- **Variants (16)**:
  - **Color**: `black` (ID: `satin-hairbow-black`, Slug: `satin-hairbow-black`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/black/sc-hairbow-satin-black-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin/black/sc-hairbow-satin-black-2.webp`
  - **Color**: `brown` (ID: `satin-hairbow-brown`, Slug: `satin-hairbow-brown`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/brown/sc-hairbow-satin-brown-1.webp`
  - **Color**: `cream` (ID: `satin-hairbow-cream`, Slug: `satin-hairbow-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/cream/sc-hairbow-satin-cream-1.webp`
  - **Color**: `green` (ID: `satin-hairbow-green`, Slug: `satin-hairbow-green`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/green/sc-hairbow-satin-green-1.webp`
  - **Color**: `grey` (ID: `satin-hairbow-grey`, Slug: `satin-hairbow-grey`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/grey/sc-hairbow-satin-grey-1.webp`
  - **Color**: `lilac` (ID: `satin-hairbow-lilac`, Slug: `satin-hairbow-lilac`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/lilac/sc-hairbow-satin-lilac-1.webp`
  - **Color**: `magenta` (ID: `satin-hairbow-magenta`, Slug: `satin-hairbow-magenta`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/magenta/sc-hairbow-satin-magenta-1.webp`
  - **Color**: `metallic-olive` (ID: `satin-hairbow-metallic-olive`, Slug: `satin-hairbow-metallic-olive`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/metallic-olive/sc-hairbow-satin-metallic-olive-1.webp`
  - **Color**: `peach-cream` (ID: `satin-hairbow-peach-cream`, Slug: `satin-hairbow-peach-cream`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/peach-cream/sc-hairbow-satin-peach-cream-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin/peach-cream/sc-hairbow-satin-peach-cream-2.webp`
  - **Color**: `peach-pink` (ID: `satin-hairbow-peach-pink`, Slug: `satin-hairbow-peach-pink`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/peach-pink/sc-hairbow-satin-peach-pink-1.webp`
  - **Color**: `petrol` (ID: `satin-hairbow-petrol`, Slug: `satin-hairbow-petrol`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/petrol/sc-hairbow-satin-petrol-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin/petrol/sc-hairbow-satin-petrol-2.webp`
  - **Color**: `red` (ID: `satin-hairbow-red`, Slug: `satin-hairbow-red`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/red/sc-hairbow-satin-red-1.webp`
  - **Color**: `sky-blue` (ID: `satin-hairbow-sky-blue`, Slug: `satin-hairbow-sky-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/sky-blue/sc-hairbow-satin-sky-blue-1.webp`
  - **Color**: `white` (ID: `satin-hairbow-white`, Slug: `satin-hairbow-white`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/white/sc-hairbow-satin-white-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin/white/sc-hairbow-satin-white-2.webp`
  - **Color**: `wine` (ID: `satin-hairbow-wine`, Slug: `satin-hairbow-wine`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/wine/sc-hairbow-satin-wine-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin/wine/sc-hairbow-satin-wine-2.webp`
  - **Color**: `yellow` (ID: `satin-hairbow-yellow`, Slug: `satin-hairbow-yellow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin/yellow/sc-hairbow-satin-yellow-1.webp`

### Satin Mini Hairbow
- **ID**: `hairbow-satin-mini`
- **Slug**: `hairbow-satin-mini`
- **Type**: `satin-mini`
- **Selling Price (Offer)**: ₹49
- **MRP (Original Price)**: ₹69 (~29% off)
- **Description**: Cute Satin Mini Hairbows.
- **Variants (15)**:
  - **Color**: `black` (ID: `satin-mini-hairbow-black`, Slug: `satin-mini-hairbow-black`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/black/sc-hairbow-satin-mini-black-1.webp`
  - **Color**: `chocolate` (ID: `satin-mini-hairbow-chocolate`, Slug: `satin-mini-hairbow-chocolate`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/chocolate/sc-hairbow-satin-mini-chocolate-1.webp`
  - **Color**: `combo` (ID: `satin-mini-hairbow-combo`, Slug: `satin-mini-hairbow-combo`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/combo/sc-hairbow-satin-mini-combo-1.webp`
  - **Color**: `cream` (ID: `satin-mini-hairbow-cream`, Slug: `satin-mini-hairbow-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/cream/sc-hairbow-satin-mini-cream-1.webp`
  - **Color**: `grey` (ID: `satin-mini-hairbow-grey`, Slug: `satin-mini-hairbow-grey`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/grey/sc-hairbow-satin-mini-grey-1.webp`
  - **Color**: `lilac` (ID: `satin-mini-hairbow-lilac`, Slug: `satin-mini-hairbow-lilac`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/lilac/sc-hairbow-satin-mini-lilac-1.webp`
  - **Color**: `magenta` (ID: `satin-mini-hairbow-magenta`, Slug: `satin-mini-hairbow-magenta`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/magenta/sc-hairbow-satin-mini-magenta-1.webp`
  - **Color**: `peach` (ID: `satin-mini-hairbow-peach`, Slug: `satin-mini-hairbow-peach`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/peach/sc-hairbow-satin-mini-peach-1.webp`
  - **Color**: `petrol-blue` (ID: `satin-mini-hairbow-petrol-blue`, Slug: `satin-mini-hairbow-petrol-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/petrol-blue/sc-hairbow-satin-mini-petrol-blue-1.webp`
  - **Color**: `pistachio` (ID: `satin-mini-hairbow-pistachio`, Slug: `satin-mini-hairbow-pistachio`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/pistachio/sc-hairbow-satin-mini-pistachio-1.webp`
  - **Color**: `red` (ID: `satin-mini-hairbow-red`, Slug: `satin-mini-hairbow-red`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/red/sc-hairbow-satin-mini-red-1.webp`
  - **Color**: `sky-blue` (ID: `satin-mini-hairbow-sky-blue`, Slug: `satin-mini-hairbow-sky-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/sky-blue/sc-hairbow-satin-mini-sky-blue-1.webp`
  - **Color**: `white` (ID: `satin-mini-hairbow-white`, Slug: `satin-mini-hairbow-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/white/sc-hairbow-satin-mini-white-1.webp`
  - **Color**: `wine` (ID: `satin-mini-hairbow-wine`, Slug: `satin-mini-hairbow-wine`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/wine/sc-hairbow-satin-mini-wine-1.webp`
  - **Color**: `yellow` (ID: `satin-mini-hairbow-yellow`, Slug: `satin-mini-hairbow-yellow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-mini/yellow/sc-hairbow-satin-mini-yellow-1.webp`

### Satin Princes Hairbow
- **ID**: `hairbow-satin-princes`
- **Slug**: `hairbow-satin-princes`
- **Type**: `satin-princes`
- **Selling Price (Offer)**: ₹79
- **MRP (Original Price)**: ₹99 (~20% off)
- **Description**: Elegant Satin Princes Hairbows.
- **Variants (14)**:
  - **Color**: `black` (ID: `satin-princes-hairbow-black`, Slug: `satin-princes-hairbow-black`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/black/sc-hairbow-satin-princes-black-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/black/sc-hairbow-satin-princes-black-2.webp`
  - **Color**: `chocolate` (ID: `satin-princes-hairbow-chocolate`, Slug: `satin-princes-hairbow-chocolate`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/chocolate/sc-hairbow-satin-princes-chocolate-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/chocolate/sc-hairbow-satin-princes-chocolate-2.webp`
  - **Color**: `combo` (ID: `satin-princes-hairbow-combo`, Slug: `satin-princes-hairbow-combo`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/combo/sc-hairbow-satin-princes-combo-6.webp`
  - **Color**: `cream` (ID: `satin-princes-hairbow-cream`, Slug: `satin-princes-hairbow-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/cream/sc-hairbow-satin-princes-cream-1.webp`
  - **Color**: `grey` (ID: `satin-princes-hairbow-grey`, Slug: `satin-princes-hairbow-grey`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/grey/sc-hairbow-satin-princes-grey-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/grey/sc-hairbow-satin-princes-grey-2.webp`
  - **Color**: `light-yellow` (ID: `satin-princes-hairbow-light-yellow`, Slug: `satin-princes-hairbow-light-yellow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/light-yellow/sc-hairbow-satin-princes-light-yellow-1.webp`
  - **Color**: `lilac` (ID: `satin-princes-hairbow-lilac`, Slug: `satin-princes-hairbow-lilac`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/lilac/sc-hairbow-satin-princes-lilac-1.webp`
  - **Color**: `magenta` (ID: `satin-princes-hairbow-magenta`, Slug: `satin-princes-hairbow-magenta`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/magenta/sc-hairbow-satin-princes-magenta-1.webp`
  - **Color**: `peach` (ID: `satin-princes-hairbow-peach`, Slug: `satin-princes-hairbow-peach`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/peach/sc-hairbow-satin-princes-peach-1.webp`
  - **Color**: `petrol-blue` (ID: `satin-princes-hairbow-petrol-blue`, Slug: `satin-princes-hairbow-petrol-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/petrol-blue/sc-hairbow-satin-princes-petrol-blue-1.webp`
  - **Color**: `pistachio` (ID: `satin-princes-hairbow-pistachio`, Slug: `satin-princes-hairbow-pistachio`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/pistachio/sc-hairbow-satin-princes-pistachio-1.webp`
  - **Color**: `red` (ID: `satin-princes-hairbow-red`, Slug: `satin-princes-hairbow-red`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/red/sc-hairbow-satin-princes-red-1.webp`
  - **Color**: `sky-blue` (ID: `satin-princes-hairbow-sky-blue`, Slug: `satin-princes-hairbow-sky-blue`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/sky-blue/sc-hairbow-satin-princes-sky-blue-1.webp`
  - **Color**: `white` (ID: `satin-princes-hairbow-white`, Slug: `satin-princes-hairbow-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-princes/white/sc-hairbow-satin-princes-white-1.webp`

### Satin Tulip Hairbow
- **ID**: `hairbow-satin-tulip`
- **Slug**: `hairbow-satin-tulip`
- **Type**: `satin-tulip`
- **Selling Price (Offer)**: ₹89
- **MRP (Original Price)**: ₹119 (~25% off)
- **Description**: Lovely Satin Tulip Hairbows.
- **Variants (14)**:
  - **Color**: `black` (ID: `satin-tulip-hairbow-black`, Slug: `satin-tulip-hairbow-black`)
    - **Images (3)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/black/sc-hairbow-satin-tulip-black-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/black/sc-hairbow-satin-tulip-black-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/black/sc-hairbow-satin-tulip-black-3.webp`
  - **Color**: `chocolate` (ID: `satin-tulip-hairbow-chocolate`, Slug: `satin-tulip-hairbow-chocolate`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/chocolate/sc-hairbow-satin-tulip-chocolate-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/chocolate/sc-hairbow-satin-tulip-chocolate-2.webp`
  - **Color**: `cream` (ID: `satin-tulip-hairbow-cream`, Slug: `satin-tulip-hairbow-cream`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/cream/sc-hairbow-satin-tulip-cream-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/cream/sc-hairbow-satin-tulip-cream-2.webp`
  - **Color**: `grey` (ID: `satin-tulip-hairbow-grey`, Slug: `satin-tulip-hairbow-grey`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/grey/sc-hairbow-satin-tulip-grey-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/grey/sc-hairbow-satin-tulip-grey-2.webp`
  - **Color**: `light-yellow` (ID: `satin-tulip-hairbow-light-yellow`, Slug: `satin-tulip-hairbow-light-yellow`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/light-yellow/sc-hairbow-satin-tulip-light-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/light-yellow/sc-hairbow-satin-tulip-light-yellow-2.webp`
  - **Color**: `lilac` (ID: `satin-tulip-hairbow-lilac`, Slug: `satin-tulip-hairbow-lilac`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/lilac/sc-hairbow-satin-tulip-lilac-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/lilac/sc-hairbow-satin-tulip-lilac-2.webp`
  - **Color**: `magenta` (ID: `satin-tulip-hairbow-magenta`, Slug: `satin-tulip-hairbow-magenta`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/magenta/sc-hairbow-satin-tulip-magenta-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/magenta/sc-hairbow-satin-tulip-magenta-2.webp`
  - **Color**: `peach` (ID: `satin-tulip-hairbow-peach`, Slug: `satin-tulip-hairbow-peach`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/peach/sc-hairbow-satin-tulip-peach-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/peach/sc-hairbow-satin-tulip-peach-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/peach/sc-hairbow-satin-tulip-peach-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/peach/sc-hairbow-satin-tulip-peach-4.webp`
  - **Color**: `petrol-blue` (ID: `satin-tulip-hairbow-petrol-blue`, Slug: `satin-tulip-hairbow-petrol-blue`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/petrol-blue/sc-hairbow-satin-tulip-petrol-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/petrol-blue/sc-hairbow-satin-tulip-petrol-blue-2.webp`
  - **Color**: `pistachio` (ID: `satin-tulip-hairbow-pistachio`, Slug: `satin-tulip-hairbow-pistachio`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/pistachio/sc-hairbow-satin-tulip-pistachio-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/pistachio/sc-hairbow-satin-tulip-pistachio-2.webp`
  - **Color**: `red` (ID: `satin-tulip-hairbow-red`, Slug: `satin-tulip-hairbow-red`)
    - **Images (3)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/red/sc-hairbow-satin-tulip-red-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/red/sc-hairbow-satin-tulip-red-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/red/sc-hairbow-satin-tulip-red-3.webp`
  - **Color**: `sky-blue` (ID: `satin-tulip-hairbow-sky-blue`, Slug: `satin-tulip-hairbow-sky-blue`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/sky-blue/sc-hairbow-satin-tulip-sky-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/sky-blue/sc-hairbow-satin-tulip-sky-blue-2.webp`
  - **Color**: `white` (ID: `satin-tulip-hairbow-white`, Slug: `satin-tulip-hairbow-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/white/sc-hairbow-satin-tulip-white-1.webp`
  - **Color**: `wine` (ID: `satin-tulip-hairbow-wine`, Slug: `satin-tulip-hairbow-wine`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/wine/sc-hairbow-satin-tulip-wine-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/satin-tulip/wine/sc-hairbow-satin-tulip-wine-2.webp`

### Scarf Hairbow
- **ID**: `hairbow-scarf`
- **Slug**: `hairbow-scarf`
- **Type**: `scarf`
- **Selling Price (Offer)**: ₹99
- **MRP (Original Price)**: ₹129 (~23% off)
- **Description**: Stylish Scarf Hairbows.
- **Variants (14)**:
  - **Color**: `black` (ID: `scarf-hairbow-black`, Slug: `scarf-hairbow-black`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/black/sc-hairbow-scarf-black-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/black/sc-hairbow-scarf-black-2.webp`
  - **Color**: `brown` (ID: `scarf-hairbow-brown`, Slug: `scarf-hairbow-brown`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/brown/sc-hairbow-scarf-brown-1.webp`
  - **Color**: `cream` (ID: `scarf-hairbow-cream`, Slug: `scarf-hairbow-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/cream/sc-hairbow-scarf-cream-1.webp`
  - **Color**: `green` (ID: `scarf-hairbow-green`, Slug: `scarf-hairbow-green`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/green/sc-hairbow-scarf-green-1.webp`
  - **Color**: `grey` (ID: `scarf-hairbow-grey`, Slug: `scarf-hairbow-grey`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/grey/sc-hairbow-scarf-grey-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/grey/sc-hairbow-scarf-grey-2.webp`
  - **Color**: `lavender` (ID: `scarf-hairbow-lavender`, Slug: `scarf-hairbow-lavender`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/lavender/sc-hairbow-scarf-lavender-1.webp`
  - **Color**: `magenta` (ID: `scarf-hairbow-magenta`, Slug: `scarf-hairbow-magenta`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/magenta/sc-hairbow-scarf-magenta-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/magenta/sc-hairbow-scarf-magenta-2.webp`
  - **Color**: `peach` (ID: `scarf-hairbow-peach`, Slug: `scarf-hairbow-peach`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/peach/sc-hairbow-scarf-peach-1.webp`
  - **Color**: `petrol` (ID: `scarf-hairbow-petrol`, Slug: `scarf-hairbow-petrol`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/petrol/sc-hairbow-scarf-petrol-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/petrol/sc-hairbow-scarf-petrol-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/petrol/sc-hairbow-scarf-petrol-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/petrol/sc-hairbow-scarf-petrol-4.webp`
  - **Color**: `red` (ID: `scarf-hairbow-red`, Slug: `scarf-hairbow-red`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/red/sc-hairbow-scarf-red-1.webp`
  - **Color**: `sky-blue` (ID: `scarf-hairbow-sky-blue`, Slug: `scarf-hairbow-sky-blue`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/sky-blue/sc-hairbow-scarf-sky-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/sky-blue/sc-hairbow-scarf-sky-blue-2.webp`
  - **Color**: `white` (ID: `scarf-hairbow-white`, Slug: `scarf-hairbow-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/white/sc-hairbow-scarf-white-1.webp`
  - **Color**: `wine` (ID: `scarf-hairbow-wine`, Slug: `scarf-hairbow-wine`)
    - **Images (3)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/wine/sc-hairbow-scarf-wine-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/wine/sc-hairbow-scarf-wine-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/wine/sc-hairbow-scarf-wine-3.webp`
  - **Color**: `yellow` (ID: `scarf-hairbow-yellow`, Slug: `scarf-hairbow-yellow`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/scarf/yellow/sc-hairbow-scarf-yellow-6.webp`

### Sheer Satin Hairbow
- **ID**: `hairbow-sheer-satin`
- **Slug**: `hairbow-sheer-satin`
- **Type**: `sheer-satin`
- **Selling Price (Offer)**: ₹79
- **MRP (Original Price)**: ₹99 (~20% off)
- **Description**: Delicate Sheer Satin Hairbows.
- **Variants (9)**:
  - **Color**: `beige` (ID: `sheer-satin-hairbow-beige`, Slug: `sheer-satin-hairbow-beige`)
    - **Images (11)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-10.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-11.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-8.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/beige/sc-hairbow-sheer-satin-beige-9.webp`
  - **Color**: `golden-brown` (ID: `sheer-satin-hairbow-golden-brown`, Slug: `sheer-satin-hairbow-golden-brown`)
    - **Images (8)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/golden-brown/sc-hairbow-sheer-satin-golden-brown-8.webp`
  - **Color**: `lavender` (ID: `sheer-satin-hairbow-lavender`, Slug: `sheer-satin-hairbow-lavender`)
    - **Images (9)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-8.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/lavender/sc-hairbow-sheer-satin-lavender-9.webp`
  - **Color**: `magenta` (ID: `sheer-satin-hairbow-magenta`, Slug: `sheer-satin-hairbow-magenta`)
    - **Images (13)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-10.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-11.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-12.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-13.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-8.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/magenta/sc-hairbow-sheer-satin-magenta-9.webp`
  - **Color**: `maroon` (ID: `sheer-satin-hairbow-maroon`, Slug: `sheer-satin-hairbow-maroon`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/maroon/sc-hairbow-sheer-satin-maroon-6.webp`
  - **Color**: `mint-green` (ID: `sheer-satin-hairbow-mint-green`, Slug: `sheer-satin-hairbow-mint-green`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/mint-green/sc-hairbow-sheer-satin-mint-green-6.webp`
  - **Color**: `navy-blue` (ID: `sheer-satin-hairbow-navy-blue`, Slug: `sheer-satin-hairbow-navy-blue`)
    - **Images (10)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-10.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-8.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/navy-blue/sc-hairbow-sheer-satin-navy-blue-9.webp`
  - **Color**: `olive-green` (ID: `sheer-satin-hairbow-olive-green`, Slug: `sheer-satin-hairbow-olive-green`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/olive-green/sc-hairbow-sheer-satin-olive-green-6.webp`
  - **Color**: `yellow` (ID: `sheer-satin-hairbow-yellow`, Slug: `sheer-satin-hairbow-yellow`)
    - **Images (8)**:
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-6.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-7.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/sheer-satin/yellow/sc-hairbow-sheer-satin-yellow-8.webp`

### Velvet Hairbow
- **ID**: `hairbow-velvet`
- **Slug**: `hairbow-velvet`
- **Type**: `velvet`
- **Selling Price (Offer)**: ₹79
- **MRP (Original Price)**: ₹99 (~20% off)
- **Description**: Luxurious Velvet Hairbows.
- **Variants (2)**:
  - **Color**: `black` (ID: `velvet-hairbow-black`, Slug: `velvet-hairbow-black`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/black/sc-hairbow-velvet-black-1.webp`
  - **Color**: `red` (ID: `velvet-hairbow-red`, Slug: `velvet-hairbow-red`)
    - **Images (5)**:
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/red/sc-hairbow-velvet-red-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/red/sc-hairbow-velvet-red-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/red/sc-hairbow-velvet-red-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/red/sc-hairbow-velvet-red-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/velvet/red/sc-hairbow-velvet-red-5.webp`

### Printed Mini Hairbow
- **ID**: `hairbow-printed-mini`
- **Slug**: `hairbow-printed-mini`
- **Type**: `printed-mini`
- **Selling Price (Offer)**: ₹59
- **MRP (Original Price)**: ₹79 (~25% off)
- **Description**: Lovely Printed Mini Hairbows.
- **Variants (1)**:
  - **Color**: `Standard` (ID: `hairbow-printed-mini-standard`, Slug: `hairbow-printed-mini-standard`)
    - **Images (6)**:
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-1.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-2.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-3.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-4.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-5.webp`
      - `https://scrunchcreate.com/assets/products/hairbow/printed-mini/sc-hairbow-printed-mini-6.webp`


## Category: SCRUNCHIE

### Classic Scrunchie
- **ID**: `scrunchie-classic`
- **Slug**: `scrunchie-classic`
- **Type**: `classic`
- **Selling Price (Offer)**: ₹40
- **MRP (Original Price)**: ₹49 (~18% off)
- **Description**: Timeless Classic Scrunchies.
- **Variants (9)**:
  - **Color**: `brown` (ID: `classic-scrunchie-brown`, Slug: `classic-scrunchie-brown`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/brown/sc-scrunchie-classic-brown-1.webp`
  - **Color**: `golden` (ID: `classic-scrunchie-golden`, Slug: `classic-scrunchie-golden`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/golden/sc-scrunchie-classic-golden-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/golden/sc-scrunchie-classic-golden-2.webp`
  - **Color**: `grey` (ID: `classic-scrunchie-grey`, Slug: `classic-scrunchie-grey`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/grey/sc-scrunchie-classic-grey-1.webp`
  - **Color**: `lavender` (ID: `classic-scrunchie-lavender`, Slug: `classic-scrunchie-lavender`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/lavender/sc-scrunchie-classic-lavender-1.webp`
  - **Color**: `metallic-olive` (ID: `classic-scrunchie-metallic-olive`, Slug: `classic-scrunchie-metallic-olive`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/metallic-olive/sc-scrunchie-classic-metallic-olive-1.webp`
  - **Color**: `petrol` (ID: `classic-scrunchie-petrol`, Slug: `classic-scrunchie-petrol`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/petrol/sc-scrunchie-classic-petrol-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/petrol/sc-scrunchie-classic-petrol-2.webp`
  - **Color**: `white` (ID: `classic-scrunchie-white`, Slug: `classic-scrunchie-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/white/sc-scrunchie-classic-white-1.webp`
  - **Color**: `yellow` (ID: `classic-scrunchie-yellow`, Slug: `classic-scrunchie-yellow`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/yellow/sc-scrunchie-classic-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/yellow/sc-scrunchie-classic-yellow-2.webp`
  - **Color**: `triple-colour` (ID: `classic-scrunchie-triple-colour`, Slug: `classic-scrunchie-triple-colour`)
    - **Images (21)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-9.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-11.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-12.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-13.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-14.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-15.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-16.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-17.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-18.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-19.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-20.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/classic/triple-colour/sc-scrunchie-classic-triple-colour-21.webp`

### Combo Scrunchie
- **ID**: `scrunchie-combo`
- **Slug**: `scrunchie-combo`
- **Type**: `combo`
- **Selling Price (Offer)**: ₹99
- **MRP (Original Price)**: ₹129 (~23% off)
- **Description**: Variety of Combo Scrunchies.
- **Variants (3)**:
  - **Color**: `mixed` (ID: `combo-scrunchie`, Slug: `combo-scrunchie`)
    - **Images (207)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-100.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-101.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-102.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-103.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-104.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-105.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-106.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-107.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-108.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-109.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-110.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-111.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-112.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-113.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-114.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-115.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-116.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-117.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-118.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-119.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-12.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-120.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-121.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-122.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-123.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-124.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-125.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-126.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-127.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-128.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-129.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-13.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-130.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-131.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-132.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-133.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-134.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-135.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-136.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-137.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-138.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-139.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-14.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-140.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-141.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-142.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-143.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-144.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-145.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-146.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-147.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-148.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-149.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-150.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-151.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-152.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-153.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-154.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-155.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-156.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-157.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-158.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-159.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-160.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-161.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-162.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-163.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-164.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-165.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-166.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-167.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-168.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-169.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-17.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-170.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-171.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-172.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-173.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-174.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-175.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-176.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-177.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-178.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-179.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-18.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-180.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-181.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-182.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-183.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-184.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-185.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-186.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-187.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-188.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-189.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-19.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-190.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-191.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-192.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-193.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-194.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-195.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-196.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-197.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-198.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-199.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-20.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-200.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-201.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-202.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-203.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-204.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-205.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-206.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-207.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-208.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-209.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-21.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-210.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-211.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-212.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-213.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-214.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-215.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-216.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-22.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-23.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-24.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-25.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-26.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-27.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-28.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-29.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-30.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-31.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-32.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-33.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-34.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-36.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-37.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-38.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-39.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-42.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-43.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-44.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-45.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-46.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-47.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-49.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-50.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-51.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-52.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-53.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-54.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-55.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-56.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-57.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-58.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-59.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-60.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-61.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-62.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-63.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-64.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-65.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-66.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-67.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-68.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-69.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-70.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-71.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-72.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-73.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-74.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-75.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-76.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-77.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-78.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-79.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-80.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-81.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-83.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-84.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-85.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-86.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-87.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-88.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-9.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-90.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-91.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-92.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-93.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-94.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-95.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-96.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-97.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-98.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/sc-scrunchie-combo-99.webp`
  - **Color**: `tulip` (ID: `combo-scrunchie-tulip`, Slug: `combo-scrunchie-tulip`)
    - **Images (11)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-11.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip/sc-scrunchie-combo-tulip-9.webp`
  - **Color**: `tulip-sheer` (ID: `combo-scrunchie-tulip-sheer`, Slug: `combo-scrunchie-tulip-sheer`)
    - **Images (15)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-11.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-12.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-13.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-14.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-15.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/combo/tulip-sheer/sc-scrunchie-combo-tulip-sheer-9.webp`

### Satin Mini Scrunchie
- **ID**: `scrunchie-satin-mini`
- **Slug**: `scrunchie-satin-mini`
- **Type**: `satin-mini`
- **Selling Price (Offer)**: ₹30
- **MRP (Original Price)**: ₹39 (~23% off)
- **Description**: Cute Satin Mini Scrunchies.
- **Variants (1)**:
  - **Color**: `mixed` (ID: `satin-mini-scrunchie`, Slug: `satin-mini-scrunchie`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-mini/sc-scrunchie-satin-mini-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-mini/sc-scrunchie-satin-mini-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-mini/sc-scrunchie-satin-mini-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-mini/sc-scrunchie-satin-mini-4.webp`

### Tulip Scrunchie
- **ID**: `scrunchie-tulip`
- **Slug**: `scrunchie-tulip`
- **Type**: `tulip`
- **Selling Price (Offer)**: ₹69
- **MRP (Original Price)**: ₹89 (~22% off)
- **Description**: Elegant Tulip Scrunchies.
- **Variants (14)**:
  - **Color**: `black` (ID: `tulip-scrunchie-black`, Slug: `tulip-scrunchie-black`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/black/sc-scrunchie-tulip-black-1.webp`
  - **Color**: `brown` (ID: `tulip-scrunchie-brown`, Slug: `tulip-scrunchie-brown`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/brown/sc-scrunchie-tulip-brown-1.webp`
  - **Color**: `cream` (ID: `tulip-scrunchie-cream`, Slug: `tulip-scrunchie-cream`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/cream/sc-scrunchie-tulip-cream-1.webp`
  - **Color**: `grey` (ID: `tulip-scrunchie-grey`, Slug: `tulip-scrunchie-grey`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/grey/sc-scrunchie-tulip-grey-1.webp`
  - **Color**: `lavender` (ID: `tulip-scrunchie-lavender`, Slug: `tulip-scrunchie-lavender`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/lavender/sc-scrunchie-tulip-lavender-1.webp`
  - **Color**: `magenta` (ID: `tulip-scrunchie-magenta`, Slug: `tulip-scrunchie-magenta`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/magenta/sc-scrunchie-tulip-magenta-1.webp`
  - **Color**: `metallic-olive` (ID: `tulip-scrunchie-metallic-olive`, Slug: `tulip-scrunchie-metallic-olive`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/metallic-olive/sc-scrunchie-tulip-metallic-olive-1.webp`
  - **Color**: `peach` (ID: `tulip-scrunchie-peach`, Slug: `tulip-scrunchie-peach`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/peach/sc-scrunchie-tulip-peach-1.webp`
  - **Color**: `petrol` (ID: `tulip-scrunchie-petrol`, Slug: `tulip-scrunchie-petrol`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/petrol/sc-scrunchie-tulip-petrol-1.webp`
  - **Color**: `red` (ID: `tulip-scrunchie-red`, Slug: `tulip-scrunchie-red`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/red/sc-scrunchie-tulip-red-1.webp`
  - **Color**: `sky-blue` (ID: `tulip-scrunchie-sky-blue`, Slug: `tulip-scrunchie-sky-blue`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/sky-blue/sc-scrunchie-tulip-sky-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/sky-blue/sc-scrunchie-tulip-sky-blue-2.webp`
  - **Color**: `white` (ID: `tulip-scrunchie-white`, Slug: `tulip-scrunchie-white`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/white/sc-scrunchie-tulip-white-1.webp`
  - **Color**: `wine` (ID: `tulip-scrunchie-wine`, Slug: `tulip-scrunchie-wine`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/wine/sc-scrunchie-tulip-wine-1.webp`
  - **Color**: `yellow` (ID: `tulip-scrunchie-yellow`, Slug: `tulip-scrunchie-yellow`)
    - **Images (1)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip/yellow/sc-scrunchie-tulip-yellow-1.webp`

### Tulip Sheer Scrunchie
- **ID**: `scrunchie-tulip-sheer`
- **Slug**: `scrunchie-tulip-sheer`
- **Type**: `tulip-sheer`
- **Selling Price (Offer)**: ₹79
- **MRP (Original Price)**: ₹99 (~20% off)
- **Description**: Lovely Sheer Tulip Scrunchies.
- **Variants (5)**:
  - **Color**: `lilac` (ID: `tulip-sheer-scrunchie-lilac`, Slug: `tulip-sheer-scrunchie-lilac`)
    - **Images (3)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/lilac/sc-scrunchie-tulip-sheer-lilac-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/lilac/sc-scrunchie-tulip-sheer-lilac-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/lilac/sc-scrunchie-tulip-sheer-lilac-3.webp`
  - **Color**: `maroon` (ID: `tulip-sheer-scrunchie-maroon`, Slug: `tulip-sheer-scrunchie-maroon`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/maroon/sc-scrunchie-tulip-sheer-maroon-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/maroon/sc-scrunchie-tulip-sheer-maroon-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/maroon/sc-scrunchie-tulip-sheer-maroon-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/maroon/sc-scrunchie-tulip-sheer-maroon-4.webp`
  - **Color**: `navy-blue` (ID: `tulip-sheer-scrunchie-navy-blue`, Slug: `tulip-sheer-scrunchie-navy-blue`)
    - **Images (9)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/navy-blue/sc-scrunchie-tulip-sheer-navy-blue-9.webp`
  - **Color**: `peach-cream` (ID: `tulip-sheer-scrunchie-peach-cream`, Slug: `tulip-sheer-scrunchie-peach-cream`)
    - **Images (4)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/peach-cream/sc-scrunchie-tulip-sheer-peach-cream-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/peach-cream/sc-scrunchie-tulip-sheer-peach-cream-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/peach-cream/sc-scrunchie-tulip-sheer-peach-cream-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/peach-cream/sc-scrunchie-tulip-sheer-peach-cream-4.webp`
  - **Color**: `yellow` (ID: `tulip-sheer-scrunchie-yellow`, Slug: `tulip-sheer-scrunchie-yellow`)
    - **Images (8)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/tulip-sheer/yellow/sc-scrunchie-tulip-sheer-yellow-9.webp`

### Satin Printed Scrunchie
- **ID**: `scrunchie-satin-printed`
- **Slug**: `scrunchie-satin-printed`
- **Type**: `satin-printed`
- **Selling Price (Offer)**: ₹40
- **MRP (Original Price)**: ₹49 (~18% off)
- **Description**: Beautiful Satin Printed Scrunchies.
- **Variants (1)**:
  - **Color**: `Standard` (ID: `satin-printed-scrunchie-standard`, Slug: `satin-printed-scrunchie-standard`)
    - **Images (22)**:
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-1.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-2.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-3.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-4.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-5.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-6.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-7.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-8.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-9.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-10.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-11.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-12.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-13.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-14.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-15.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-16.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-17.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-18.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-19.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-20.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-21.webp`
      - `https://scrunchcreate.com/assets/products/scrunchie/satin-printed/sc-scrunchie-satin-printed-22.webp`


## Category: HAIRCLIP

### Rose Hairclip
- **ID**: `hairclip-rose`
- **Slug**: `hairclip-rose`
- **Type**: `rose`
- **Selling Price (Offer)**: ₹99
- **MRP (Original Price)**: ₹129 (~23% off)
- **Description**: Elegant Rose Hairclips.
- **Variants (5)**:
  - **Color**: `red` (ID: `hairclip-rose-red`, Slug: `hairclip-rose-red`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairclip/rose/red/sc-hairclip-rose-red-1.webp`
      - `https://scrunchcreate.com/assets/products/hairclip/rose/red/sc-hairclip-rose-red-2.webp`
  - **Color**: `white` (ID: `hairclip-rose-white`, Slug: `hairclip-rose-white`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairclip/rose/white/sc-hairclip-rose-white-1.webp`
      - `https://scrunchcreate.com/assets/products/hairclip/rose/white/sc-hairclip-rose-white-2.webp`
  - **Color**: `magenta` (ID: `hairclip-rose-magenta`, Slug: `hairclip-rose-magenta`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairclip/rose/magenta/sc-hairclip-rose-magenta-1.webp`
      - `https://scrunchcreate.com/assets/products/hairclip/rose/magenta/sc-hairclip-rose-magenta-2.webp`
  - **Color**: `mauve` (ID: `hairclip-rose-mauve`, Slug: `hairclip-rose-mauve`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairclip/rose/mauve/sc-hairclip-rose-mauve-1.webp`
      - `https://scrunchcreate.com/assets/products/hairclip/rose/mauve/sc-hairclip-rose-mauve-2.webp`
  - **Color**: `combo` (ID: `hairclip-rose-combo`, Slug: `hairclip-rose-combo`)
    - **Images (2)**:
      - `https://scrunchcreate.com/assets/products/hairclip/rose/combo/sc-hairclip-rose-combo-1.webp`
      - `https://scrunchcreate.com/assets/products/hairclip/rose/combo/sc-hairclip-rose-combo-2.webp`



