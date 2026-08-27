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

---

## 5. Standard Operating Procedure for Future Changes

1. **Investigate Codebase:** Read files in `shopify-theme/` or check this guide before editing.
2. **Apply Edits:** Edit files using modular Liquid snippets and clean CSS tokens.
3. **Validate:** Run `npx @shopify/cli theme check`.
4. **Deploy:** Run `npx @shopify/cli theme push --store scrunchcreate.myshopify.com --allow-live --live`.
5. **Update This Log:** Append the new prompt report to the [Interaction & Change History](#interaction--change-history) section.


