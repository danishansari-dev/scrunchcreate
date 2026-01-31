import React, { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

const STORAGE_KEY = 'scrunch_wishlist'

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    // Persist to localStorage whenever wishlist changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
        } catch (e) {
            console.error('Failed to save wishlist:', e)
        }
    }, [wishlist])

    const isInWishlist = (productId) => {
        return wishlist.includes(productId)
    }

    const toggleWishlist = (productId) => {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId)
            } else {
                return [...prev, productId]
            }
        })
    }

    const addToWishlist = (productId) => {
        setWishlist(prev => {
            if (prev.includes(productId)) return prev
            return [...prev, productId]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(id => id !== productId))
    }

    const clearWishlist = () => {
        setWishlist([])
    }

    const value = {
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
    }

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}

export default WishlistContext
