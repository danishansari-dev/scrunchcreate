import React, { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { getProductBySlug, resolveImagePath, getProductsByCategory, getProductVariants } from '../../utils/getProducts'
import { useCart } from '../../components/CartContext'
import { useToast } from '../../components/ToastContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductCard from '../../components/ProductCard'
import { AnimatePresence } from 'framer-motion'

// Heart Icon SVG components
const HeartOutline = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)

const HeartFilled = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)

// Share Icon
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
)

// Trust Badge Icons
const HandmadeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
)

const PremiumIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const SecureIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const ReturnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

// Shipping Icon
const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)

// Check Icon for Stock
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { show } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Load product from JSON
  useEffect(() => {
    if (!slug) {
      setProduct(null)
      return
    }
    const productData = getProductBySlug(slug)
    if (productData) {
      setProduct(productData)
      setSelectedImageIndex(0)
      setQuantity(1)
    } else {
      setProduct(null)
    }
    // Scroll to top on slug change
    window.scrollTo(0, 0)
  }, [slug])

  // Get related products
  const relatedProducts = useMemo(() => {
    if (!product) return []
    const categoryProducts = getProductsByCategory(product.category)
    // Filter out current product and limit to 4
    return categoryProducts
      .filter(p => p.id !== product.id)
      .slice(0, 4)
  }, [product])

  // Get color variants (same category+type, different colors)
  const colorVariants = useMemo(() => {
    if (!product || !product.color) return []
    const variants = getProductVariants(product)
    // Include current product in the list and sort alphabetically
    const allVariants = [product, ...variants].sort((a, b) =>
      (a.id === product.id ? -1 : b.id === product.id ? 1 : (a.color || '').localeCompare(b.color || ''))
    )
    return allVariants
  }, [product])

  // Derive fabric type from product type
  const fabricType = useMemo(() => {
    if (!product?.type) return null
    const typeMap = {
      'satin': 'Satin',
      'satin-mini': 'Satin',
      'satin-princes': 'Satin',
      'satin-tulip': 'Satin',
      'satin-hamper': 'Satin',
      'velvet': 'Velvet',
      'sheer-satin': 'Sheer Satin',
      'scarf': 'Scarf',
      'tulip': 'Satin',
      'tulip-sheer': 'Sheer Satin',
      'jimmychoo': 'Jimmy Choo',
      'classic': 'Satin',
      'combo': 'Combo Set',
      'rose': 'Flower'
    }
    return typeMap[product.type.toLowerCase()] || product.type.charAt(0).toUpperCase() + product.type.slice(1).replace(/-/g, ' ')
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    const ok = addToCart(product, quantity)
    if (!ok) {
      navigate('/signin')
    } else {
      show('Added to cart', 'success')
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return
    toggleWishlist(product.id)
    const inWishlist = isInWishlist(product.id)
    show(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'success')
  }

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from Scrunch & Create!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        show('Link copied to clipboard!', 'success')
      }
    } catch (err) {
      // User cancelled or error
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href)
        show('Link copied to clipboard!', 'success')
      }
    }
  }

  const incrementQty = () => setQuantity(q => Math.min(q + 1, 10)) // Max 10 items
  const decrementQty = () => setQuantity(q => Math.max(q - 1, 1))

  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Product not found</h1>
            <p className={styles.notFoundText}>The product you're looking for doesn't exist.</p>
            <button
              className={styles.backButton}
              onClick={() => navigate('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Use images from product
  const images = product.images || [];
  const mainImage = resolveImagePath(images[selectedImageIndex] || images[0] || product.image);
  const inWishlist = isInWishlist(product.id)

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/products" className={styles.breadcrumbLink}>Shop</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to={`/products/${product.category}`} className={styles.breadcrumbLink}>{product.category}</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.content}>
          {/* Product Image Gallery */}
          <div className={styles.gallery}>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${selectedImageIndex === idx ? styles.thumbnailActive : ''}`}
                    aria-label={`View image ${idx + 1}`}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={resolveImagePath(img)} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div
              className={styles.mainImage}
              onMouseMove={(e) => {
                const { left, top, width, height } = e.target.getBoundingClientRect()
                const x = ((e.clientX - left) / width) * 100
                const y = ((e.clientY - top) / height) * 100
                e.target.style.setProperty('--x', `${x}%`)
                e.target.style.setProperty('--y', `${y}%`)
              }}
            >
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className={styles.mainImageImg}
                />
              )}
              <div className={styles.imageActions}>
                <button
                  className={styles.actionBtn}
                  onClick={handleWishlistToggle}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {inWishlist ? <HeartFilled /> : <HeartOutline />}
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className={styles.info}>
            <div className={styles.header}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.priceRow}>
                <span className={styles.offerPrice}>₹{(product.offerPrice || product.price).toLocaleString('en-IN')}</span>
                {product.discountPercent > 0 && product.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className={styles.discountBadge}>{product.discountPercent}% OFF</span>
                  </>
                )}
              </div>
            </div>

            {/* Fabric & Material Section */}
            {fabricType && (
              <div className={styles.fabricSection}>
                <span className={styles.fabricLabel}>Fabric & Material</span>
                <span className={styles.fabricValue}>{fabricType}</span>
              </div>
            )}

            {/* Available Colors Section */}
            {colorVariants.length > 1 && (
              <div className={styles.colorVariantsSection}>
                <span className={styles.colorVariantsLabel}>Available Colors</span>
                <div className={styles.colorSwatches}>
                  {colorVariants.map((variant) => (
                    <Link
                      key={variant.id}
                      to={`/product/${variant.slug}`}
                      className={`${styles.colorSwatch} ${variant.id === product.id ? styles.colorSwatchActive : ''}`}
                      aria-label={`View ${variant.color} variant`}
                      title={variant.color}
                    >
                      <span
                        className={styles.swatchInner}
                        style={{ background: variant.colorHex || '#ddd' }}
                      />
                      <span className={styles.swatchLabel}>{variant.color}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Current Color Display (when no variants or single color) */}
            {colorVariants.length <= 1 && product.color && (
              <div className={styles.colorSection}>
                <span className={styles.colorLabel}>Color</span>
                <span className={styles.colorValue}>{product.color}</span>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className={styles.actions}>
              <div className={styles.quantityControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={incrementQty}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                Add to Cart
              </button>
            </div>

            {/* Shipping Info - directly after Add to Cart */}
            <div className={styles.shippingInfo}>
              <div className={styles.shippingItem}>
                <TruckIcon />
                <div className={styles.shippingText}>
                  <span className={styles.shippingTitle}>Free Shipping</span>
                  <span className={styles.shippingSubtitle}>On orders above ₹499</span>
                </div>
              </div>
              <div className={styles.shippingItem}>
                <span className={styles.deliveryIcon}>📦</span>
                <div className={styles.shippingText}>
                  <span className={styles.shippingTitle}>Delivery</span>
                  <span className={styles.shippingSubtitle}>3-5 business days</span>
                </div>
              </div>
            </div>
            {/* Trust Indicators */}
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}><HandmadeIcon /></span>
                <span>Handmade in India</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}><PremiumIcon /></span>
                <span>Premium Quality</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}><SecureIcon /></span>
                <span>Secure Payment</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}><ReturnIcon /></span>
                <span>Easy Returns</span>
              </div>
            </div>

            {/* Advantages of Satin Section
            <div className={styles.advantagesSection}>
              <h3 className={styles.advantagesTitle}>Advantages of Satin</h3>
              <div className={styles.advantagesGrid}>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z" />
                      <path d="M12 6c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Reduces Frizziness</span>
                </div>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Reduces Hair Breakage</span>
                </div>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4c4-2 8 0 8 4s-4 6 0 10c4 4 8 2 8-2s-4-6 0-10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Controls Hair Tangling</span>
                </div>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7z" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Retains Moisture</span>
                </div>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 3c-4.5 0-8 3.5-8 8 0 5 8 11 8 11s8-6 8-11c0-4.5-3.5-8-8-8z" />
                      <path d="M12 7v6M9 10h6" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Improves Hair Texture</span>
                </div>
                <div className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span className={styles.advantageText}>Reduces Split Ends</span>
                </div>
              </div>
            </div> */}

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <ul className={styles.relatedGrid}>
              <AnimatePresence initial={false}>
                {relatedProducts.map((p, idx) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
