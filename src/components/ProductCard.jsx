import React, { useState, useEffect } from 'react'
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
)

const HeartFilled = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
)

export default function ProductCard({ product, index = 0 }) {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { show } = useToast()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Local variant strictly for Image Swapping within the card
    const [activeVariantId, setActiveVariantId] = useState(null)

    // Reset local state if product changes entirely
    useEffect(() => {
        setActiveVariantId(null)
    }, [product.id])

    const activeVariant = activeVariantId
        ? product.variants?.find(v => v.id === activeVariantId)
        : null;

    // Use activeVariant's image if explicitly selected, else fallback to the hook's returned primaryImage
    const primaryImageRaw = activeVariant?.images?.[0] || product.primaryImage || (product.images && product.images.length > 0 ? product.images[0] : null) || product.image || (product.variants?.[0]?.images?.[0]) || null;
    const secondaryImageRaw = activeVariant?.images?.[1] || (product.images && product.images.length > 1 ? product.images[1] : null) || (product.variants?.[0]?.images?.length > 1 ? product.variants[0].images[1] : null);

    const primaryImage = primaryImageRaw ? resolveImagePath(primaryImageRaw) : null;
    const secondaryImage = secondaryImageRaw ? resolveImagePath(secondaryImageRaw) : null;
    const hasMultipleImages = !!secondaryImage && !imageError;

    const inWishlist = isInWishlist(product.id);

    if (!primaryImage || imageError) return null;

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
        e.preventDefault()

        // ALWAYS Add to Cart, use strictly explicitly selected variant or default first variant
        const variantTarget = activeVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null)

        const cartItem = variantTarget ? {
            ...product,
            id: variantTarget.id,
            variantId: variantTarget.id,
            color: variantTarget.color,
            image: resolveImagePath(variantTarget.images[0] || product.image),
            slug: product.slug
        } : product

        const ok = addToCart(cartItem, 1)
        if (!ok) {
            navigate('/signin')
        } else {
            show('Added to cart', 'success')
        }
    }

    const isMultiVariant = product.variants && product.variants.length > 1

    return (
        <motion.li
            className={styles.card}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.imageContainer} onClick={handleProductClick}>
                {/* Primary Image */}
                <img
                    src={primaryImage}
                    alt={product.name}
                    className={`${styles.thumbImage} ${!isHovered || !hasMultipleImages ? styles.thumbImageVisible : ''}`}
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
                {/* Secondary Image (only rendered if exists) */}
                {hasMultipleImages && (
                    <img
                        src={secondaryImage}
                        alt={`${product.name} alternate view`}
                        className={`${styles.thumbImage} ${styles.secondaryImage} ${isHovered ? styles.thumbImageVisible : ''}`}
                        loading="lazy"
                    />
                )}

                {/* Status Badge (Top-Left) */}
                {(product.isNew || product.badge || index % 3 === 0) && (
                    <span className={styles.statusBadge}>
                        {product.badge || (index % 3 === 0 ? 'NEW' : 'BEST SELLER')}
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ''}`}
                    onClick={handleWishlistClick}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    type="button"
                >
                    {inWishlist ? <HeartFilled /> : <HeartOutline />}
                </button>

                {/* Quick Add To Cart Form */}
                <div className={styles.quickAddContainer}>
                    <button
                        type="button"
                        className={styles.quickAddBtn}
                        onClick={handleAddToCart}
                    >
                        Quick Add
                    </button>
                </div>
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

                {isMultiVariant && (
                    <div className={styles.variantsRow}>
                        {product.variants.slice(0, 4).map((v, i) => {
                            const isSelected = activeVariantId === v.id || (!activeVariantId && i === 0);
                            return (
                                <button
                                    key={v.id || i}
                                    className={`${styles.variantSwatch} ${isSelected ? styles.variantActive : ''}`}
                                    style={{ backgroundColor: v.colorHex || v.color || '#ccc' }}
                                    aria-label={`Select ${v.color} variant`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setActiveVariantId(v.id);
                                    }}
                                />
                            )
                        })}
                        {product.variants.length > 4 && (
                            <span className={styles.variantMore}>+{product.variants.length - 4}</span>
                        )}
                    </div>
                )}

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
        </motion.li>
    )
}
