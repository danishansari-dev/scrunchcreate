/* eslint-disable react-refresh/only-export-components */
// Why: CartContext exports both CartProvider and useCart hook, triggering react-refresh warnings.
/**
 * Why this file exists:
 * Manages cart state globally for the application. Since authentication has
 * been completely removed, it operates client-side for all visitors without
 * checking for active user accounts or tokens.
 *
 * Extended to include: coupon management, centralized shipping calculation,
 * cross-sell recommendations, and savings tracking.
 */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI, clearCartAPI, getProducts } from '../../../services/api';
import { useToast } from '../../../components/ToastContext';
import { validateCoupon, calculateDeliveryFee } from '../utils/couponUtils';
import { shuffle } from '../../../shared/utils/shuffle';
import { FREE_SHIPPING_THRESHOLD } from '../config/coupons';
import { useAuth } from '../../auth/context/AuthContext';

const CartContext = createContext(null);

/**
 * Normalizes a cart item to standard layout
 * @danishansari-dev param0 - Item containing product and quantity properties
 * @returns Normalized cart item object
 */
function normalizeItem({ product, quantity }) {
  if (!product) return null;
  return {
    ...product,
    id: product._id || product.id,
    qty: quantity,
    price: product.offerPrice || product.price || 0,
  };
}

/**
 * CartProvider component serving cart capabilities client-side
 * @danishansari-dev children - Child React nodes
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const { show } = useToast();
  const { user } = useAuth();

  // Load all products for cross-sell recommendations once on mount
  useEffect(() => {
    getProducts()
      .then((prods) => setAllProducts(prods))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  // Sync cart state with database/localStorage whenever user auth status changes
  // Why: Users should see their user-specific DB cart when logging in, and fallback to guest localStorage when logging out.
  useEffect(() => {
    getCart()
      .then((data) => {
        const mappedItems = data.map(normalizeItem).filter(Boolean);
        setItems(mappedItems);
      })
      .catch((err) => console.error('Failed to load cart:', err));
  }, [user]);

  // Cart Drawer togglers
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  /**
   * Adds product quantity to cart
   * @param product - Product model to add
   * @param qty - Item count to append
   * @returns Success boolean indicator
   */
  const addToCart = async (product, qty = 1) => {
    const productId = product._id || product.id;
    try {
      await addToCartAPI(productId, qty);

      // Update local React state
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === productId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [...prev, normalizeItem({ product, quantity: qty })];
      });

      show('Added to cart', 'success');
      setIsCartOpen(true);
      return true;
    } catch (err) {
      console.error('Failed to add product to cart:', err);
      show('Failed to add to cart', 'error');
      return false;
    }
  };

  /**
   * Removes item from cart
   * @param id - Product identifier to remove
   */
  const removeFromCart = async (id) => {
    try {
      await removeFromCartAPI(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to remove product from cart:', err);
      show('Failed to remove item', 'error');
    }
  };

  /**
   * Updates cart item count
   * @param id - Product identifier to update
   * @param qty - New quantity count
   */
  const updateQuantity = async (id, qty) => {
    const normalized = Math.max(1, Math.floor(qty || 1));
    try {
      await updateCartItemAPI(id, normalized);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: normalized } : p)));
    } catch (err) {
      console.error('Failed to update product quantity:', err);
      show('Failed to update quantity', 'error');
    }
  };

  /**
   * Increments item count by 1
   * @param id - Product identifier
   */
  const increment = async (id) => {
    const item = items.find((p) => p.id === id);
    if (item) {
      updateQuantity(id, item.qty + 1);
    }
  };

  /**
   * Decrements item count by 1 (removes if count drops to 0)
   * @param id - Product identifier
   */
  const decrement = async (id) => {
    const item = items.find((p) => p.id === id);
    if (!item) return;

    if (item.qty === 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, item.qty - 1);
    }
  };

  /**
   * Clears the cart completely
   */
  const clearCart = async () => {
    try {
      await clearCartAPI();
      setItems([]);
      // Also clear any applied coupon
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError('');
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  /**
   * Applies a coupon code to the cart
   * @param code - The coupon code string
   * @returns {{ success: boolean, error: string|null }}
   */
  const applyCoupon = useCallback((code) => {
    const currentSubtotal = items.reduce((sum, p) => sum + p.price * p.qty, 0);
    const result = validateCoupon(code, currentSubtotal);

    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setCouponError('');
      show(`Coupon applied! You save ₹${result.discount}`, 'success');
      return { success: true, error: null };
    } else {
      setCouponError(result.error);
      return { success: false, error: result.error };
    }
  }, [items, show]);

  /**
   * Removes the applied coupon
   */
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  }, []);

  /**
   * Returns 2-3 product recommendations not already in cart
   * Prioritizes products from the same categories as cart items
   */
  const getRecommendations = useCallback(() => {
    if (allProducts.length === 0) return [];

    const cartIds = new Set(items.map((i) => i.id));
    const cartCategories = new Set(items.map((i) => i.category).filter(Boolean));

    // First: items from same categories but not in cart
    let candidates = allProducts.filter(
      (p) => !cartIds.has(p.id) && !cartIds.has(p._id) && cartCategories.has(p.category)
    );

    // If not enough same-category items, fill with other products
    if (candidates.length < 3) {
      const otherProducts = allProducts.filter(
        (p) => !cartIds.has(p.id) && !cartIds.has(p._id) && !cartCategories.has(p.category)
      );
      candidates = [...candidates, ...otherProducts];
    }

    // Shuffle and take 3
    const shuffled = shuffle(candidates);
    return shuffled.slice(0, 3);
  }, [items, allProducts]);

  // ─── Computed values ───────────────────────────────────────────
  const totalItems = useMemo(() => items.reduce((sum, p) => sum + p.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.price * p.qty, 0), [items]);

  // Total savings from MRP vs offer price
  const totalSavings = useMemo(() => {
    return items.reduce((sum, p) => {
      const original = p.originalPrice || p.mrp || p.price;
      const offer = p.offerPrice || p.price;
      return sum + (original - offer) * p.qty;
    }, 0);
  }, [items]);

  const deliveryFee = useMemo(
    () => calculateDeliveryFee(subtotal, appliedCoupon),
    [subtotal, appliedCoupon]
  );

  // Re-validate coupon when subtotal changes (items may have been removed)
  useEffect(() => {
    if (appliedCoupon) {
      const result = validateCoupon(appliedCoupon.code, subtotal);
      if (result.valid) {
        setCouponDiscount(result.discount);
      } else {
        // Coupon no longer valid (e.g., subtotal dropped below minimum)
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError('');
      }
    }
  }, [subtotal, appliedCoupon]);

  const grandTotal = useMemo(
    () => Math.max(0, subtotal + deliveryFee - couponDiscount),
    [subtotal, deliveryFee, couponDiscount]
  );

  // How much more to spend for free shipping
  const amountToFreeShipping = useMemo(
    () => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    [subtotal]
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    totalItems,
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    // Coupon support
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCoupon,
    removeCoupon,
    // Shipping & totals
    deliveryFee,
    grandTotal,
    totalSavings,
    amountToFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    // Recommendations
    getRecommendations,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to consume CartContext
 * @returns Cart capabilities
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
