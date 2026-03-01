# System Audit Report

## 1. Product Catalog Analysis
- **Total number of products**: Estimated ~30+ base products within the 89KB JSON file.
- **Product categories and subcategories**: Defined in pricing configurations as `scrunchie`, `hairbow`, `gifthamper`, `flowerjewellery`, `earring`, `paraandi`.
- **Product types**: Base types like `classic`, `tulip`, `satin`, `satin-mini`, `combo`, `scarf`, etc.
- **Variant structure**: Nested heavily under base products. A single `Product` config holds an array of `variants`. Each variant contains its own specific `id`, `color`, and an array of `images`.
- **Available colors per product**: Bound to the variants (e.g., `lilac`, `magenta`, `olive-green`). Managed logically using canonical sets in `colorNormalization.js`.
- **Pricing per product / variant**: Driven by an offline source-of-truth service configuration (`src/utils/pricing.js`). Does not utilize static properties from the JSON. Instead, applies offer price rules based on `category` / `type` matches, then intelligently computes an inflated MRP `originalPrice` based on static category margins (15%-25% markup).
- **Discount & bundle logic**: Explicitly evaluated within `pricing.js` by intercepting `name.includes('combo')` or `type === 'combo'`.
- **SKU structure**: Primarily uses sluggified descriptive strings as identifiers (`gifthamper-satin-hamper-lilac`).
- **Product data source location**: Centralized purely in `src/data/products.json`.

## 2. Inventory / Stock System
- **Stock tracking**: No explicit robust inventory quantity system. Based on schema review of `products.json`, the structure strictly lists products and variants but lacks tracked `quantity` limits or fields that reflect diminishing availability natively.
- **Inventory logic**: Products are universally defined as in-stock unless purposefully omitted from the JSON catalog script generator.

## 3. Media & Assets
- **Image folder structure**: Organized categorically (e.g., `/public/assets/products/[category]/[type]/[color]/[filename]`).
- **Naming conventions**: Mostly follows pattern `sc-[category]-[type]-[color]-[number].webp`.
- **Image formats**: Enforced WebP mapping for fast rendering.
- **Hover images / gallery logic**: Hover dynamically cycles to secondary array images within `ProductCard.jsx` natively utilizing `hasMultipleImages` detections.
- **Variant specific images**: Hard-indexed within the `variants[...].images` arrays inside the single truth JSON table.

## 4. Site Architecture
- **Total number of pages**: 9 accessible views.
- **Page List & Purpose**: 
    - `/` (Home): Main landing showcase.
    - `/products` & `/products/:category` (Products): Paginated catalog.
    - `/product/:slug` (Product Details): Standalone dynamic view.
    - `/cart` (Cart): Checkout preparation.
    - `/checkout` (Checkout): Details staging.
    - `/order-success` (Success): Post-submission view.
    - `/wishlist` (Wishlist): Saved assets.
    - Legal Pages (`/privacy-policy`, `/terms-and-conditions`).
- **Routing structure**: Built out cleanly via `react-router-dom` in `App.jsx`, utilizing a global Layout component shell.
- **Component structure**: Around 36 heavily modularized isolated UI logic files paired specifically with `.module.css` local styling counterparts.
- **Cart flow**: Contextually managed slide-out sidebars globally floating throughout the system (`CartDrawer.jsx`).
- **Checkout flow**: Headless. Information runs locally and dumps user into an external messenger funnel rather than native capture.

## 5. Commerce Logic
- **Cart implementation**: Completely governed by `src/components/CartContext.jsx`.
- **Order handling flow**: No payment gateway processing or API databases. Bypasses standard eCommerce processing for a pure WhatsApp redirection.
- **WhatsApp message generation logic**: Custom text payloads constructed inside `whatsappUtils.js`. Merges all line items into visually separated paragraphs with explicit subtotal and dynamic shipping allocations, subsequently pushed to the `https://wa.me/` portal.
- **Pricing calculation logic**: `pricing.js` centralizes values. Offer -> MRP calculation runs globally via standard mathematical logic round offsets.
- **Shipping logic**: Strict cart-computed logic defined as free delivery over ₹499 (`subtotal >= 499 ? 0 : 49`).

## 6. UI / UX Structure
- **Filters available**: Highly optimized local-state filtering hooks processing Category, Type, Canonical Color logic, Price ranging, and freeform text searching (`useProductsFilter.js`).
- **Variant selector type**: Choosing canonical colors inside filters actively replaces default ProductCard array images globally on matching variants dynamically.
- **Navigation structure**: Fixed Layout NavBar (`<NavBar />`) with slide toggles and context-aware counters.
- **Mobile specific behavior**: Responsive hidden sidebars mapped to hamburger toggles.
- **Sticky components**: Handled by global css modules interacting with `<Layout />`.
- **Interaction patterns**: Clean spring/layout animations powered natively by `framer-motion` for lists.

## 7. Data Models
- **Product Schema**:
  ```json
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "category": "string",
    "type": "string",
    "price": "integer",
    "description": "string",
    "variants": [{"id": "string", "slug": "string", "color": "string", "images": ["string"]}]
  }
  ```
- **Cart Schema**: Directly extends Variant + Product with `.qty` counter.
- **Order Data Format**: String-based representation URL payload.
- **Configuration files**: System environments stored in `/config/config.js` handling fixed business constants like WhatsApp Number associations.

## 8. Technology Stack
- **Frameworks used**: React v19, React Router v7.
- **State management**: Pure native React Hooks & Contexts (`CartContext`, `WishlistContext`).
- **Build system**: Vite (augmented by Python/CJS pre-processing hooks for JSON compilation).
- **Deployment setup**: Standard `.env` agnostic Vite static bundling.

## 9. Project Metrics Summary
| Metric | Asset Scope Extent |
| ------ | :------ |
| **Total Products** | ~30+ Base Unique Records |
| **Total Variants** | ~200+ Sub-Options |
| **Total Categories** | 6 Officially Supported |
| **Total Pages** | 9 Active Routed Views |
| **Total Components** | ~36 Discrete Logic Nodes |
| **Total Images (approx)** | ~708 Production WebP Assets |
| **Total Data Files** | 1 Core JSON Source of Truth |