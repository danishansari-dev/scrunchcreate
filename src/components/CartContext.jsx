import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI, clearCartAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

function normalizeItem({ product, quantity }) {
  if (!product) return null;
  return {
    ...product,
    id: product._id || product.id,
    qty: quantity,
    price: product.offerPrice || product.price || 0
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const authContext = useAuth()
  if (!authContext) {
    throw new Error('CartProvider must be used within AuthProvider')
  }
  const { user, token } = authContext
  const { show } = useToast()

  // Fetch cart initially when user auth token changes
  useEffect(() => {
    if (user && token) {
      getCart()
        .then(data => {
          const mappedItems = data.map(normalizeItem).filter(Boolean);
          setItems(mappedItems);
        })
        .catch(err => console.error('Failed to fetch cart:', err))
    } else {
      setItems([]) // clear cart if logged out
    }
  }, [user, token])

  // Drawer controls
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      show('Please login to add items to your cart', 'error');
      openCart(); // maybe open the drawer to show something, or just let them go to login
      return false;
    }

    const productId = product._id || product.id;
    try {
      // Optimistic upate (optional but better UX for simple apps, here we just update state after API success to be safe)
      await addToCartAPI(productId, qty)
      
      // Update local state without fetching whole cart to save requests
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === productId)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
          return next
        }
        return [...prev, normalizeItem({ product, quantity: qty })]
      })
      
      show('Added to cart', 'success');
      setIsCartOpen(true)
      return true
    } catch (err) {
      console.error(err)
      show('Failed to add to cart', 'error')
      return false
    }
  }

  const removeFromCart = async (id) => {
    try {
      await removeFromCartAPI(id)
      setItems((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      show('Failed to remove item', 'error')
    }
  }

  const updateQuantity = async (id, qty) => {
    const normalized = Math.max(1, Math.floor(qty || 1))
    try {
      await updateCartItemAPI(id, normalized)
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: normalized } : p)))
    } catch (err) {
      console.error(err)
      show('Failed to update quantity', 'error')
    }
  }

  const increment = async (id) => {
    const item = items.find((p) => p.id === id);
    if (item) updateQuantity(id, item.qty + 1);
  }

  const decrement = async (id) => {
    const item = items.find((p) => p.id === id);
    if (!item) return;

    if (item.qty === 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, item.qty - 1);
    }
  }

  const clearCart = async () => {
    try {
      await clearCartAPI()
      setItems([])
    } catch(err) {
      console.error(err)
    }
  }

  const totalItems = useMemo(() => items.reduce((sum, p) => sum + p.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.price * p.qty, 0), [items])

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
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
