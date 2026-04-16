/**
 * API service layer.
 * Centralized HTTP client for backend communication.
 *
 * Falls back to local product JSON when the backend is unreachable,
 * so the frontend never breaks during local development without a running server.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Auto-attach JWT from localStorage on every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Product Cache ──────────────────────────────────────────────────
// Avoids refetching the full catalog on every component mount
let productCache = null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all products.
 * Tries the backend API. If it fails due to a cold start or network error,
 * it retries instead of falling back to local data, allowing the loading spinner
 * to persist on the frontend until the server wakes up.
 * @returns {Promise<Array>} Enriched product array
 */
export const getProducts = async (retries = 15) => {
  if (productCache) return productCache;

  let attempt = 0;
  while (attempt < retries) {
    try {
      const { data } = await api.get('/products');
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        productCache = data.data;
        return productCache;
      }
      throw new Error('Empty product catalog from API');
    } catch (err) {
      attempt++;
      console.warn(`⚠️ [api] Backend unreachable or sleeping (Attempt ${attempt}/${retries}). Waking up server, retrying in 3 seconds...`);
      if (attempt >= retries) {
        throw new Error('Backend is taking too long to wake up. Please check your network or try again later.');
      }
      await delay(3000);
    }
  }
};

/**
 * Force-clear the product cache (call after admin creates/updates/deletes a product)
 */
export const invalidateProductCache = () => {
  productCache = null;
};

/**
 * Find a single product by its URL slug.
 * Works client-side from the cached catalog — no extra endpoint needed.
 * @param {string} slug - URL-friendly product identifier
 * @returns {Promise<Object|null>}
 */
export const getProductBySlug = async (slug) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
};

/**
 * Get all products in a given category.
 * @param {string} category - Category key (case-insensitive match)
 * @returns {Promise<Array>}
 */
export const getProductsByCategory = async (category) => {
  const products = await getProducts();
  return products.filter(
    (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get color variants of a product (same category + type, different colors).
 * @param {Object} product - The product to find variants for
 * @returns {Promise<Array>}
 */
export const getProductVariants = async (product) => {
  if (!product) return [];
  const products = await getProducts();
  return products.filter(
    (p) =>
      p.category === product.category &&
      p.type === product.type &&
      p.color &&
      p.id !== product.id
  );
};

/**
 * Fetch a single product by MongoDB _id.
 * @param {string} id - Mongo ObjectId string
 * @returns {Promise<Object>}
 */
export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
};

// ─── Auth ────────────────────────────────────────────────────────────

/**
 * Register a new user
 * @returns {{ success, token, data: user }}
 */
export const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

/**
 * Login
 * @returns {{ success, token, data: user }}
 */
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

// ─── Orders ──────────────────────────────────────────────────────────

/**
 * Place a new order
 */
export const placeOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

/**
 * Get current user's orders
 */
export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data.data;
};

// ─── Cart ──────────────────────────────────────────────────────────

/**
 * Get current user's cart
 */
export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data.data;
};

/**
 * Add item to cart
 */
export const addToCartAPI = async (productId, quantity = 1) => {
  const { data } = await api.post('/cart', { productId, quantity });
  return data.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItemAPI = async (productId, quantity) => {
  const { data } = await api.put(`/cart/${productId}`, { quantity });
  return data.data;
};

/**
 * Remove item from cart
 */
export const removeFromCartAPI = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data.data;
};

/**
 * Clear the entire cart
 */
export const clearCartAPI = async () => {
  const { data } = await api.delete('/cart');
  return data.data;
};

export default api;
