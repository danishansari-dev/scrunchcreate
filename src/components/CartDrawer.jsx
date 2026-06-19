import { useEffect, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
    const {
        items,
        increment,
        decrement,
        removeFromCart,
        subtotal,
        clearCart,
        isCartOpen,
        closeCart,
        deliveryFee,
        grandTotal,
        totalSavings,
        amountToFreeShipping,
        freeShippingThreshold,
        getRecommendations,
        addToCart,
    } = useCart()
    const navigate = useNavigate()
    const [recommendations, setRecommendations] = useState([])

    // ESC key handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            closeCart()
        }
    }, [closeCart])

    // Prevent background scroll when open, load recommendations
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleKeyDown)
            // Refresh recommendations when drawer opens
            setRecommendations(getRecommendations())
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isCartOpen, handleKeyDown, getRecommendations])

    const handleCheckout = () => {
        if (items.length === 0) return
        closeCart()
        navigate('/checkout')
    }

    /**
     * Handles adding a recommended product to cart without closing drawer
     * @param {object} product - The recommended product to add
     */
    const handleAddRecommendation = async (product) => {
        await addToCart(product, 1)
        // Refresh recommendations since cart changed
        setRecommendations(getRecommendations())
    }

    // Free shipping progress percentage (capped at 100)
    const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100)
    const hasFreeShipping = amountToFreeShipping === 0

    // Don't render if not open
    if (!isCartOpen) return null

    return (
        <div className={styles.overlay} onClick={closeCart} aria-hidden="true">
            <aside
                className={styles.drawer}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Shopping Cart"
            >
                {/* Header */}
                <header className={styles.header}>
                    <h2 className={styles.title}>
                        Your Bag {items.length > 0 && <span className={styles.itemCount}>({items.reduce((s, i) => s + i.qty, 0)})</span>}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={closeCart}
                        aria-label="Close cart"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Free Shipping Progress Bar */}
                {items.length > 0 && (
                    <div className={styles.shippingBar}>
                        {hasFreeShipping ? (
                            <div className={styles.shippingBarComplete}>
                                <span className={styles.shippingIcon}>🎉</span>
                                You've unlocked <strong>FREE shipping!</strong>
                            </div>
                        ) : (
                            <>
                                <div className={styles.shippingBarText}>
                                    <span className={styles.shippingIcon}>🚚</span>
                                    Add <strong>₹{amountToFreeShipping.toLocaleString('en-IN')}</strong> more for free shipping
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
                )}

                {/* Content */}
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>🛍️</div>
                            <p>Your bag is empty</p>
                            <Link to="/products" className={styles.browseLink} onClick={closeCart}>
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            <ul className={styles.list}>
                                {items.map((item) => (
                                    <li key={item.id} className={styles.item}>
                                        {/* Thumbnail */}
                                        {(item.image || (item.images && item.images[0])) ? (
                                            <div
                                                className={styles.thumb}
                                                style={{ backgroundImage: `url(${item.image || item.images[0]})` }}
                                            >
                                                {/* Hidden probe to detect broken images */}
                                                <img
                                                    src={item.image || item.images[0]}
                                                    alt=""
                                                    style={{ display: 'none' }}
                                                    onError={(e) => {
                                                        // Hide the parent thumbnail div on error
                                                        e.target.parentElement.style.display = 'none'
                                                    }}
                                                />
                                                {/* Discount badge */}
                                                {item.discountPercent > 0 && (
                                                    <span className={styles.discountBadge}>
                                                        {item.discountPercent}% off
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.thumb} />
                                        )}

                                        {/* Details */}
                                        <div className={styles.details}>
                                            <div className={styles.itemName}>{item.name}</div>
                                            {item.color && <div className={styles.meta}>{item.color}</div>}
                                            <div className={styles.priceContainer}>
                                                <span className={styles.itemPrice}>₹{(item.offerPrice || item.price).toLocaleString('en-IN')}</span>
                                                {item.discountPercent > 0 && item.originalPrice && (
                                                    <span className={styles.itemOriginalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className={styles.qtyControls}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => decrement(item.id)}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className={styles.qty}>{item.qty}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => increment(item.id)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Remove item"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Cross-sell: Complete Your Look */}
                            {recommendations.length > 0 && (
                                <div className={styles.crossSell}>
                                    <h3 className={styles.crossSellTitle}>Complete Your Look</h3>
                                    <div className={styles.crossSellScroll}>
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
                                                    <div className={styles.crossSellPrice}>
                                                        ₹{(rec.offerPrice || rec.price || 0).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                                <button
                                                    className={styles.crossSellAddBtn}
                                                    onClick={() => handleAddRecommendation(rec)}
                                                    aria-label={`Add ${rec.name} to cart`}
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <footer className={styles.footer}>
                        {/* Savings message */}
                        {totalSavings > 0 && (
                            <div className={styles.savingsMessage}>
                                🎉 You save <strong>₹{totalSavings.toLocaleString('en-IN')}</strong> on this order!
                            </div>
                        )}

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery</span>
                            <span className={deliveryFee === 0 ? styles.freeLabel : ''}>
                                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                            </span>
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                        >
                            Checkout — ₹{grandTotal.toLocaleString('en-IN')}
                        </button>

                        <div className={styles.drawerActions}>
                            <Link to="/cart" className={styles.viewCartLink} onClick={closeCart}>
                                View Full Cart
                            </Link>
                            <button
                                className={styles.clearBtn}
                                onClick={clearCart}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </footer>
                )}
            </aside>
        </div>
    )
}
