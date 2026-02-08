import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './ProductCard.module.css'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { resolveImagePath } from '../utils/getProducts'
import { createSlug } from '../utils/productUtils'

// Heart Icon SVG components
const HeartOutline = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
)

const HeartFilled = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
)

export default function ProductCard({ product, index = 0 }) {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { show } = useToast()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [isHovered, setIsHovered] = useState(false)

    const images = product.images || []
    // Handle both array of strings and product.image property
    const primaryImageRaw = images[0] || product.image || null
    const secondaryImageRaw = images.length > 1 ? images[1] : null

    const primaryImage = primaryImageRaw ? resolveImagePath(primaryImageRaw) : null
    const secondaryImage = secondaryImageRaw ? resolveImagePath(secondaryImageRaw) : null
    const hasMultipleImages = !!secondaryImage

    const inWishlist = isInWishlist(product.id)

    const handleWishlistClick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        toggleWishlist(product.id)
        show(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'success')
    }

    const handleProductClick = () => {
        navigate(`/product/${product.slug || createSlug(product.name)}`)
    }

    const handleAddToCart = (e) => {
        e.stopPropagation()
        const ok = addToCart(product, 1)
        if (!ok) {
            navigate('/signin')
        } else {
            show('Added to cart', 'success')
        }
    }

    return (
        <motion.li
            className={styles.card}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
            layout // Add layout prop for smooth list reordering
        >
            <div className={styles.imageContainer}>
                <button
                    className={styles.thumb}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onFocus={() => setIsHovered(true)}
                    onBlur={() => setIsHovered(false)}
                    aria-label={`View ${product.name}`}
                    onClick={handleProductClick}
                >
                    {/* Primary Image */}
                    <div
                        className={`${styles.thumbImage} ${!isHovered || !hasMultipleImages ? styles.thumbImageVisible : ''}`}
                        style={primaryImage ? { backgroundImage: `url(${primaryImage})` } : {}}
                    />
                    {/* Secondary Image (only rendered if exists) */}
                    {hasMultipleImages && (
                        <div
                            className={`${styles.thumbImage} ${isHovered ? styles.thumbImageVisible : ''}`}
                            style={{ backgroundImage: `url(${secondaryImage})` }}
                        />
                    )}
                </button>

                {/* Wishlist Button */}
                <button
                    className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ''}`}
                    onClick={handleWishlistClick}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    type="button"
                >
                    {inWishlist ? <HeartFilled /> : <HeartOutline />}
                </button>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.titleRow}>
                    <button
                        className={styles.titleButton}
                        onClick={handleProductClick}
                    >
                        <h3 className={styles.cardTitle}>{product.name}</h3>
                    </button>
                </div>

                <div className={styles.meta}>
                    <div className={styles.priceContainer}>
                        <span className={styles.offerPrice}>₹{product.offerPrice?.toLocaleString('en-IN') || product.price?.toLocaleString('en-IN') || '0'}</span>
                        {product.discountPercent > 0 && product.originalPrice && (
                            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                        {product.discountPercent > 0 && (
                            <span className={styles.discountBadge}>
                                {product.discountPercent}% OFF
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.addToCart}
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </button>
            </div>
        </motion.li>
    )
}
