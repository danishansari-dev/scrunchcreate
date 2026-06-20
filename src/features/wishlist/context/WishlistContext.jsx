/* eslint-disable react-refresh/only-export-components */
// Why: WishlistContext exports both WishlistProvider and useWishlist hook, triggering react-refresh warnings.
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import {
    getWishlistAPI,
    addToWishlistAPI,
    removeFromWishlistAPI,
    clearWishlistAPI,
    mergeGuestWishlistIntoUserWishlist
} from '../../../services/api'

const WishlistContext = createContext()

const STORAGE_KEY = 'scrunch_wishlist'

/**
 * WishlistProvider manages the wishlist items globally.
 * Why: Allows users to save favorite products. Authenticated users sync to Supabase,
 * while guest users use localStorage.
 * @danishansari-dev children - React component children nodes
 */
export function WishlistProvider({ children }) {
    const { user } = useAuth()
    
    // Initialize wishlist state locally. Overwritten by database loading when authenticated.
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

    // Sync database/local storage state whenever user logs in or out
    // Why: Logged-in users should retrieve their items from Supabase after merging guest items,
    // while logged-out users fall back to localStorage.
    useEffect(() => {
        let active = true
        const syncState = async () => {
            if (user) {
                // Merge guest wishlist into user DB wishlist on transition to authenticated
                await mergeGuestWishlistIntoUserWishlist()
                const dbItems = await getWishlistAPI()
                if (active) {
                    setWishlist(dbItems)
                }
            } else {
                // Reload from local storage when logging out
                try {
                    const stored = localStorage.getItem(STORAGE_KEY)
                    if (stored) {
                        const parsed = JSON.parse(stored)
                        if (Array.isArray(parsed) && active) {
                            setWishlist([...new Set(parsed.filter(id => typeof id === 'string' && id.trim() !== ''))])
                            return
                        }
                    }
                } catch (e) {
                    console.error('Failed to reload local wishlist:', e)
                }
                if (active) {
                    setWishlist([])
                }
            }
        }
        
        syncState()
        return () => {
            active = false
        }
    }, [user])

    // Persist to localStorage whenever wishlist changes, but ONLY for guest users
    // Why: Logged-in user wishlist items should not clutter the local browser storage.
    useEffect(() => {
        if (user) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
        } catch (e) {
            console.error('Failed to save wishlist:', e)
        }
    }, [wishlist, user])

    // Sync across tabs, but only for guest users
    // Why: Cross-device tabs check local storage transitions, while logged-in sync is database-backed.
    useEffect(() => {
        if (user) return;
        
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : []
                    if (Array.isArray(newValue)) {
                        const uniqueIds = [...new Set(newValue.filter(id => typeof id === 'string' && id.trim() !== ''))]
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
    }, [user])

    /**
     * Determines whether a product is currently in the wishlist
     * Why: Used by UI buttons to show active / inactive heart icons.
     * @danishansari-dev productId - Product unique ID string
     * @returns Boolean indicating if product is wishlisted
     */
    const isInWishlist = useCallback((productId) => {
        return wishlist.includes(productId)
    }, [wishlist])

    /**
     * Toggles a product in and out of the wishlist
     * Why: Simplifies heart icon click handlers.
     * @danishansari-dev productId - Product unique ID string
     */
    const toggleWishlist = useCallback(async (productId) => {
        if (!productId || typeof productId !== 'string') return

        const inWish = wishlist.includes(productId)

        // Optimistic UI update
        setWishlist(prev => {
            const asSet = new Set(prev)
            if (asSet.has(productId)) {
                asSet.delete(productId)
            } else {
                asSet.add(productId)
            }
            return [...asSet]
        })

        if (user) {
            try {
                if (inWish) {
                    await removeFromWishlistAPI(productId)
                } else {
                    await addToWishlistAPI(productId)
                }
            } catch (err) {
                console.error('Failed to toggle wishlist in DB:', err)
            }
        }
    }, [wishlist, user])

    /**
     * Adds a product to the wishlist
     * Why: Explicit action from product detail or comparison pages.
     * @danishansari-dev productId - Product unique ID string
     */
    const addToWishlist = useCallback(async (productId) => {
        if (!productId || typeof productId !== 'string') return

        const inWish = wishlist.includes(productId)
        if (inWish) return

        // Optimistic UI update
        setWishlist(prev => {
            const asSet = new Set(prev)
            asSet.add(productId)
            return [...asSet]
        })

        if (user) {
            try {
                await addToWishlistAPI(productId)
            } catch (err) {
                console.error('Failed to add to wishlist in DB:', err)
            }
        }
    }, [wishlist, user])

    /**
     * Removes a product from the wishlist
     * Why: Allows direct removal of item without toggling state.
     * @danishansari-dev productId - Product unique ID string
     */
    const removeFromWishlist = useCallback(async (productId) => {
        setWishlist(prev => prev.filter(id => id !== productId))

        if (user) {
            try {
                await removeFromWishlistAPI(productId)
            } catch (err) {
                console.error('Failed to remove from wishlist in DB:', err)
            }
        }
    }, [user])

    /**
     * Clears all items from the wishlist
     * Why: Allows users to reset their preferences.
     */
    const clearWishlist = useCallback(async () => {
        setWishlist([])
        if (user) {
            try {
                await clearWishlistAPI()
            } catch (err) {
                console.error('Failed to clear wishlist in DB:', err)
            }
        } else {
            localStorage.removeItem(STORAGE_KEY)
        }
    }, [user])

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
