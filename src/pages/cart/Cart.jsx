/**
 * Why this file exists:
 * Full cart page providing detailed editing capabilities beyond the
 * slide-out CartDrawer. Includes cross-sell recommendations, coupon
 * field, savings messaging, and trust badges near the checkout CTA.
 */
import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import CouponField from '../../components/CouponField'
import TrustBadges from '../../components/TrustBadges'
import styles from './Cart.module.css'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart() {
  const {
    items,
    increment,
    decrement,
    removeFromCart,
    subtotal,
    clearCart,
    deliveryFee,
    grandTotal,
    totalSavings,
    couponDiscount,
    amountToFreeShipping,
    freeShippingThreshold,
    getRecommendations,
    addToCart,
  } = useCart()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])

  // Load cross-sell recommendations when page mounts or items change
  useEffect(() => {
    setRecommendations(getRecommendations())
  }, [getRecommendations])

  const handleCheckout = () => {
    if (items.length === 0) return
    navigate('/checkout')
  }

  /**
   * Adds a recommended product to cart and refreshes recommendations
   * @param {object} product - Product to add
   */
  const handleAddRecommendation = async (product) => {
    await addToCart(product, 1)
    setRecommendations(getRecommendations())
  }

  // Free shipping progress
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const hasFreeShipping = amountToFreeShipping === 0

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛍️</div>
          <p>Your cart is empty</p>
          <Link to="/products" className={styles.emptyLink}>Browse Products</Link>
        </div>
      ) : (
        <>
          {/* Free shipping progress bar */}
          <div className={styles.shippingBar}>
            {hasFreeShipping ? (
              <div className={styles.shippingComplete}>
                🎉 You've unlocked <strong>FREE shipping!</strong>
              </div>
            ) : (
              <>
                <div className={styles.shippingText}>
                  🚚 Add <strong>₹{amountToFreeShipping.toLocaleString('en-IN')}</strong> more for free shipping
                </div>
                <div className={styles.shippingTrack}>
                  <div
                    className={styles.shippingFill}
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <section className={styles.content}>
            {/* Cart Items */}
            <div className={styles.itemsColumn}>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id} className={styles.row}>
                    <div className={styles.info}>
                      {(item.images && item.images[0]) || item.image ? (
                        <div
                          className={styles.thumb}
                          style={{ backgroundImage: `url(${item.image || item.images[0]})` }}
                          aria-hidden="true"
                        >
                          {item.discountPercent > 0 && (
                            <span className={styles.discountBadge}>{item.discountPercent}% off</span>
                          )}
                        </div>
                      ) : (
                        <div className={styles.thumb} aria-hidden="true" />
                      )}
                      <div className={styles.itemDetails}>
                        <div className={styles.productTitle}>{item.name}</div>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>₹{(item.offerPrice || item.price).toLocaleString('en-IN')}</span>
                          {item.discountPercent > 0 && item.originalPrice && (
                            <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {(item.type || item.variant) && <div className={styles.meta}>Type: {item.type || item.variant}</div>}
                        {item.color && <div className={styles.meta}>Color: {item.color}</div>}
                      </div>
                    </div>
                    <div className={styles.controls}>
                      <button className={styles.qtyBtn} onClick={() => decrement(item.id)} aria-label="Decrease quantity">−</button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => increment(item.id)} aria-label="Increase quantity">+</button>
                    </div>
                    <div className={styles.rowTotal}>₹{((item.offerPrice || item.price) * item.qty).toLocaleString('en-IN')}</div>
                    <button className={styles.remove} onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Cross-sell: You May Also Like */}
              {recommendations.length > 0 && (
                <div className={styles.crossSell}>
                  <h2 className={styles.crossSellTitle}>You May Also Like</h2>
                  <div className={styles.crossSellGrid}>
                    {recommendations.map((rec) => (
                      <div key={rec.id || rec._id} className={styles.crossSellCard}>
                        {(rec.image || (rec.images && rec.images[0])) && (
                          <div
                            className={styles.crossSellThumb}
                            style={{ backgroundImage: `url(${rec.image || rec.images[0]})` }}
                          />
                        )}
                        <div className={styles.crossSellInfo}>
                          <div className={styles.crossSellName}>{rec.name}</div>
                          <div className={styles.crossSellPrice}>₹{(rec.offerPrice || rec.price || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <button
                          className={styles.crossSellAddBtn}
                          onClick={() => handleAddRecommendation(rec)}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              {/* Savings callout */}
              {totalSavings > 0 && (
                <div className={styles.savingsMessage}>
                  🎉 You save <strong>₹{totalSavings.toLocaleString('en-IN')}</strong> on this order!
                </div>
              )}

              <div className={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className={styles.summaryRow}>
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? styles.freeLabel : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className={styles.summaryTotal}><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>

              {/* Coupon field */}
              <CouponField />

              <button
                className={styles.checkout}
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Proceed to Checkout — ₹{grandTotal.toLocaleString('en-IN')}
              </button>

              <TrustBadges compact />

              <button className={styles.clear} onClick={clearCart}>Clear Cart</button>
            </aside>
          </section>
        </>
      )}
    </main>
  )
}
