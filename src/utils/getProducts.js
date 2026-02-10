/**
 * Load and return products from products.json
 * Uses absolute paths starting with /assets/products (no imports)
 *
 * SAFETY: Products with empty or missing image arrays are automatically
 * excluded to prevent blank/broken cards in any view.
 */
import productsData from '../data/products.json';
import { getProductPrice } from './pricing';
import { normalizeColor, getColorHex } from './colorNormalization';

let cachedProducts = null;

export function getProducts() {
  if (!cachedProducts) {
    cachedProducts = productsData
      .map(product => {
        const hasVariants = product.variants && product.variants.length > 0;
        const mainImage = product.image || (hasVariants && product.variants[0].images && product.variants[0].images[0]);

        // If the product has no image at all, skip it
        if (!mainImage) return null;

        // Parent already has calculated/saved prices from the refactor script,
        // but let's re-run getProductPrice for consistency and to get originalPrice/discount
        const pricing = getProductPrice(product);

        if (hasVariants) {
          const availableColors = product.variants.map(v => normalizeColor(v.color));
          const defaultVariant = product.variants[0];

          return {
            ...product,
            ...pricing,
            images: product.images || (defaultVariant.images && defaultVariant.images.length > 0 ? defaultVariant.images : [product.image]),
            primaryImage: mainImage,
            color: product.color || defaultVariant.color,
            normalizedColor: normalizeColor(product.color || defaultVariant.color),
            availableColors: [...new Set(availableColors)],
            variants: product.variants.map(v => ({
              ...v,
              colorHex: getColorHex(v.color),
              normalizedColor: normalizeColor(v.color),
              images: v.images || []
            }))
          };
        } else {
          // Fallback for single products (though refactor should have made all nested)
          return {
            ...product,
            ...pricing,
            primaryImage: mainImage,
            normalizedColor: normalizeColor(product.color),
            availableColors: product.color ? [normalizeColor(product.color)] : [],
            colorHex: getColorHex(product.color)
          };
        }
      })
      .filter(Boolean);
  }
  return cachedProducts;
}

export function getProductBySlug(slug) {
  const products = getProducts();
  return products.find(p => p.slug === slug) || null;
}

export function getProductsByCategory(category) {
  const products = getProducts();
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get color variants of a product (same category and type, different colors)
 */
export function getProductVariants(product) {
  if (!product) return [];
  const products = getProducts();
  return products.filter(p =>
    p.category === product.category &&
    p.type === product.type &&
    p.color &&
    p.id !== product.id
  );
}

/**
 * Resolve image path - returns absolute path as-is
 * Paths should already be absolute starting with /assets/products
 */
export function resolveImagePath(imagePath) {
  if (!imagePath) return null;
  // Clean the path
  const cleanPath = imagePath.trim();
  // Ensure path starts with /
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }
  // If it doesn't start with /, add it
  return `/${cleanPath}`;
}

