import React, { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import { generateWhatsAppMessage } from '../utils/whatsappUtils'
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
        closeCart
    } = useCart()

    const delivery = subtotal >= 499 ? 0 : 49
    const total = subtotal + delivery

    // ESC key handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            closeCart()
        }
    }, [closeCart])

    // Prevent background scroll when open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleKeyDown)
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isCartOpen, handleKeyDown])

    const handleCheckout = () => {
        if (items.length === 0) return

        const confirmCheckout = window.confirm(
            'You will be redirected to WhatsApp to complete your order. Continue?'
        )

        if (confirmCheckout) {
            const whatsappUrl = generateWhatsAppMessage(items, subtotal)
            window.open(whatsappUrl, '_blank')
            closeCart()
        }
    }

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
                    <h2 className={styles.title}>Your Cart</h2>
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

                {/* Content */}
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Your cart is empty</p>
                            <Link to="/products" className={styles.browseLink} onClick={closeCart}>
                                Browse Products
                            </Link>
                        </div>
                    ) : (
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
                                            -
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
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <footer className={styles.footer}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery</span>
                            <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                        >
                            Checkout via WhatsApp
                        </button>

                        <button
                            className={styles.clearBtn}
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    </footer>
                )}
            </aside>
        </div>
    )
}
