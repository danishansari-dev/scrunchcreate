# Scrunch & Create — Architectural Design Document

> **Created:** 2026-06-19  
> **Topic:** Feature-Sliced Design / Clean Modular Architecture  

---

## 1. Architectural Philosophy

The codebase uses a **Feature-Sliced / Clean Modular Architecture** to divide business capabilities into isolated features, reusable components, and global application entries.

### Key Goals:
- **High Cohesion:** Co-locate component markup, logic, and styles inside a single directory.
- **Low Coupling:** Shared configurations and utilities reside inside `/shared`. Business logic features reside inside `/features` and do not depend on other features directly.
- **Clear Dependency Flow:** 
  ```
  App Layer (app/) -> Pages Layer (pages/) -> Features Layer (features/) -> Shared Layer (shared/)
  ```

---

## 2. Directory breakdown

### 1. App Layer (`src/app/`)
Contains global, cross-cutting configurations, entry scripts, and index stylesheets.
- **Rules:** App layer handles application initialization and router mounting. It acts as the orchestration point for the layout wrapping.

### 2. Pages Layer (`src/pages/`)
Contains views corresponding to client routes.
- **Rules:** Pages are thin wrappers that compose features and reusable UI components. They should not declare nested layout styles or business details directly.

### 3. Features Layer (`src/features/`)
Contains independent business domains.
- **Domains:**
  - `cart/` — All states and components relating to cart management, payment selection, and discounts.
  - `products/` — Product list view rails, product searching, filtering hooks, cards, skeletons, and reviews.
  - `wishlist/` — Wishlist context provider and synchronization triggers.
- **Rules:** All feature assets (components, hooks, contexts) should be co-located inside the feature slice folder.

### 4. Components Layer (`src/components/`)
Contains globally reusable UI controls, presentation cards, and layout wrappers.
- **Rules:** Components must remain generic and business-agnostic. They are passed data via React props and do not query feature contexts or API wrappers directly.

### 5. Shared Layer (`src/shared/`)
Contains generic scripts, styling parameters, and constants.
- **Structure:**
  - `config/` — Coupon structures and WhatsApp constant numbers.
  - `utils/` — Math, string format, and deep link generators.
  - `theme/` — Global styling custom properties (colors, transitions, typography).

---

## 3. Co-location Conventions

Components containing corresponding CSS module files must be restructured into directories where:
- The component code is stored in `index.jsx`.
- The stylesheet is stored in `[ComponentName].module.css`.

Example:
```
src/features/cart/components/CartDrawer/
├── index.jsx
└── CartDrawer.module.css
```
This isolates styles to the component context and prevents CSS contamination.
