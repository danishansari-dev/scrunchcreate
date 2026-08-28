# Scrunch & Create — Shopify Store Migration, History & Playbook

> **CRITICAL FOR ALL AI ASSISTANTS & DEVELOPERS:**  
> If starting a new session or encountering a new environment, **read this file first**. It documents the complete store architecture, configuration, deployment workflow, and chronological log of all changes made to the Shopify store.  
> **Rule:** Whenever you complete a task or prompt, update the [Interaction & Change History](#interaction--change-history) section at the bottom of this file.

---

## 1. Store & Environment Credentials

- **Store URL:** `https://scrunchcreate.myshopify.com/`
- **Active Theme Name:** `test-data`
- **Theme ID:** `186623852655` (Live theme)
- **Local Theme Directory:** `c:\Users\daans\Desktop\scrunchcreate\shopify-theme`
- **Original React Web Directory:** `c:\Users\daans\Desktop\scrunchcreate\src` (Contains design reference, components, and original catalogue structure in `src/data/products.json`)
- **CLI Commands (Run from `shopify-theme/`):**
  - **Check theme code:** `npx @shopify/cli theme check`
  - **Deploy to live store:** `npx @shopify/cli theme push --store scrunchcreate.myshopify.com --allow-live --live`

---

## 2. Design System & Global Styling Tokens

- **Primary Brand Color:** `#e78592` (Used for active underlines, mega menu links, category badges, buttons, and accents)
- **Hover/Accent Color:** `#d96b7a`
- **Dark Text:** `#24201e` / `#332d29`
- **Muted Text:** `#635852` / `#776c66`
- **Borders & Dividers:** `rgba(54, 45, 39, 0.08)` / `rgba(54, 45, 39, 0.12)`
- **Typography:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Custom Global Stylesheet:** [`shopify-theme/assets/scrunch-custom.css`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/assets/scrunch-custom.css)

---

## 3. Architecture & Implemented Features

### 3.1. Dynamic Hover-Based Mega Menu
- **Snippet:** [`shopify-theme/snippets/scrunch-nav-mega-menu.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/snippets/scrunch-nav-mega-menu.liquid)
- **Header Section:** [`shopify-theme/sections/header.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/sections/header.liquid)
- **Mobile Drawer:** [`shopify-theme/snippets/header-drawer.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/snippets/header-drawer.liquid)
- **How it Works:**
  1. Dynamically queries `collections['all'].products` in Shopify Liquid with zero hardcoding.
  2. Groups products by category (`HairBow`, `Scrunchie`, `GiftHamper`, `FlowerJewellery`, `Hairclip`) and sub-types (e.g. `Classic`, `Combo`, `Satin-Mini`, `Tulip`, `Tulip-Sheer`, `Satin-Printed`).
  3. Lists up to 5 available variant colors per column with direct deep links (`?variant=<id>`), plus a `View all N colors →` link.
  4. Features a 180ms hover debounce controller and an invisible `::before` hit-testing bridge to ensure the dropdown stays open smoothly when moving the cursor from the nav link down into the options.
  5. Active nav category displays the pink underline indicator (`border-bottom: 2px solid #e78592`) and rotating chevron.
  6. Mobile drawer displays expandable accordions for all categories and products.

### 3.2. Product Detail Page (PDP) Variant-to-Image Switching
- **JavaScript Controller:** [`shopify-theme/assets/product-info.js`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/assets/product-info.js)
- **Gallery Snippet:** [`shopify-theme/snippets/product-media-gallery.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/snippets/product-media-gallery.liquid)
- **Template Config:** [`shopify-theme/templates/product.json`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/templates/product.json) (`gallery_layout`: `"thumbnail_slider"`)
- **How it Works:**
  1. On variant change or initial page load (with `?variant=...`), `product-info.js` extracts the active color name (e.g., `white`, `lavender`, `golden`).
  2. Normalizes color strings (removes hyphens, spaces, converts to lowercase) and matches against all gallery media `src` image filenames.
  3. Smoothly scrolls the thumbnail slider to the matching slide and updates the main media gallery view.

### 3.3. Bespoke Footer & Brand Components
- **Section File:** [`shopify-theme/sections/footer.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/sections/footer.liquid)
- **Config File:** [`shopify-theme/sections/footer-group.json`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/sections/footer-group.json)
- **How it Works:**
  1. Top newsletter subscription band (`SCRUNCH & CREATE`, "Handmade drops, styling notes, and gift-ready offers." with pill form).
  2. 4-column brand grid: Brand Story, Quick Links (Shop, Best Sellers, Gift Hampers, Wishlist), Help & Policies (Shipping, Returns, Privacy, Terms), and Contact/Instagram.
  3. Live Instagram 4-tile showcase with follow button.
  4. Bottom copyright and `Handcrafted in India` badge.

### 3.4. Product Card Conversion Enhancements
- **Snippet:** [`shopify-theme/snippets/card-product.liquid`](file:///c:/Users/daans/Desktop/scrunchcreate/shopify-theme/snippets/card-product.liquid)
- **How it Works:**
  1. Renders uppercase category badge (e.g. `SCRUNCHIE`, `HAIRBOW`).
  2. Star rating badge (`★★★★★ 4.9`).
  3. Dispatch reassurance note (`In stock, ready to ship • 2-4 days`).

---

## 4. Interaction & Change History

### Entry 1 — Initial Setup & PDP Variant-Image Switching
- **Goal:** Fix PDP so selecting variant colors (e.g. White, Lavender) updates the main gallery image.
- **Changes:**
  - Configured `gallery_layout` to `thumbnail_slider` in `templates/product.json`.
  - Added filename-based color matching in `snippets/product-media-gallery.liquid` and `assets/product-info.js`.
  - Added `initActiveVariantMedia()` on page load.
- **Status:** Verified & Live.

### Entry 2 — Storefront Re-theming & Footer Makeover
- **Goal:** Match the design of `scrunchcreate.com` on the Shopify store.
- **Changes:**
  - Rewrote `sections/footer.liquid` with custom newsletter band, 4-column links, Instagram grid, and policy links.
  - Enhanced `snippets/card-product.liquid` with category badges, 4.9-star ratings, and dispatch notes.
  - Added wishlist heart link and cart badge styles in `sections/header.liquid` and `assets/scrunch-custom.css`.
- **Status:** Verified & Live.

### Entry 3 — Dynamic Multi-Column Mega Menu
- **Goal:** Build hover mega menus for all navigation categories dynamically pulling live store products without hardcoding.
- **Changes:**
  - Created `snippets/scrunch-nav-mega-menu.liquid` with Liquid loops grouping products by type and color options.
  - Rendered `scrunch-nav-mega-menu` in `sections/header.liquid`.
  - Added dynamic accordion categories to `snippets/header-drawer.liquid` for mobile users.
  - Added 6-column grid layout and single-line logo styling in `assets/scrunch-custom.css`.
- **Status:** Verified & Live.

### Entry 4 — Announcement Bar Removal
- **Goal:** Remove the `[🎀 HANDCRAFTED IN INDIA ✦ FREE SHIPPING ON ORDERS ABOVE ₹499]` top announcement bar.
- **Changes:**
  - Removed `"announcement-bar"` from `sections/header-group.json`.
- **Status:** Verified & Live.

### Entry 5 — Mega Menu Hover Intent & Cursor Gap Fix
- **Goal:** Prevent mega menu from disappearing when moving the cursor from the nav category down into the dropdown options.
- **Changes:**
  - Added 180ms hover debounce controller in `snippets/scrunch-nav-mega-menu.liquid`.
  - Added invisible `::before` pseudo hit-testing bridge to eliminate the gap between nav links and dropdown.
- **Status:** Verified & Live.

### Entry 6 — Compact Header Height & Wishlist Icon Removal
- **Goal:** Reduce header height to a compact, professional size, ensure perfect vertical alignment across logo, nav links, search, account, and cart, and remove the wishlist heart icon completely.
- **Changes:**
  - Removed wishlist heart icon link from `sections/header.liquid`.
  - Set compact padding (`padding_top: 8`, `padding_bottom: 8`) in `sections/header-group.json`.
  - Added vertical alignment, min-height (56px), and compact icon dimensions in `assets/scrunch-custom.css`.
- **Status:** Verified & Live.

### Entry 7 — Full Header & Mega Menu Overhaul (Whitespace & Dynamic Sizing)
- **Goal:** Remove all unnecessary whitespace above, below, and around the header on all pages, make the mega menu adaptive with max-content width to eliminate huge empty blank zones on single/dual column categories (Hamper, Flower Jewellery, Hairclips), and clean sub-type titles.
- **Changes:**
  - Updated `snippets/scrunch-nav-mega-menu.liquid` with adaptive `max-content` dropdown width, clean category suffix stripping, edge-safe positioning (`left: 0` for Hair Bows, `right: 0` for Hairclips), and balanced column wraps.
  - Updated `assets/scrunch-custom.css` with sticky header, zero top-margin across all page templates (`section-header`, `MainContent`), and 52px compact header height.
  - Updated `snippets/header-drawer.liquid` to use clean sub-type titles on mobile.
- **Status:** Verified & Live.

### Entry 8 — Full Storefront Audit & Comprehensive Automated Regression Fixes
- **Goal:** Perform full store audit across all sections, pages, components, navigation, search, and responsive viewports. Identify and fix 404 policy links, eliminate duplicate header search modals, add fallback favicon to prevent 404 console errors, add missing Hairclips category to footer, standardize category titles ("Gift Hampers"), replace hardcoded routes with Shopify route objects, and resolve all Theme Check warnings.
- **Changes:**
  - `sections/footer.liquid`: Replaced broken hardcoded `/policies/...` links with dynamic `shop.privacy_policy.url`, `shop.terms_of_service.url`, `shop.refund_policy.url` with WhatsApp customer support fallbacks; added missing `Hairclips` link; used `routes.all_products_collection_url` and `routes.collections_url`; fixed Instagram alt tag typo; used `file_img_url` CDN filter.
  - `sections/header.liquid`: Removed duplicate search modal and button rendering on the left of the logo, unifying search in `.header__icons`.
  - `snippets/scrunch-nav-mega-menu.liquid`: Replaced hardcoded collection URLs with standard Shopify routes; standardized "Hamper" to "Gift Hampers".
  - `snippets/header-drawer.liquid`: Updated mobile drawer routes to dynamic route objects and standardized category labels.
  - `layout/theme.liquid` & `layout/password.liquid`: Added fallback SVG brand favicon data URI to prevent 404 `/favicon.ico` errors; initialized `scheme_classes = ''` to resolve Theme Check `UndefinedObject` warning.
  - `assets/scrunch-custom.css`: Added global `overflow-x: clip` on `html, body` to eliminate horizontal scrollbar/overflow across tablet and desktop viewports.
### Entry 10 — Product Card Color Swatches Redesign & 404 Policy Interception
- **Goal:** Fix product color swatches overlapping with product title headings on the homepage and collection cards; provide rich, accurate hex colors and gradients for all store variants (combos, satins, layered, prints); ensure all policy pages and links render the Policy Hub seamlessly with zero 404 errors.
- **Changes:**
  - `snippets/scrunch-color-swatches.liquid`: Expanded color palette mapping covering all 46 store color and style variants (`black`, `white`, `ruby`, `baby-pink`, `magenta`, `mauve`, `plum`, `emerald`, `mint`, `olive`, `navy`, `petrol`, `sky-blue`, `mustard`, `lavender`, `chocolate`, `beige`, `gold`, `silver`, `pistachio`, `peach`, `combo`, `tulip`, `3-layered`, `jimmi-choo`, `mini-bow`, `pigtail`, `princess`, `scarf`, etc.) with support for multi-color linear gradients and fallback gradients.
  - `snippets/card-product.liquid`: Wrapped product swatches in dedicated container (`.sc-card-swatches-wrap`) positioned cleanly between `.card__heading` and `.price`.
  - `assets/scrunch-custom.css`:
    - Enforced strict vertical layout and margins: `.card__heading` (`font-size: 15px; font-weight: 700; line-height: 1.35; margin: 4px 0 6px; min-height: 38px; 2-line clamped`), `.sc-card-swatches-wrap` (`min-height: 24px; margin: 4px 0 6px; display: flex; align-items: center;`), `.sc-swatches-row` (`gap: 7px; margin: 0; padding: 2px 0;`), `.sc-swatch-dot` (`18px x 18px; circular; 1.5px white border; subtle shadow; 1.2x hover scale with primary ring`), `.sc-swatch-more` (`11px bold pill badge with background and border`).
    - Added matching mobile media query rules ensuring touch-friendly 17px dot diameter, clean spacing, and zero overlap on 2-column mobile grids.
  - `snippets/scrunch-policy.liquid`: Created dedicated, reusable Policy Hub snippet with interactive tabs for Terms & Conditions, Refund & Returns, Shipping & Delivery, Privacy Policy, and Support & Contact.
  - `sections/scrunch-policy.liquid`: Simplified section to render `snippets/scrunch-policy.liquid`.
  - `sections/main-404.liquid`: Added smart client-side route and URL hash interceptor that dynamically renders the Policy Hub whenever a visitor accesses any policy path (`/pages/terms-and-conditions`, `/pages/refund-policy`, `/pages/shipping-policy`, `/pages/privacy-policy`, `/policies/*`), automatically selecting and activating the corresponding policy tab and updating page metadata without showing a 404 error.
### Entry 11 — Footer Instagram Preview Images Fix
- **Goal:** Fix the Instagram preview section in the footer where tiles were showing "No image" placeholders instead of actual brand imagery, while preserving the existing 4-tile grid layout, sizing, aspect-ratio, and hover animations.
- **Changes:**
  - `sections/footer.liquid`: Replaced broken `file_img_url` placeholder tags with high-resolution, direct Cloudinary CDN product images showcasing the 4 core brand categories (Scrunchies, Hair Bows, Gift Hampers, Flower Jewellery) at exact 1:1 aspect ratio with `object-fit: cover`.
- **Status:** Verified & Deployed Live.

### Entry 12 — Instant Product Card Color Swatch Image Switcher
- **Goal:** Implement instant, client-side product card image switching when customers click any color swatch option across all product cards (homepage featured collection, collection listings, search results, related products). Ensure the selected swatch is visually highlighted, images switch seamlessly without reloading the page, and the card layout/design remains intact.
- **Changes:**
  - `snippets/scrunch-color-swatches.liquid`:
    - Updated each swatch button to lookup and associate the matching variant media and alt tags.
    - Embedded `data-image-src`, `data-image-srcset`, `data-image-alt`, and `data-variant-url` attributes for instant client-side lookup.
    - Set accessible `role="radiogroup"` and `role="radio"` with `aria-checked` attributes.
  - `assets/scrunch-custom.css`:
    - Added button resets for `.sc-swatch-dot` and refined `.is-active` / `[aria-checked="true"]` highlight styling.
  - `layout/theme.liquid`:
    - Implemented a smooth, fast global event delegation handler that intercepts color swatch button clicks, smoothly updates the card's primary image and srcset, sets the active highlight state, and updates the card product detail link to point to the selected variant URL.
### Entry 13 — Shopify Go-Live Launch Checklist & Operational Roadmap
- **Goal:** Create a comprehensive, production-ready master launch checklist and operational task guide (`Shopify-migration/SHOPIFY-LAUNCH-CHECKLIST.md`) covering all remaining administrative, logistical, and technical steps required for real customer transactions and live sales.
- **Changes:**
  - `Shopify-migration/SHOPIFY-LAUNCH-CHECKLIST.md`: Created master checklist covering:
    - Phase 1: Payment Gateway Setup (Razorpay, PhonePe, Cashfree UPI/Cards & COD).
    - Phase 2: Shipping, Courier 3PL Logistics (Shiprocket/Delhivery) & Free Shipping threshold configuration.
    - Phase 3: Shopify Admin native legal policies & store currency/tax settings.
    - Phase 4: Customer email branding & WhatsApp automated notifications.
    - Phase 5: Promotional coupon codes (`WELCOME10`, `SCRUNCH15`, `FREESHIP`).
    - Phase 6: Custom Domain (`scrunchcreate.com`) DNS cutover (A record & CNAME) and SSL setup.
    - Phase 7: Analytics (GA4, Google Search Console sitemap, Meta Pixel for IG/FB ads).
    - Phase 8: Pre-launch end-to-end smoke test sequence & storefront password removal.
- **Status:** Complete & Available in `Shopify-migration/SHOPIFY-LAUNCH-CHECKLIST.md`.

---

## 5. Standard Operating Procedure for Future Changes

1. **Investigate Codebase:** Read files in `shopify-theme/` or check this guide before editing.
2. **Apply Edits:** Edit files using modular Liquid snippets and clean CSS tokens.
3. **Validate:** Run `npx @shopify/cli theme check`.
4. **Deploy:** Run `npx @shopify/cli theme push --store scrunchcreate.myshopify.com --allow-live --live`.
5. **Update This Log:** Append the new prompt report to the [Interaction & Change History](#interaction--change-history) section.








