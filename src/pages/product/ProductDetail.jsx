import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { PRODUCTS } from '../../components/productsData'
import { useCart } from '../../components/CartContext'
import { useToast } from '../../components/ToastContext'
import { createSlug } from '../../utils/productUtils'

// Helper function to find product by slug
function findProductBySlug(slug) {
  return PRODUCTS.find(p => createSlug(p.title) === slug || p.id === slug)
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { show } = useToast()

  const product = useMemo(() => {
    if (!slug) return null
    return findProductBySlug(slug)
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    const ok = addToCart(product, 1)
    if (!ok) {
      navigate('/signin')
    } else {
      show('Added to cart', 'success')
    }
  }

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

  // Use single image for now (products only have one image)
  const mainImage = product.image
  const images = [product.image] // Can be extended if multiple images exist

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Product Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img 
                src={mainImage} 
                alt={product.title}
                className={styles.mainImageImg}
              />
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={styles.thumbnail}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.title} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className={styles.info}>
            <h1 className={styles.title}>{product.title}</h1>
            
            <div className={styles.priceRow}>
              <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              {product.rating && (
                <span className={styles.rating} aria-label={`Rating ${product.rating} out of 5`}>
                  ★ {product.rating}
                </span>
              )}
            </div>

            {product.description && (
              <p className={styles.shortDescription}>{product.description}</p>
            )}

            <p className={styles.handmadeNote}>
              Handcrafted in small batches with attention to detail.
            </p>

            {/* Purchase Section */}
            <div className={styles.purchase}>
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
                <span>Handmade Products</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Made in India</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Quality-Checked Materials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className={styles.details}>
          <section className={styles.detailSection}>
            <h2 className={styles.detailHeading}>Description</h2>
            <p className={styles.detailText}>
              {product.category === 'Hairbows' 
                ? `Each ${product.title.toLowerCase()} is carefully handcrafted to bring elegance to your everyday style. Designed with precision and finished with quality materials, this piece adds a touch of sophistication to any outfit. Perfect for both casual and formal occasions, it complements your personal style effortlessly.`
                : `The ${product.title.toLowerCase()} combines comfort with style, making it an essential accessory for your daily routine. Crafted with care, it's gentle on your hair while maintaining its shape and appearance throughout the day. Ideal for those who appreciate quality and thoughtful design in their everyday essentials.`}
            </p>
          </section>

          <section className={styles.detailSection}>
            <h2 className={styles.detailHeading}>Material</h2>
            <p className={styles.detailText}>
              {product.category === 'Hairbows' 
                ? (product.title.toLowerCase().includes('velvet')
                    ? 'Made from premium velvet fabric with structured backing for durability and shape retention.'
                    : product.title.toLowerCase().includes('sheer')
                    ? 'Crafted from lightweight satin with a delicate sheer overlay for a soft, romantic appearance.'
                    : product.title.toLowerCase().includes('scarf')
                    ? 'Premium satin fabric with versatile styling options, suitable for multiple wear styles.'
                    : 'High-quality satin material with reinforced edges and quality finishing for long-lasting wear.')
                : 'Soft, breathable fabric blend designed to be gentle on hair while maintaining elasticity and durability.'}
            </p>
          </section>

          <section className={styles.detailSection}>
            <h2 className={styles.detailHeading}>Size</h2>
            <p className={styles.detailText}>
              One Size Fits All
            </p>
          </section>

          <section className={styles.detailSection}>
            <h2 className={styles.detailHeading}>Care Instructions</h2>
            <p className={styles.detailText}>
              Hand wash gently with mild detergent. Air dry flat. Do not bleach or iron directly on the accessory.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
