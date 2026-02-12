import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function readCartFromStorage() {
  try {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCartToStorage(items) {
  try {
    localStorage.setItem('cart', JSON.stringify(items))
  } catch {
    // ignore
  }
}

function normalizeItem(item) {
  return {
    ...item,
    price: item.offerPrice || item.price || 0
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = readCartFromStorage()
    return stored.map(normalizeItem)
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    writeCartToStorage(items)
  }, [items])

  // Drawer controls
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  const addToCart = (product, qty = 1) => {
    const itemToAdd = normalizeItem({ ...product, qty })

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === itemToAdd.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, itemToAdd]
    })
    // Open cart drawer when item is added
    setIsCartOpen(true)
    return true
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const updateQuantity = (id, qty) => {
    const normalized = Math.max(1, Math.floor(qty || 1))
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: normalized } : p)))
  }

  const increment = (id) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)))
  }

  const decrement = (id) => {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id) // Find the item
      if (item?.qty === 1) {
        return prev.filter((p) => p.id !== id) // Remove if qty is 1
      }
      return prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p)) // Else decrement
    })
  }

  const clearCart = () => setItems([])

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
