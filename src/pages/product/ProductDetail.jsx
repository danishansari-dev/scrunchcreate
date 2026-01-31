import React, { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { getProductBySlug, resolveImagePath, getProductsByCategory } from '../../utils/getProducts'
import { useCart } from '../../components/CartContext'
import { useToast } from '../../components/ToastContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductCard from '../../components/ProductCard'
import ProductReviews from '../../components/ProductReviews'
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
          <Link to="/products" className={styles.breadcrumbLink}>Shop All</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to={`/products/${product.category}`} className={styles.breadcrumbLink}>{product.category}</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.content}>
          {/* Product Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className={styles.mainImageImg}
                />
              )}
              <button
                className={styles.wishlistBtn}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {inWishlist ? <HeartFilled /> : <HeartOutline />}
              </button>
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${selectedImageIndex === idx ? styles.thumbnailActive : ''}`}
                    aria-label={`View image ${idx + 1}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={resolveImagePath(img)} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className={styles.info}>
            <div className={styles.header}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                {product.rating && <span className={styles.rating}>★ {product.rating}</span>}
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.description}>
              <p className={styles.descriptionText}>{product.description}</p>
            </div>

            {/* Attributes */}
            <div className={styles.attributes}>
              {product.material && (
                <div className={styles.attributeRow}>
                  <span className={styles.attributeLabel}>Material:</span>
                  <span className={styles.attributeValue}>{product.material}</span>
                </div>
              )}
              {product.size && (
                <div className={styles.attributeRow}>
                  <span className={styles.attributeLabel}>Size:</span>
                  <span className={styles.attributeValue}>{product.size}</span>
                </div>
              )}
            </div>

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

            {/* Trust Indicators */}
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Handmade in India</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Premium Quality</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <ProductReviews productId={product.id} />

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
