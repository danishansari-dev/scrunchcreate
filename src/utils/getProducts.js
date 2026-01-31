/**
 * Load and return products from products.json
 * Uses absolute paths starting with /assets/products (no imports)
 */
import productsData from '../data/products.json';

let cachedProducts = null;

export function getProducts() {
  if (!cachedProducts) {
    cachedProducts = productsData;
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
 * Resolve image path - returns absolute path as-is
 * Paths should already be absolute starting with /assets/products
 */
export function resolveImagePath(imagePath) {
  if (!imagePath) return null;
  // Ensure path starts with /
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  // If it doesn't start with /, add it
  return `/${imagePath}`;
}

