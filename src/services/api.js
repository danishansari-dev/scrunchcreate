/**
 * Why this file exists:
 * Central service layer that all pages and contexts call for data operations.
 * Products and orders now use Supabase as the live backend.
 * Cart operations remain in localStorage (no auth system yet).
 *
 * The API surface (exported function signatures) is unchanged from the
 * previous mock version so all consumers see zero breaking changes.
 */

import { supabase } from '../shared/config/supabase';
import {
  getProducts as fetchProducts,
  getProductBySlug as fetchProductBySlug,
  getProductsByCategory as fetchProductsByCategory,
  getProductVariants as fetchProductVariants,
  invalidateProductCache,
} from '../shared/utils/getProducts';

// ─── Session Management ──────────────────────────────────────────────

/**
 * Gets or creates a persistent session ID for the current browser.
 * Why: Without real authentication, we use a UUID stored in localStorage
 * to associate orders with a specific browser session.
 * @returns {string} The session UUID
 */
function getSessionId() {
  let sessionId = localStorage.getItem('scrunch_session_id');
  if (!sessionId) {
    // crypto.randomUUID() is supported in all modern browsers
    sessionId = crypto.randomUUID();
    localStorage.setItem('scrunch_session_id', sessionId);
  }
  return sessionId;
}

// ─── Error Helpers ───────────────────────────────────────────────────

/**
 * Creates a structured error object mimicking Axios' error shape
 * Why: Existing pages inspect error.response.data.message.
 * We mimic this structure so frontend error blocks and toasts work correctly.
 * @param {string} message - The descriptive error message
 * @param {number} status - The HTTP status code representation
 * @returns {Error} An error with a mock axios response object attached
 */
function createAxiosError(message, status = 400) {
  const error = new Error(message);
  error.response = {
    status,
    data: {
      success: false,
      message,
    },
  };
  return error;
}

// ─── Local Cart Helpers (stays in localStorage) ──────────────────────

/**
 * Retrieves user's local cart items from localStorage
 * @param {string} email - User's email identifier
 * @returns {Array} Cart items { productId, quantity }
 */
const getStoredCart = (email) => {
  try {
    return JSON.parse(localStorage.getItem(`mock_cart_${email}`) || '[]');
  } catch {
    return [];
  }
};

/**
 * Saves user's cart items to localStorage
 * @param {string} email - User's email identifier
 * @param {Array} cart - Array of cart items
 */
const saveStoredCart = (email, cart) => {
  localStorage.setItem(`mock_cart_${email}`, JSON.stringify(cart));
};

/**
 * Resolves a product or its variant from products list by ID.
 * Why: Products can have variants with distinct IDs. We need a way to find
 * the product object even if the ID requested is a variant's ID.
 * @param {Array} products - List of all products
 * @param {string} id - The target product or variant ID
 * @returns {Object|null} Resolved product object or null
 */
function resolveProductById(products, id) {
  // First match parent product IDs directly
  let product = products.find((p) => p.id === id || p._id === id);
  if (product) return product;

  // Search inside nested variants list
  product = products.find(
    (p) => p.variants && p.variants.some((v) => v.id === id || v._id === id)
  );
  if (product) {
    const variant = product.variants.find((v) => v.id === id || v._id === id);
    // Tricky logic: Construct a hybrid product representation containing parent attributes
    // and variant specific values to prevent data loss downstream in cart/orders.
    return {
      ...product,
      id: variant.id,
      color: variant.color,
      image: variant.images?.[0] || product.primaryImage || product.image || product.images?.[0],
      price: variant.price || product.price,
      offerPrice: variant.offerPrice || product.offerPrice
    };
  }

  return null;
}

// ─── Product Exports ─────────────────────────────────────────────────

/**
 * Fetches all products (from Supabase with local fallback)
 * @returns {Promise<Array>} Product list
 */
export const getProducts = async () => {
  return fetchProducts();
};

/**
 * Resets the product cache so next call fetches fresh from Supabase
 */
export { invalidateProductCache };

/**
 * Finds a single product using its slug
 * @param {string} slug - The slug identifier
 * @returns {Promise<Object|null>} The matching product or null
 */
export const getProductBySlug = async (slug) => {
  return fetchProductBySlug(slug);
};

/**
 * Filters products by their category
 * @param {string} category - The category name
 * @returns {Promise<Array>} Matching products
 */
export const getProductsByCategory = async (category) => {
  return fetchProductsByCategory(category);
};

/**
 * Filters other variants of the same product type
 * @param {Object} product - Current product reference
 * @returns {Promise<Array>} Sibling variant products
 */
export const getProductVariants = async (product) => {
  return fetchProductVariants(product);
};

/**
 * Fetches a product by its ID (resolves variants too)
 * @param {string} id - The product ID
 * @returns {Promise<Object>} The product
 */
export const getProduct = async (id) => {
  const products = await getProducts();
  const found = resolveProductById(products, id);
  if (!found) {
    throw createAxiosError('Product not found.', 404);
  }
  return found;
};

// ─── Auth Exports (local mock, unchanged) ────────────────────────────

/**
 * Retrieves list of registered mock users from localStorage
 * @returns {Array} User objects
 */
const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('mock_users') || '[]');
  } catch {
    return [];
  }
};

/**
 * Saves mock users list to localStorage
 * @param {Array} users - User objects
 */
const saveStoredUsers = (users) => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

/**
 * Registers a new user locally
 * TODO: Replace with Supabase Auth when authentication is added
 * @param {string} name - New user's name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Register response
 */
export const register = async (name, email, password) => {
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw createAxiosError('User already exists with this email.');
  }

  // WARNING: Passwords stored in plaintext. Strictly for local mock.
  // TODO: Implement Supabase Auth when integrating real authentication.
  const newUser = {
    _id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const token = `mock-jwt-${newUser._id}`;
  localStorage.setItem('token', token);
  localStorage.setItem('mock_current_user', JSON.stringify(newUser));

  return { success: true, token, data: newUser };
};

/**
 * Logs in a user locally
 * TODO: Replace with Supabase Auth when authentication is added
 * @param {string} email - Registered user's email
 * @param {string} password - Plaintext password
 * @returns {Promise<Object>} Login response
 */
export const login = async (email, password) => {
  const users = getStoredUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  // WARNING: Direct comparison of plaintext password.
  // TODO: Use Supabase Auth with secure password handling.
  if (!foundUser || foundUser.password !== password) {
    throw createAxiosError('Invalid email or password.');
  }

  const token = `mock-jwt-${foundUser._id}`;
  localStorage.setItem('token', token);
  localStorage.setItem('mock_current_user', JSON.stringify(foundUser));

  return { success: true, token, data: foundUser };
};

// ─── Order Exports (Supabase-backed) ─────────────────────────────────

/**
 * Places a new order — saves to Supabase if available, localStorage fallback.
 * @param {Object} orderData - Object containing items list and shipping address
 * @returns {Promise<Object>} Order confirmation
 */
export const placeOrder = async (orderData) => {
  const products = await getProducts();
  const orderItems = orderData.items
    .map((item) => {
      const product = resolveProductById(products, item.productId);
      return { product, quantity: item.quantity };
    })
    .filter((item) => item.product);

  const orderId = `order_${Date.now()}`;
  const sessionId = getSessionId();

  // Build enriched order with contact, payment, coupon, and fee data
  const newOrder = {
    id: orderId,
    _id: orderId,
    session_id: sessionId,
    user: sessionId,
    items: orderItems,
    shippingAddress: orderData.shippingAddress,
    shipping_address: orderData.shippingAddress,
    contact: orderData.contact || null,
    payment: orderData.payment || null,
    coupon: orderData.coupon || null,
    couponDiscount: orderData.couponDiscount || 0,
    coupon_discount: orderData.couponDiscount || 0,
    deliveryFee: orderData.deliveryFee ?? 0,
    delivery_fee: orderData.deliveryFee ?? 0,
    codFee: orderData.codFee || 0,
    cod_fee: orderData.codFee || 0,
    total: orderData.total || 0,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  // Try Supabase first
  if (supabase) {
    try {
      // Supabase row uses snake_case columns
      const supabaseRow = {
        id: orderId,
        session_id: sessionId,
        items: orderItems,
        shipping_address: orderData.shippingAddress,
        contact: orderData.contact || null,
        payment: orderData.payment || null,
        coupon: orderData.coupon || null,
        coupon_discount: orderData.couponDiscount || 0,
        delivery_fee: orderData.deliveryFee ?? 0,
        cod_fee: orderData.codFee || 0,
        total: orderData.total || 0,
        status: 'Pending',
      };

      const { error } = await supabase
        .from('orders')
        .insert(supabaseRow);

      if (error) {
        console.warn('[Orders] Supabase insert failed, using localStorage:', error.message);
        // Fall through to localStorage backup
        saveOrderLocally(newOrder);
      } else {
        console.log('[Orders] Order saved to Supabase:', orderId);
      }
    } catch (err) {
      console.warn('[Orders] Supabase unreachable, using localStorage:', err.message);
      saveOrderLocally(newOrder);
    }
  } else {
    saveOrderLocally(newOrder);
  }

  // Tricky logic: Save the last order in localStorage so the post-checkout
  // /order-success page can access it and generate the WhatsApp deep link.
  localStorage.setItem('last_order', JSON.stringify(newOrder));

  return { success: true, data: newOrder };
};

/**
 * Saves an order to localStorage as a fallback when Supabase is unavailable.
 * @param {Object} order - The order object
 */
function saveOrderLocally(order) {
  const email = getLocalUserEmail();
  const orders = getStoredOrders(email);
  orders.push(order);
  saveStoredOrders(email, orders);
}

/**
 * Gets the current local user's email (for localStorage keying)
 * @returns {string} User email or 'guest'
 */
function getLocalUserEmail() {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  return user ? user.email : 'guest';
}

/**
 * Retrieves user's order history from localStorage
 * @param {string} email - User's email identifier
 * @returns {Array} Order objects
 */
const getStoredOrders = (email) => {
  try {
    return JSON.parse(localStorage.getItem(`mock_orders_${email}`) || '[]');
  } catch {
    return [];
  }
};

/**
 * Saves user's order history to localStorage
 * @param {string} email - User's email identifier
 * @param {Array} orders - Order objects
 */
const saveStoredOrders = (email, orders) => {
  localStorage.setItem(`mock_orders_${email}`, JSON.stringify(orders));
};

/**
 * Fetches current user's order history (Supabase + localStorage merge)
 * @returns {Promise<Array>} Orders array
 */
export const getMyOrders = async () => {
  const sessionId = getSessionId();
  let supabaseOrders = [];

  // Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseOrders = data.map(row => ({
          _id: row.id,
          ...row,
          // Map snake_case to camelCase for frontend compatibility
          shippingAddress: row.shipping_address,
          couponDiscount: row.coupon_discount,
          deliveryFee: row.delivery_fee,
          codFee: row.cod_fee,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // Fall through to local
    }
  }

  // Also get local orders (for backward compat / offline orders)
  const email = getLocalUserEmail();
  const localOrders = getStoredOrders(email);

  // Merge and deduplicate by id
  const allOrders = [...supabaseOrders];
  const seenIds = new Set(allOrders.map(o => o.id || o._id));
  for (const order of localOrders) {
    const oid = order.id || order._id;
    if (!seenIds.has(oid)) {
      allOrders.push(order);
      seenIds.add(oid);
    }
  }

  return allOrders;
};

// ─── Cart Exports (localStorage, unchanged) ──────────────────────────

/**
 * Fetches user's cart
 * @returns {Promise<Array>} Cart items array
 */
export const getCart = async () => {
  const email = getLocalUserEmail();
  const cartItems = getStoredCart(email);

  const products = await getProducts();
  return cartItems
    .map((item) => {
      const product = resolveProductById(products, item.productId);
      return { product, quantity: item.quantity };
    })
    .filter((item) => item.product);
};

/**
 * Adds an item to the cart
 * @param {string} productId - The product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Array>} Updated cart
 */
export const addToCartAPI = async (productId, quantity = 1) => {
  const email = getLocalUserEmail();
  const cartItems = getStoredCart(email);

  const existingItem = cartItems.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({ productId, quantity });
  }

  saveStoredCart(email, cartItems);
  return getCart();
};

/**
 * Updates cart item quantity
 * @param {string} productId - The product ID
 * @param {number} quantity - The target quantity
 * @returns {Promise<Array>} Updated cart
 */
export const updateCartItemAPI = async (productId, quantity) => {
  const email = getLocalUserEmail();
  const cartItems = getStoredCart(email);

  const item = cartItems.find((i) => i.productId === productId);
  if (item) {
    item.quantity = quantity;
  }

  saveStoredCart(email, cartItems);
  return getCart();
};

/**
 * Removes an item from the cart
 * @param {string} productId - The product ID
 * @returns {Promise<Array>} Updated cart
 */
export const removeFromCartAPI = async (productId) => {
  const email = getLocalUserEmail();
  let cartItems = getStoredCart(email);
  cartItems = cartItems.filter((item) => item.productId !== productId);
  saveStoredCart(email, cartItems);
  return getCart();
};

/**
 * Clears the user's cart
 * @returns {Promise<Array>} Empty array
 */
export const clearCartAPI = async () => {
  const email = getLocalUserEmail();
  saveStoredCart(email, []);
  return [];
};

// ─── Default Export (Axios mock instance) ────────────────────────────

const mockApi = {
  get: async (url) => {
    if (url === '/auth/me') {
      const userStr = localStorage.getItem('mock_current_user');
      if (!userStr) {
        throw createAxiosError('Not authenticated', 401);
      }
      return {
        data: {
          success: true,
          data: JSON.parse(userStr),
        },
      };
    }
    throw createAxiosError(`Endpoint GET ${url} is not mocked.`, 404);
  },
  post: async (url) => {
    throw createAxiosError(`Endpoint POST ${url} is not mocked.`, 404);
  },
  put: async (url) => {
    throw createAxiosError(`Endpoint PUT ${url} is not mocked.`, 404);
  },
  delete: async (url) => {
    throw createAxiosError(`Endpoint DELETE ${url} is not mocked.`, 404);
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default mockApi;
