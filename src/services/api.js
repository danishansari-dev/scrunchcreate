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
} from '../features/products/utils/getProducts';

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
      id: variant.id || variant._id,
      color: variant.color,
      image: variant.images?.[0] || product.primaryImage || product.image || product.images?.[0],
      price: variant.price || product.price,
      offerPrice: variant.offerPrice || product.offerPrice
    };
  }

  return null;
}

export { resolveProductById };

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

// ─── Auth Exports (Supabase Auth Integration) ─────────────────────────

/**
 * Registers a user in Supabase Auth
 * Why: Supabase Auth handles database-level secure user creation.
 * We also save the name as custom user metadata so it's accessible.
 * @danishansari-dev name - User's full name
 * @danishansari-dev email - User's unique email address
 * @danishansari-dev password - User's chosen password
 * @returns {Promise<Object>} Success status and user data
 */
export const register = async (name, email, password) => {
  if (!supabase) {
    throw createAxiosError('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw createAxiosError(error.message);
  }

  // Tricky logic: Store user email in localStorage synchronously so that
  // subsequent getLocalUserEmail() reads use their logged-in cart name right away.
  if (data.user) {
    localStorage.setItem('scrunch_current_user_email', email.toLowerCase());
    await mergeGuestCartIntoUserCart(email.toLowerCase());
  }

  return { success: true, user: data.user, session: data.session };
};

/**
 * Logs in a user in Supabase Auth
 * Why: Verifies credentials against Supabase Auth storage and returns user session.
 * @danishansari-dev email - User's email address
 * @danishansari-dev password - User's password
 * @returns {Promise<Object>} Login status and user data
 */
export const login = async (email, password) => {
  if (!supabase) {
    throw createAxiosError('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    throw createAxiosError(error.message);
  }

  if (data.user) {
    localStorage.setItem('scrunch_current_user_email', email.toLowerCase());
    await mergeGuestCartIntoUserCart(email.toLowerCase());
  }

  return { success: true, user: data.user, session: data.session };
};

/**
 * Logs out the current user session
 * Why: Clears the session tokens in Supabase Auth client and browser local storage.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw createAxiosError(error.message);
  }
  // Remove user email cache
  localStorage.removeItem('scrunch_current_user_email');
  localStorage.removeItem('mock_current_user');
};

/**
 * Retrieves current authenticated user profile
 * Why: React contexts need a reliable way to get user data on mount.
 * Tricky logic: Session checks are done first, followed by getting details from supabase.auth.getUser() to prevent JWT bypass.
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return null;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
    createdAt: user.created_at,
  };
};

/**
 * Merges guest cart items into a user's persistent cart
 * Why: If a visitor shops as guest, we want their items migrated to their account cart upon login.
 * Tricky logic: Queries user cart from Supabase first to sum quantities, falls back to local merge if offline.
 * @danishansari-dev email - User's email address to merge items into
 * @returns {Promise<void>}
 */
export const mergeGuestCartIntoUserCart = async (email) => {
  if (!email || email === 'guest') return;
  const guestCart = getStoredCart('guest');
  if (guestCart.length === 0) return;

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch existing user cart items first to merge quantities
        const { data: userCartItems, error: selectError } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        if (selectError) throw selectError;

        const userCartMap = new Map((userCartItems || []).map(item => [item.product_id, item.quantity]));

        for (const guestItem of guestCart) {
          const existingQty = userCartMap.get(guestItem.productId);
          if (existingQty !== undefined) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity: existingQty + guestItem.quantity })
              .eq('user_id', user.id)
              .eq('product_id', guestItem.productId);
            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from('cart_items')
              .insert({ user_id: user.id, product_id: guestItem.productId, quantity: guestItem.quantity });
            if (insertError) throw insertError;
          }
        }
        
        saveStoredCart('guest', []); // Clear local guest cart
        return;
      }
    } catch (err) {
      console.warn('[Cart] Failed to merge guest cart to Supabase, merging locally:', err.message);
    }
  }

  // Fallback local merge
  const userCart = getStoredCart(email);
  guestCart.forEach((guestItem) => {
    const existingItem = userCart.find((userItem) => userItem.productId === guestItem.productId);
    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.push({ ...guestItem });
    }
  });

  saveStoredCart(email, userCart);
  saveStoredCart('guest', []); // Clear guest cart
};

/**
 * Merges guest wishlist items into a user's persistent database wishlist
 * Why: Moves local wishlist entries to user's cloud account upon authentication.
 * Tricky logic: Performs upserts on conflicts to avoid primary key constraints.
 * @returns {Promise<void>}
 */
export const mergeGuestWishlistIntoUserWishlist = async () => {
  const guestWishlistStr = localStorage.getItem('scrunch_wishlist');
  if (!guestWishlistStr) return;

  let guestWishlist = [];
  try {
    guestWishlist = JSON.parse(guestWishlistStr);
  } catch {
    return;
  }

  if (!Array.isArray(guestWishlist) || guestWishlist.length === 0) return;

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const insertRows = guestWishlist.map(productId => ({
          user_id: user.id,
          product_id: productId,
        }));

        const { error } = await supabase
          .from('wishlist_items')
          .upsert(insertRows, { onConflict: 'user_id,product_id' });

        if (!error) {
          localStorage.removeItem('scrunch_wishlist');
        }
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to merge guest wishlist to Supabase:', err.message);
    }
  }
};

// ─── Order Exports (Supabase-backed) ─────────────────────────────────

/**
 * Places an order and records it in the database
 * Why: Stores order details securely in Supabase with user_id mapping if authenticated.
 * Tricky logic: Falls back to localStorage if Supabase is unreachable so checkout never breaks.
 * @danishansari-dev orderData - Object containing checkout form inputs and items
 * @returns {Promise<Object>} Order confirmation status
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

  // Try to get authenticated user ID if logged in
  let currentUserId = null;
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    } catch { /* ignore and leave as guest order */ }
  }

  // Build enriched order with contact, payment, coupon, and fee data
  const newOrder = {
    id: orderId,
    _id: orderId,
    session_id: sessionId,
    user: currentUserId || sessionId,
    user_id: currentUserId,
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
        user_id: currentUserId,
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
  const email = localStorage.getItem('scrunch_current_user_email');
  if (email) return email;

  // Fallback to legacy mock user representation
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
 * Retrieves order history for the current user
 * Why: Displays past purchases in the profile page.
 * Tricky logic: Queries orders by user ID OR current session ID to show both guest and logged-in purchases.
 * @returns {Promise<Array>} List of orders
 */
export const getMyOrders = async () => {
  const sessionId = getSessionId();
  let supabaseOrders = [];

  // Try Supabase
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase.from('orders').select('*');
      
      // Fetch orders associated with this user ID OR this guest session
      if (user) {
        query = query.or(`user_id.eq.${user.id},session_id.eq.${sessionId}`);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
          userId: row.user_id,
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

// ─── Cart & Wishlist Exports (Supabase + localStorage fallback) ──────

/**
 * Fetches user's cart from Supabase if logged in, otherwise localStorage
 * Why: Dual storage path allows guests to shop instantly and syncs account carts.
 * @returns {Promise<Array>} Cart items array
 */
export const getCart = async () => {
  const email = getLocalUserEmail();
  const products = await getProducts();
  
  if (supabase && email !== 'guest') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        if (data) {
          return data
            .map((item) => {
              const product = resolveProductById(products, item.product_id);
              return { product, quantity: item.quantity };
            })
            .filter((item) => item.product);
        }
      }
    } catch (err) {
      console.warn('[Cart] Failed to load cart from Supabase, using localStorage:', err.message);
    }
  }

  const cartItems = getStoredCart(email);
  return cartItems
    .map((item) => {
      const product = resolveProductById(products, item.productId);
      return { product, quantity: item.quantity };
    })
    .filter((item) => item.product);
};

/**
 * Adds an item to the user's cart
 * Why: Saves additions to database for registered users and falls back to local storage.
 * @danishansari-dev productId - The target product or variant ID to append
 * @danishansari-dev quantity - Quantity units count
 * @returns {Promise<Array>} Updated cart
 */
export const addToCartAPI = async (productId, quantity = 1) => {
  const email = getLocalUserEmail();
  
  if (supabase && email !== 'guest') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing, error: selectError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (selectError) throw selectError;

        if (existing) {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: productId, quantity });
          if (insertError) throw insertError;
        }
        return getCart();
      }
    } catch (err) {
      console.warn('[Cart] Failed to add to Supabase cart, using localStorage:', err.message);
    }
  }

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
 * Why: Syncs modified item quantity to the database.
 * @danishansari-dev productId - The product ID to modify
 * @danishansari-dev quantity - The target quantity count
 * @returns {Promise<Array>} Updated cart
 */
export const updateCartItemAPI = async (productId, quantity) => {
  const email = getLocalUserEmail();
  
  if (supabase && email !== 'guest') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        return getCart();
      }
    } catch (err) {
      console.warn('[Cart] Failed to update Supabase cart, using localStorage:', err.message);
    }
  }

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
 * Why: Deletes the item row from database/localStorage.
 * @danishansari-dev productId - The product ID to delete
 * @returns {Promise<Array>} Updated cart
 */
export const removeFromCartAPI = async (productId) => {
  const email = getLocalUserEmail();
  
  if (supabase && email !== 'guest') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        return getCart();
      }
    } catch (err) {
      console.warn('[Cart] Failed to remove from Supabase cart, using localStorage:', err.message);
    }
  }

  let cartItems = getStoredCart(email);
  cartItems = cartItems.filter((item) => item.productId !== productId);
  saveStoredCart(email, cartItems);
  return getCart();
};

/**
 * Clears the user's cart
 * Why: Empties the user's cart records.
 * @returns {Promise<Array>} Empty array
 */
export const clearCartAPI = async () => {
  const email = getLocalUserEmail();
  
  if (supabase && email !== 'guest') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
        return [];
      }
    } catch (err) {
      console.warn('[Cart] Failed to clear Supabase cart, using localStorage:', err.message);
    }
  }

  saveStoredCart(email, []);
  return [];
};

/**
 * Retrieves wishlist product IDs for the logged-in user
 * Why: Syncs wishlist display upon user login.
 * @returns {Promise<Array>} Wishlist product IDs
 */
export const getWishlistAPI = async () => {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('product_id')
          .eq('user_id', user.id);
        if (error) throw error;
        if (data) {
          return data.map(item => item.product_id);
        }
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to fetch from Supabase, using localStorage:', err.message);
    }
  }

  // Fallback to local storage wishlist if database fails
  try {
    const stored = localStorage.getItem('scrunch_wishlist');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse fallback wishlist:', e);
  }
  return [];
};

/**
 * Adds a product to the user's wishlist in Supabase
 * Why: Saves user wishlist choices permanently.
 * @danishansari-dev productId - Product ID string
 * @returns {Promise<void>}
 */
export const addToWishlistAPI = async (productId) => {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('wishlist_items')
          .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to add to Supabase:', err.message);
    }
  }
};

/**
 * Removes a product from the user's wishlist in Supabase
 * Why: Deletes wishlist choice.
 * @danishansari-dev productId - Product ID string
 * @returns {Promise<void>}
 */
export const removeFromWishlistAPI = async (productId) => {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to remove from Supabase:', err.message);
    }
  }
};

/**
 * Clears the user's database wishlist
 * Why: Empties user's saved wishlist records.
 * @returns {Promise<void>}
 */
export const clearWishlistAPI = async () => {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to clear Supabase wishlist:', err.message);
    }
  }
};

// ─── Admin API Exports ───────────────────────────────────────────────


/**
 * Fetches all orders from the database.
 * Why: Allows administrators to view all orders for processing.
 * Tricky logic: Maps snake_case database columns to camelCase for frontend compatibility.
 * @returns {Promise<Array>} List of all orders
 */
export const adminGetAllOrders = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => ({
    _id: row.id,
    id: row.id,
    ...row,
    shippingAddress: row.shipping_address,
    couponDiscount: row.coupon_discount,
    deliveryFee: row.delivery_fee,
    codFee: row.cod_fee,
    createdAt: row.created_at,
    userId: row.user_id,
  }));
};

/**
 * Updates an order's status.
 * Why: Allows administrators to change status during fulfillment stages.
 * @danishansari-dev orderId - The target order ID string
 * @danishansari-dev status - The target status string
 * @returns {Promise<boolean>} True if successful
 */
export const adminUpdateOrderStatus = async (orderId, status) => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
  return true;
};

/**
 * Saves or updates a product in the catalog.
 * Why: Allows administrators to manage catalog items.
 * Tricky logic: Generates a random ID for new products, derives a slug if empty,
 * normalizes the color name, and clears the client-side product cache.
 * @danishansari-dev productData - Frontend camelCase product data object
 * @returns {Promise<Object>} Saved product row
 */
export const adminSaveProduct = async (productData) => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const id = productData.id || 'prod_' + Math.random().toString(36).substring(2, 9);
  const slug = productData.slug || productData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const normalizedColor = productData.color ? productData.color.toLowerCase().trim().replace(/[\s_]+/g, '-') : null;

  const row = {
    id,
    slug,
    name: productData.name,
    category: productData.category,
    type: productData.type || null,
    color: productData.color || null,
    normalized_color: normalizedColor,
    color_hex: productData.colorHex || null,
    price: Number(productData.price) || 0,
    offer_price: Number(productData.offerPrice) || 0,
    original_price: Number(productData.originalPrice) || 0,
    discount_percent: Number(productData.discountPercent) || 0,
    description: productData.description || null,
    primary_image: productData.primaryImage || null,
    images: productData.images || [],
    available_colors: productData.availableColors || [],
    badge: productData.badge || null,
    in_stock: productData.inStock ?? true,
    variants: productData.variants || [],
  };

  const { error } = await supabase
    .from('products')
    .upsert(row);
  if (error) throw error;

  invalidateProductCache();
  return row;
};

/**
 * Deletes a product from the database.
 * Why: Allows administrators to remove catalog items.
 * @danishansari-dev productId - The target product ID string
 * @returns {Promise<boolean>} True if successful
 */
export const adminDeleteProduct = async (productId) => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw error;

  invalidateProductCache();
  return true;
};

// ─── Default Export (Axios mock instance) ────────────────────────────


const mockApi = {
  get: async (url) => {
    if (url === '/auth/me') {
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            return {
              data: {
                success: true,
                data: {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.name || 'User',
                },
              },
            };
          }
        } catch { /* fallback to mock */ }
      }
      
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
