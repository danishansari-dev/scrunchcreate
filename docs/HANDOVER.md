# Scrunch & Create — Developer Handover Guide

> **Last updated:** 2026-06-19  
> **Stack:** React 19 + Vite 7 + Framer Motion + CSS Modules + Supabase

---

## 1. Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd scrunchcreate
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your Supabase values

# 3. Start development
npm run dev
# Opens at http://localhost:5173

# 4. Build for production
npm run build
npm run preview  # Preview at http://localhost:4173
```

---

## 2. Refactored Project Structure

The project has been refactored from a flat components structure into a clean feature-based design system:

```
src/
├── app/                  # Main loader scripts, router configuration, and index styles
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── components/           # Generic reusable layouts and visual blocks (NavBar, Footer, TrustBadges)
│   └── [ComponentName]/
│       ├── index.jsx
│       └── [ComponentName].module.css
├── features/             # Business modules
│   ├── cart/             # Cart provider, Drawer, CouponField, PaymentSelector
│   ├── products/         # Skeletons, filters sidebar, cards, useProductsFilter hook
│   └── wishlist/         # Wishlist provider
├── pages/                # Thin route wrappers composing layouts and features
│   └── [PageName]/
│       ├── [PageName].jsx
│       └── [PageName].module.css
├── services/             # Supabase-backed API facade with localStorage fallbacks
│   └── api.js
└── shared/               # Shared settings, styles, and tools
    ├── config/           # Supabase, admin, and app configurations
    ├── utils/            # Shuffling, pincode lookup, WhatsApp formatters
    └── theme/            # Global theme design tokens (theme.css)
```

---

## 3. Key Refactoring Modifications

### Component Co-location
Component JS markup and CSS stylesheets have been co-located. Every component containing a CSS module is now stored inside a folder (e.g. `src/components/NavBar/`), with the JS file renamed to `index.jsx` and the stylesheet to `[ComponentName].module.css` (e.g. `NavBar.module.css`).

### Variant matching in Mock API
We fixed a critical bug where adding a specific color variant of a product (which generates a variant ID, e.g. `satin-hamper-gifthamper-black`) would fail to match parent product IDs in `api.js`.
- **Fix:** Added `resolveProductById` in `api.js` to trace variant IDs back to their parent products and enrich their properties (color, price, images) dynamically before appending to the cart or completing checkout order objects.

---

## 4. Documentation Index

| File | Purpose |
|------|---------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Architecture overview, modules map, and data flows |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | In-depth clean modular architecture breakdown and directories |
| [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) | Description of migration phases and target mappings |
| [CHANGELOG.md](./CHANGELOG.md) | History of modifications and latest release details |
| [IMPORT_MAP.md](./IMPORT_MAP.md) | Quick lookup map of file paths before and after migration |
| [TEST_REPORT.md](./TEST_REPORT.md) | Automated build/lint test statuses and browser walkthroughs |
| [TODO.md](./TODO.md) | Task backlog status |
| [HANDOVER.md](./HANDOVER.md) | This file |
