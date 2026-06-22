/**
 * Why this file exists:
 * Load products from Supabase (live backend) with a fallback to the local
 * products.json file for offline/development usage.
 *
 * The returned product shape is identical to the previous local-only version
 * so all downstream components see zero changes.
 *
 * SAFETY: Products with empty or missing images are automatically excluded
 * to prevent blank/broken cards in any view.
 */
import { supabase } from '../../../shared/config/supabase';
import { getProductPrice } from './pricing';
import { normalizeColor, getColorHex } from './colorNormalization';

// Fallback imports for offline mode
import productsData from '../../../data/products.json';
import cloudinaryMap from '../../../../scripts/cloudinary-url-map.json';

let cachedProducts = null;

/**
 * Resolves a local asset relative path to its Cloudinary CDN URL
 * Why: Only needed for offline fallback when loading from local JSON
 * @param {string} path - The relative asset path
 * @returns {string} The Cloudinary CDN URL or original path
 */
function toCloudinary(path) {
  if (!path) return path;
  return cloudinaryMap[path] || path;
}

/**
 * Transforms a Supabase product row into the shape the frontend expects.
 * Why: The Supabase schema uses snake_case columns, but the frontend
 * expects camelCase properties. This normalizer bridges the gap.
 * @param {Object} row - Raw Supabase product row
 * @returns {Object} Frontend-compatible product object
 */
function transformSupabaseProduct(row) {
  // Why: Map variants and format individual stock counts and overall in-stock flag
  const variants = (Array.isArray(row.variants) ? row.variants : []).map(v => ({
    ...v,
    stock: typeof v.stock === 'number' ? v.stock : 20,
    inStock: typeof v.stock === 'number' ? v.stock > 0 : (v.inStock ?? true)
  }));

  // Why: Parse row.stock with safe defaults. If stock is 0 or less, inStock is overridden to false.
  const parentStock = typeof row.stock === 'number' ? row.stock : 20;

  return {
    id: row.id,
    _id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    type: row.type,
    color: row.color,
    normalizedColor: row.normalized_color,
    colorHex: row.color_hex || getColorHex(row.color),
    price: Number(row.price) || 0,
    offerPrice: Number(row.offer_price) || 0,
    originalPrice: Number(row.original_price) || 0,
    discountPercent: Number(row.discount_percent) || 0,
    description: row.description,
    primaryImage: row.primary_image,
    image: row.primary_image,
    images: row.images || [],
    availableColors: row.available_colors || [],
    badge: row.badge,
    stock: parentStock,
    inStock: parentStock > 0 ? row.in_stock : false,
    // Variants in the shape the frontend already expects
    variants: variants,
  };
}

/**
 * Loads products from local JSON (fallback when Supabase is unavailable).
 * This is the original logic preserved for offline mode.
 * @returns {Array} Formatted product list
 */
function loadLocalProducts() {
  return productsData
    .map(product => {
      const hasVariants = product.variants && product.variants.length > 0;
      const rawMainImage = product.image
        || (product.images && product.images.length > 0 ? product.images[0] : null)
        || (hasVariants && product.variants[0].images && product.variants[0].images[0]);
      const mainImage = toCloudinary(rawMainImage);

      if (!mainImage) return null;

      const pricing = getProductPrice(product);

      if (hasVariants) {
        const availableColors = product.variants.map(v => normalizeColor(v.color));
        const defaultVariant = product.variants[0];
        const productImages = (product.images || (defaultVariant.images && defaultVariant.images.length > 0
          ? defaultVariant.images : [rawMainImage])).map(toCloudinary);

        // Why: Default to 20 units and dynamically check stock value for offline fallbacks
        const parentStock = product.stock ?? 20;

        return {
          ...product,
          ...pricing,
          stock: parentStock,
          inStock: parentStock > 0 ? (product.inStock ?? true) : false,
          images: productImages,
          primaryImage: mainImage,
          color: product.color || defaultVariant.color,
          normalizedColor: normalizeColor(product.color || defaultVariant.color),
          availableColors: [...new Set(availableColors)],
          variants: product.variants.map(v => ({
            ...v,
            colorHex: getColorHex(v.color),
            normalizedColor: normalizeColor(v.color),
            images: (v.images || []).map(toCloudinary),
            stock: v.stock ?? 20,
            inStock: (v.stock ?? 20) > 0 ? (v.inStock ?? true) : false
          }))
        };
      } else {
        const productImages = (product.images || [rawMainImage]).map(toCloudinary);
        const parentStock = product.stock ?? 20;
        return {
          ...product,
          ...pricing,
          stock: parentStock,
          inStock: parentStock > 0 ? (product.inStock ?? true) : false,
          images: productImages,
          primaryImage: mainImage,
          normalizedColor: normalizeColor(product.color),
          availableColors: product.color ? [normalizeColor(product.color)] : [],
          colorHex: getColorHex(product.color)
        };
      }
    })
    .filter(Boolean);
}

/**
 * Fetches all products from Supabase, with localStorage JSON fallback.
 * Uses in-memory caching to avoid redundant network calls.
 * @returns {Promise<Array>} Formatted product list
 */
export async function getProducts() {
  if (cachedProducts) return cachedProducts;

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category')
        .order('name');

      if (!error && data && data.length > 0) {
        cachedProducts = data
          .map(transformSupabaseProduct)
          .filter(p => p.primaryImage); // Safety: skip products without images
        console.log(`[Products] Loaded ${cachedProducts.length} products from Supabase`);
        return cachedProducts;
      }

      // Supabase returned no data or errored — fall through to local
      if (error) {
        console.warn('[Products] Supabase error, falling back to local:', error.message);
      } else {
        console.warn('[Products] Supabase returned 0 products, falling back to local');
      }
    } catch (err) {
      console.warn('[Products] Supabase unreachable, falling back to local:', err.message);
    }
  }

  // Fallback: load from local JSON
  cachedProducts = loadLocalProducts();
  console.log(`[Products] Loaded ${cachedProducts.length} products from local JSON (offline mode)`);
  return cachedProducts;
}

/**
 * Finds a single product by slug.
 * Uses a direct Supabase query for efficiency when available.
 * @param {string} slug - The product slug
 * @returns {Promise<Object|null>} The product or null
 */
export async function getProductBySlug(slug) {
  // Try direct Supabase lookup first (avoids loading all products)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return transformSupabaseProduct(data);
      }
    } catch {
      // Fall through to cache-based lookup
    }
  }

  // Fallback: search in cached/local products
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

/**
 * Filters products by category.
 * @param {string} category - The category name
 * @returns {Promise<Array>} Matching products
 */
export async function getProductsByCategory(category) {
  // Try direct Supabase query
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', category);

      if (!error && data) {
        return data.map(transformSupabaseProduct).filter(p => p.primaryImage);
      }
    } catch {
      // Fall through
    }
  }

  const products = await getProducts();
  return products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
}

/**
 * Finds other variant products of the same type.
 * @param {Object} product - Current product reference
 * @returns {Promise<Array>} Sibling variant products
 */
export async function getProductVariants(product) {
  if (!product) return [];
  const products = await getProducts();
  return products.filter(p =>
    p.category === product.category &&
    p.type === product.type &&
    p.color &&
    p.id !== product.id
  );
}

/**
 * Invalidates the product cache so the next call fetches fresh data.
 */
export function invalidateProductCache() {
  cachedProducts = null;
}
