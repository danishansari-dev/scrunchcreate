/**
 * Why this file exists:
 * The project has been decoupled from the backend node/express REST API.
 * This service layer is completely mocked client-side using browser localStorage
 * to allow standalone, offline-ready operation without breaking existing components.
 */

import { getProducts as loadLocalProducts } from '../utils/getProducts';

// Product cache so we do not have to map and format local JSON products on every call.
let productCache = null;

/**
 * Creates a structured error object mimicking Axios' error shape
 * @danishansari-dev message - The descriptive error message
 * @danishansari-dev status - The HTTP status code representation
 * @returns An error object with a mock axios response object attached
 */
function createAxiosError(message, status = 400) {
  const error = new Error(message);
  // Tricky logic: Existing pages inspect error.response.data.message.
  // We mimic this Axios structure so that frontend error blocks and toasts process errors correctly.
  error.response = {
    status,
    data: {
      success: false,
      message,
    },
  };
  return error;
}

// ─── Local Database Helpers ──────────────────────────────────────────

/**
 * Retrieves list of registered mock users from localStorage
 * @returns Array of user objects
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
 * @danishansari-dev users - Array of user objects
 */
const saveStoredUsers = (users) => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

/**
 * Retrieves user's local cart items from localStorage
 * @danishansari-dev email - User's email identifier
 * @returns Array of cart items { productId, quantity }
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
 * @danishansari-dev email - User's email identifier
 * @danishansari-dev cart - Array of cart items
 */
const saveStoredCart = (email, cart) => {
  localStorage.setItem(`mock_cart_${email}`, JSON.stringify(cart));
};

/**
 * Retrieves user's order history from localStorage
 * @danishansari-dev email - User's email identifier
 * @returns Array of order objects
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
 * @danishansari-dev email - User's email identifier
 * @danishansari-dev orders - Array of order objects
 */
const saveStoredOrders = (email, orders) => {
  localStorage.setItem(`mock_orders_${email}`, JSON.stringify(orders));
};

// ─── Named Exports ───────────────────────────────────────────────────

/**
 * Fetches all products from the local JSON store
 * @returns Promise resolving to an array of products
 */
export const getProducts = async () => {
  if (productCache) {
    return productCache;
  }
  // Load local product list using the formatting helper.
  productCache = loadLocalProducts();
  return productCache;
};

/**
 * Resets the local product cache
 */
export const invalidateProductCache = () => {
  productCache = null;
};

/**
 * Finds a single product using its slug
 * @danishansari-dev slug - The slug identifier of the product
 * @returns Promise resolving to the matching product or null
 */
export const getProductBySlug = async (slug) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
};

/**
 * Filters products by their category
 * @danishansari-dev category - The category name
 * @returns Promise resolving to matching products
 */
export const getProductsByCategory = async (category) => {
  const products = await getProducts();
  return products.filter(
    (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Filters other variants of the same product type
 * @danishansari-dev product - Current product reference
 * @returns Promise resolving to matching sibling variant products
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
 * Fetches a product by its ID
 * @danishansari-dev id - The product ID
 * @returns Promise resolving to the product
 */
export const getProduct = async (id) => {
  const products = await getProducts();
  const found = products.find((p) => p.id === id || p._id === id);
  if (!found) {
    throw createAxiosError('Product not found.', 404);
  }
  return found;
};

/**
 * Registers a new user locally
 * @danishansari-dev name - New user's name
 * @danishansari-dev email - User's email address
 * @danishansari-dev password - User's password
 * @returns Promise resolving to the register response
 */
export const register = async (name, email, password) => {
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw createAxiosError('User already exists with this email.');
  }

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

  return {
    success: true,
    token,
    data: newUser,
  };
};

/**
 * Logs in a user locally
 * @danishansari-dev email - Registered user's email
 * @danishansari-dev password - Plaintext password
 * @returns Promise resolving to the login response
 */
export const login = async (email, password) => {
  const users = getStoredUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!foundUser || foundUser.password !== password) {
    throw createAxiosError('Invalid email or password.');
  }

  const token = `mock-jwt-${foundUser._id}`;
  localStorage.setItem('token', token);
  localStorage.setItem('mock_current_user', JSON.stringify(foundUser));

  return {
    success: true,
    token,
    data: foundUser,
  };
};

/**
 * Places a new order and prepares WhatsApp payload reference
 * @danishansari-dev orderData - Object containing items list and shipping address
 * @returns Promise resolving to the order confirmation
 */
export const placeOrder = async (orderData) => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';

  const products = await getProducts();
  const orderItems = orderData.items
    .map((item) => {
      const product = products.find(
        (p) => p.id === item.productId || p._id === item.productId
      );
      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter((item) => item.product);

  // Build enriched order with contact, payment, coupon, and fee data
  // so the confirmation page can display full details without recalculating.
  const newOrder = {
    _id: `order_${Date.now()}`,
    user: user ? user._id : 'guest',
    items: orderItems,
    shippingAddress: orderData.shippingAddress,
    contact: orderData.contact || null,
    payment: orderData.payment || null,
    coupon: orderData.coupon || null,
    couponDiscount: orderData.couponDiscount || 0,
    deliveryFee: orderData.deliveryFee ?? 0,
    codFee: orderData.codFee || 0,
    total: orderData.total || 0,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const orders = getStoredOrders(email);
  orders.push(newOrder);
  saveStoredOrders(email, orders);

  // Tricky logic: Save the last order payload in localStorage
  // so the post-checkout /order-success page can access it and generate the WhatsApp deep link.
  localStorage.setItem('last_order', JSON.stringify(newOrder));

  return {
    success: true,
    data: newOrder,
  };
};

/**
 * Fetches current user's order history
 * @returns Promise resolving to orders array
 */
export const getMyOrders = async () => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
  return getStoredOrders(email);
};

/**
 * Fetches user's cart
 * @returns Promise resolving to cart items array
 */
export const getCart = async () => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
  const cartItems = getStoredCart(email);

  const products = await getProducts();
  return cartItems
    .map((item) => {
      const product = products.find(
        (p) => p.id === item.productId || p._id === item.productId
      );
      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter((item) => item.product);
};

/**
 * Adds an item to the cart
 * @danishansari-dev productId - The product ID
 * @danishansari-dev quantity - Quantity to add
 * @returns Promise resolving to the updated cart
 */
export const addToCartAPI = async (productId, quantity = 1) => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
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
 * @danishansari-dev productId - The product ID
 * @danishansari-dev quantity - The target quantity
 * @returns Promise resolving to the updated cart
 */
export const updateCartItemAPI = async (productId, quantity) => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
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
 * @danishansari-dev productId - The product ID
 * @returns Promise resolving to the updated cart
 */
export const removeFromCartAPI = async (productId) => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
  let cartItems = getStoredCart(email);

  cartItems = cartItems.filter((item) => item.productId !== productId);

  saveStoredCart(email, cartItems);
  return getCart();
};

/**
 * Clears the user's cart
 * @returns Promise resolving to empty array
 */
export const clearCartAPI = async () => {
  const userStr = localStorage.getItem('mock_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const email = user ? user.email : 'guest';
  saveStoredCart(email, []);
  return [];
};

// ─── Default Export (Axios mock instance) ───────────────────────────

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
    request: {
      use: () => {},
    },
    response: {
      use: () => {},
    },
  },
};

export default mockApi;
