/* eslint-disable react-refresh/only-export-components */
/**
 * Why this file exists:
 * Manages cart state globally for the application. Since authentication has
 * been completely removed, it operates client-side for all visitors without
 * checking for active user accounts or tokens.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI, clearCartAPI } from '../services/api';
import { useToast } from './ToastContext';

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
  const { show } = useToast();

  // Load the initial cart on component mounting
  useEffect(() => {
    getCart()
      .then((data) => {
        const mappedItems = data.map(normalizeItem).filter(Boolean);
        setItems(mappedItems);
      })
      .catch((err) => console.error('Failed to load cart on mount:', err));
  }, []);

  // Cart Drawer togglers
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  /**
   * Adds product quantity to cart
   * @danishansari-dev product - Product model to add
   * @danishansari-dev qty - Item count to append
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
   * @danishansari-dev id - Product identifier to remove
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
   * @danishansari-dev id - Product identifier to update
   * @danishansari-dev qty - New quantity count
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
   * @danishansari-dev id - Product identifier
   */
  const increment = async (id) => {
    const item = items.find((p) => p.id === id);
    if (item) {
      updateQuantity(id, item.qty + 1);
    }
  };

  /**
   * Decrements item count by 1 (removes if count drops to 0)
   * @danishansari-dev id - Product identifier
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
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const totalItems = useMemo(() => items.reduce((sum, p) => sum + p.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.price * p.qty, 0), [items]);

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
