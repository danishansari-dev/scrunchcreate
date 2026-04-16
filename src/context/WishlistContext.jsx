import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WishlistContext = createContext()

const STORAGE_KEY = 'scrunch_wishlist'

export function WishlistProvider({ children }) {
    // robust initializer to parse and sanitize local storage
    const [wishlist, setWishlist] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (!stored) return []

            const parsed = JSON.parse(stored)

            // Ensure valid array of strings and deduplicate
            if (Array.isArray(parsed)) {
                return [...new Set(parsed.filter(id => typeof id === 'string' && id.trim() !== ''))]
            }
            return []
        } catch (e) {
            console.error('Failed to parse wishlist from storage:', e)
            return []
        }
    })

    // Persist to localStorage whenever wishlist changes
    // using a ref or just simple effect is fine since we want to trigger on state change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
        } catch (e) {
            console.error('Failed to save wishlist:', e)
        }
    }, [wishlist])

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : []
                    if (Array.isArray(newValue)) {
                        const uniqueIds = [...new Set(newValue.filter(id => typeof id === 'string' && id.trim() !== ''))]
                        // Update state only if different to avoid loops (though Set prevents order issues mostly, length check helps)
                        setWishlist(prev => {
                            if (JSON.stringify(prev) !== JSON.stringify(uniqueIds)) {
                                return uniqueIds
                            }
                            return prev
                        })
                    }
                } catch (err) {
                    console.error('Sync failed:', err)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const isInWishlist = useCallback((productId) => {
        return wishlist.includes(productId)
    }, [wishlist])

    const toggleWishlist = useCallback((productId) => {
        if (!productId || typeof productId !== 'string') return

        setWishlist(prev => {
            const asSet = new Set(prev)
            if (asSet.has(productId)) {
                asSet.delete(productId)
            } else {
                asSet.add(productId)
            }
            return [...asSet]
        })
    }, [])

    const addToWishlist = useCallback((productId) => {
        if (!productId || typeof productId !== 'string') return

        setWishlist(prev => {
            const asSet = new Set(prev)
            if (!asSet.has(productId)) {
                asSet.add(productId)
                return [...asSet]
            }
            return prev
        })
    }, [])

    const removeFromWishlist = useCallback((productId) => {
        setWishlist(prev => prev.filter(id => id !== productId))
    }, [])

    const clearWishlist = useCallback(() => {
        setWishlist([])
        localStorage.removeItem(STORAGE_KEY)
    }, [])

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
