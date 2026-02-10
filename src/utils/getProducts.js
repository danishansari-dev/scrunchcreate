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
        // Ensure product has variants
        if (!product.variants || product.variants.length === 0) return null;

        // Find the first variant with images to serve as the default/preview
        const defaultVariant = product.variants.find(v => v.images && v.images.length > 0);

        // If no variant has images, exclude the product (Safety)
        if (!defaultVariant) return null;

        const pricing = getProductPrice(product);

        // Get all variant colors for filtering
        const availableColors = product.variants.map(v => normalizeColor(v.color));
        const defaultColor = defaultVariant.color;

        return {
          ...product,
          ...pricing,
          price: pricing.offerPrice,
          // Hoist the first variant's images to the top level for card previews
          // and backward compatibility
          images: defaultVariant.images,
          primaryImage: defaultVariant.images[0],
          // Add color info for filtering
          color: defaultColor, // Backward compatibility
          normalizedColor: normalizeColor(defaultColor), // Backward compatibility
          availableColors: availableColors, // New field for robust filtering

          // Keep the original variants array
          variants: product.variants.map(v => ({
            ...v,
            colorHex: getColorHex(v.color), // Helper to get hex if needed
            normalizedColor: normalizeColor(v.color),
            // Ensure images is an array
            images: v.images || []
          }))
        };
      })
      .filter(Boolean); // Filter out nulls
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

