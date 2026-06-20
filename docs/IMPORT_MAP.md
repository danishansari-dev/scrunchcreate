# Scrunch & Create — Import Map Reference

This document maps the old file and import paths to their new clean architecture locations under `src/`.

---

## 1. Shared Layer (`src/shared/`)

| Old Path | New Path | Description |
|----------|----------|-------------|
| `src/config/config.js` | `src/shared/config/config.js` | Configuration constants |
| `src/config/coupons.js` | `src/shared/config/coupons.js` | Coupon constants |
| `src/theme/theme.css` | `src/shared/theme/theme.css` | Theme design tokens |
| `src/utils/*.js` | `src/shared/utils/*.js` | Math, pincode, pricing, and WhatsApp utilities |

---

## 2. Feature contexts (`src/features/*/context/`)

| Old Path | New Path | Import Symbol |
|----------|----------|---------------|
| `src/context/CartContext.jsx` | `src/features/cart/context/CartContext.jsx` | `CartProvider`, `useCart` |
| `src/context/WishlistContext.jsx` | `src/features/wishlist/context/WishlistContext.jsx` | `WishlistProvider`, `useWishlist` |

---

## 3. Co-located UI & Feature components

### Reusable UI / Layout (`src/components/`)
- `src/components/Banner.jsx` / `.module.css` -> `src/components/Banner/index.jsx` / `Banner.module.css`
- `src/components/ErrorBoundary.jsx` -> `src/components/ErrorBoundary/index.jsx`
- `src/components/FeaturesSection.jsx` / `.module.css` -> `src/components/FeaturesSection/index.jsx` / `FeaturesSection.module.css`
- `src/components/Footer.jsx` / `.module.css` -> `src/components/Footer/index.jsx` / `Footer.module.css`
- `src/components/InstagramSection.jsx` / `.module.css` -> `src/components/InstagramSection/index.jsx` / `InstagramSection.module.css`
- `src/components/Layout.jsx` -> `src/components/Layout/index.jsx`
- `src/components/NavBar.jsx` / `.module.css` -> `src/components/NavBar/index.jsx` / `NavBar.module.css`
- `src/components/ToastContext.jsx` / `toast.module.css` -> `src/components/ToastContext/index.jsx` / `ToastContext.module.css`
- `src/components/TrustBadges.jsx` / `.module.css` -> `src/components/TrustBadges/index.jsx` / `TrustBadges.module.css`

### Cart Feature (`src/features/cart/components/`)
- `src/components/CartDrawer.jsx` / `.module.css` -> `src/features/cart/components/CartDrawer/index.jsx` / `CartDrawer.module.css`
- `src/components/CouponField.jsx` / `.module.css` -> `src/features/cart/components/CouponField/index.jsx` / `CouponField.module.css`
- `src/components/PaymentMethodSelector.jsx` / `.module.css` -> `src/features/cart/components/PaymentMethodSelector/index.jsx` / `PaymentMethodSelector.module.css`

### Products Feature (`src/features/products/components/`)
- `src/components/ProductList.jsx` / `.module.css` -> `src/features/products/components/ProductList/index.jsx` / `ProductList.module.css`
- `src/components/ProductReviews.jsx` / `.module.css` -> `src/features/products/components/ProductReviews/index.jsx` / `ProductReviews.module.css`
- `src/components/ProductCard.jsx` / `.module.css` -> `src/features/products/components/ProductCard/index.jsx` / `ProductCard.module.css`
- `src/components/ProductSkeleton.jsx` / `.module.css` -> `src/features/products/components/ProductSkeleton/index.jsx` / `ProductSkeleton.module.css`
- `src/components/BestSellersSection.jsx` / `.module.css` -> `src/features/products/components/BestSellersSection/index.jsx` / `BestSellersSection.module.css`
- `src/components/KitsSection.jsx` / `.module.css` -> `src/features/products/components/KitsSection/index.jsx` / `KitsSection.module.css`
- `src/components/CollectionsSection.jsx` / `.module.css` -> `src/features/products/components/CollectionsSection/index.jsx` / `CollectionsSection.module.css`
- `src/components/products/ActiveFilters.jsx` / `.module.css` -> `src/features/products/components/ActiveFilters/index.jsx` / `ActiveFilters.module.css`
- `src/components/products/FilterSidebar.jsx` / `.module.css` -> `src/features/products/components/FilterSidebar/index.jsx` / `FilterSidebar.module.css`
- `src/components/products/ProductSearch.jsx` / `.module.css` -> `src/features/products/components/ProductSearch/index.jsx` / `ProductSearch.module.css`
- `src/hooks/useProductsFilter.js` -> `src/features/products/hooks/useProductsFilter.js`

---

## 4. App Entry Points (`src/app/`)

- `src/App.jsx` -> `src/app/App.jsx`
- `src/App.css` -> `src/app/App.css`
- `src/index.css` -> `src/app/index.css`
- `src/main.jsx` -> `src/app/main.jsx`
