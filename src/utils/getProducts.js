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
    // Enrich products with dynamic pricing and normalized colors,
    // then filter out any product without at least one image
    cachedProducts = productsData
      .filter(product => Array.isArray(product.images) && product.images.length > 0)
      .map(product => {
        const pricing = getProductPrice(product);
        return {
          ...product,
          ...pricing,  // Spread offerPrice, originalPrice, discountPercent
          price: pricing.offerPrice, // Keep backward-compatible price field
          normalizedColor: normalizeColor(product.color),
          colorHex: getColorHex(product.color)
        };
      });
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

