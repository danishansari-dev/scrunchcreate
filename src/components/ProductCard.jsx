import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import styles from './ProductCard.module.css'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { formatTypeName, getCategoryDisplayName } from '../utils/catalogDisplay'
import { getColorDisplayName, isCanonicalColor, normalizeColor } from '../utils/colorNormalization'
import { createSlug } from '../utils/productUtils'

/**
 * Renders a wishlist outline icon without depending on a separate icon bundle.
 * @returns Heart outline SVG
 */
const HeartOutline = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
)

/**
 * Renders a filled wishlist icon for selected products.
 * @returns Filled heart SVG
 */
const HeartFilled = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
)

/**
 * Formats INR prices without adding locale-dependent visual surprises to the card.
 * @danishansari-dev amount - Numeric price value
 * @returns Rupee-prefixed price text
 */
function formatPrice(amount) {
    return `\u20b9${Number(amount || 0).toLocaleString('en-IN')}`
}

/**
 * Creates deterministic merchandising cues from product data while preserving the source data.
 * @danishansari-dev product - Product being rendered
 * @danishansari-dev index - Product position in the current grid
 * @returns Badge label for the product image
 */
function getMerchBadge(product, index) {
    if (product.badge) return product.badge
    if (product.isNew || index % 7 === 0) return 'New Arrival'
    if ((product.discountPercent || 0) >= 20) return 'Best Seller'
    if (index % 5 === 0) return 'Trending'
    return ''
}

/**
 * Stores recent product views for the catalogue discovery rail.
 * @danishansari-dev productId - Product identifier to store
 */
function rememberRecentlyViewed(productId) {
    if (!productId) return

    try {
        const parsed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]')
        const existing = Array.isArray(parsed) ? parsed : []
        const next = [productId, ...existing.filter((id) => id !== productId)].slice(0, 8)
        localStorage.setItem('recently_viewed_products', JSON.stringify(next))
    } catch {
        localStorage.setItem('recently_viewed_products', JSON.stringify([productId]))
    }
}

/**
 * Renders a premium product card with discovery signals and commerce actions.
 * @danishansari-dev product - Product data from the catalogue
 * @danishansari-dev index - Product index used for stagger and deterministic badges
 * @returns Product list item card
 */
export default function ProductCard({ product, index = 0 }) {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { show } = useToast()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [activeVariantId, setActiveVariantId] = useState(null)
    const [imageOffset, setImageOffset] = useState(0)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

    const targetId = product.id || product._id
    const inWishlist = isInWishlist(targetId)
    const selectedVariant = useMemo(
        () => product.variants?.find((variant) => variant.id === activeVariantId) || null,
        [activeVariantId, product.variants]
    )

    const imageSet = useMemo(() => {
        if (selectedVariant?.images?.length) return selectedVariant.images
        if (product.images?.length) return product.images
        return product.primaryImage ? [product.primaryImage] : []
    }, [product.images, product.primaryImage, selectedVariant])
    const primaryImage = imageSet[imageOffset] || imageSet[0]
    const secondaryImage = imageSet[imageOffset + 1] || imageSet[1]
    const hasMultipleImages = Boolean(secondaryImage && secondaryImage !== primaryImage)
    const visibleColorVariants = useMemo(
        () => product.variants?.filter((variant) => isCanonicalColor(variant.color)) || [],
        [product.variants]
    )
    const isMultiVariant = visibleColorVariants.length > 1
    const badge = getMerchBadge(product, index)
    const rating = (4.7 + (index % 3) * 0.1).toFixed(1)
    const reviewCount = 18 + (index % 6) * 7

    useEffect(() => {
        setActiveVariantId(null)
        setImageOffset(0)
    }, [product.id])

    useEffect(() => {
        setImageOffset(0)
    }, [selectedVariant?.id])

    useEffect(() => {
        setIsImageLoaded(false)
        setImageError(false)
    }, [primaryImage])

    useEffect(() => {
        if (!isQuickViewOpen) return undefined

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsQuickViewOpen(false)
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isQuickViewOpen])

    if (!primaryImage && !imageError) return null

    const handleWishlistClick = (event) => {
        event.stopPropagation()
        event.preventDefault()
        toggleWishlist(targetId)
        show(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'success')
    }

    const handleProductClick = () => {
        rememberRecentlyViewed(targetId)
        navigate(`/product/${product.slug || createSlug(product.name)}`)
    }

    const buildCartItem = () => {
        const variantTarget = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null)

        return variantTarget ? {
            ...product,
            id: variantTarget.id,
            variantId: variantTarget.id,
            color: variantTarget.color,
            image: variantTarget.images?.[0] || primaryImage,
            slug: product.slug
        } : product
    }

    const handleAddToCart = async (event) => {
        event?.stopPropagation()
        event?.preventDefault()
        await addToCart(buildCartItem(), 1)
    }

    const openQuickView = (event) => {
        event.stopPropagation()
        event.preventDefault()
        rememberRecentlyViewed(targetId)
        setIsQuickViewOpen(true)
    }

    const handleImageError = () => {
        // Tricky logic: a few generated catalogue entries point at stale first images.
        // Try later images from the same product before showing the non-image fallback.
        if (imageOffset < imageSet.length - 1) {
            setImageOffset((offset) => offset + 1)
            return
        }

        setImageError(true)
    }

    return (
        <motion.li
            className={styles.card}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ delay: Math.min(index, 8) * 0.035, duration: 0.24, ease: 'easeOut' }}
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
                <div className={styles.imageContainer}>
                    {!isImageLoaded && !imageError && <div className={styles.skeleton} aria-hidden="true" />}

                    {!imageError ? (
                        <>
                            <img
                                src={primaryImage}
                                alt={product.name}
                                className={`${styles.thumbImage} ${!isHovered || !hasMultipleImages ? styles.thumbImageVisible : ''}`}
                                loading="lazy"
                                onLoad={() => setIsImageLoaded(true)}
                                onError={handleImageError}
                                onClick={handleProductClick}
                            />
                            {hasMultipleImages && (
                                <img
                                    src={secondaryImage}
                                    alt={`${product.name} alternate view`}
                                    className={`${styles.thumbImage} ${styles.secondaryImage} ${isHovered ? styles.thumbImageVisible : ''}`}
                                    loading="lazy"
                                    onClick={handleProductClick}
                                />
                            )}
                        </>
                    ) : (
                        <button type="button" className={styles.imageFallback} onClick={handleProductClick}>
                            <span>{getCategoryDisplayName(product.category)}</span>
                        </button>
                    )}

                    {badge && <span className={styles.statusBadge}>{badge}</span>}

                    <button
                        className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ''}`}
                        onClick={handleWishlistClick}
                        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        type="button"
                    >
                        {inWishlist ? <HeartFilled /> : <HeartOutline />}
                    </button>

                    <div className={styles.imageActions}>
                        <button type="button" className={styles.quickViewBtn} onClick={openQuickView}>
                            Quick View
                        </button>
                        <button type="button" className={styles.quickAddBtn} onClick={handleAddToCart}>
                            Quick Add
                        </button>
                    </div>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                        <span>{formatTypeName(product.type)}</span>
                        <span className={styles.rating} aria-label={`${rating} out of 5 stars`}>
                            <span aria-hidden="true">★★★★★</span> {rating}
                        </span>
                    </div>

                    <button className={styles.titleButton} onClick={handleProductClick} type="button">
                        <h3 className={styles.cardTitle}>{product.name}</h3>
                    </button>

                    {isMultiVariant && (
                        <div className={styles.variantsRow} aria-label="Available colors">
                            {visibleColorVariants.slice(0, 5).map((variant, variantIndex) => {
                                const isSelected = activeVariantId === variant.id || (!activeVariantId && variantIndex === 0)
                                return (
                                    <button
                                        key={variant.id || variantIndex}
                                        type="button"
                                        className={`${styles.variantSwatch} ${isSelected ? styles.variantActive : ''}`}
                                        style={{ backgroundColor: variant.colorHex || variant.color || '#ccc' }}
                                        aria-label={`Select ${getColorDisplayName(normalizeColor(variant.color))} variant`}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            event.preventDefault()
                                            setActiveVariantId(variant.id)
                                        }}
                                    />
                                )
                            })}
                            {visibleColorVariants.length > 5 && (
                                <span className={styles.variantMore}>+{visibleColorVariants.length - 5}</span>
                            )}
                        </div>
                    )}

                    <div className={styles.priceContainer}>
                        <span className={styles.offerPrice}>{formatPrice(product.offerPrice || product.price)}</span>
                        {product.discountPercent > 0 && product.originalPrice && (
                            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                        )}
                        {product.discountPercent > 0 && (
                            <span className={styles.discountBadge}>{product.discountPercent}% off</span>
                        )}
                    </div>

                    <div className={styles.trustRow}>
                        <span>Ships in 2-4 days</span>
                        <span>Easy returns</span>
                    </div>
                    <p className={styles.stockStatus}>In stock, handmade in small batches</p>
                </div>
            {isQuickViewOpen && (
                <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setIsQuickViewOpen(false)}>
                    <motion.div
                        className={styles.quickViewModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`quick-view-${targetId}`}
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button type="button" className={styles.modalClose} onClick={() => setIsQuickViewOpen(false)} aria-label="Close quick view">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                        <div className={styles.modalImageWrap}>
                            {!imageError && <img src={primaryImage} alt={product.name} className={styles.modalImage} />}
                        </div>
                        <div className={styles.modalContent}>
                            <p className={styles.modalCategory}>{getCategoryDisplayName(product.category)}</p>
                            <h2 id={`quick-view-${targetId}`} className={styles.modalTitle}>{product.name}</h2>
                            <p className={styles.modalRating}>
                                <span aria-hidden="true">★★★★★</span> {rating} ({reviewCount} reviews)
                            </p>
                            <div className={styles.priceContainer}>
                                <span className={styles.offerPrice}>{formatPrice(product.offerPrice || product.price)}</span>
                                {product.discountPercent > 0 && product.originalPrice && (
                                    <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                                )}
                                {product.discountPercent > 0 && (
                                    <span className={styles.discountBadge}>{product.discountPercent}% off</span>
                                )}
                            </div>
                            <p className={styles.modalCopy}>{product.description || 'Handcrafted accessory made in small batches with a polished finish.'}</p>
                            <div className={styles.modalTrust}>
                                <span>Secure checkout</span>
                                <span>Gift-ready packaging</span>
                                <span>Easy returns</span>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.modalAdd} onClick={handleAddToCart}>Add to cart</button>
                                <button type="button" className={styles.modalDetails} onClick={handleProductClick}>View details</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.li>
    )
}
