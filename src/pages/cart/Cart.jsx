import React from 'react'
import { useCart } from '../../components/CartContext'
import styles from './Cart.module.css'
import { Link } from 'react-router-dom'
import { generateWhatsAppMessage } from '../../utils/whatsappUtils'

export default function Cart() {
  const { items, increment, decrement, removeFromCart, subtotal, clearCart } = useCart()

  const delivery = subtotal >= 499 ? 0 : 49
  const total = subtotal + delivery

  const handleCheckout = () => {
    if (items.length === 0) return

    const confirmCheckout = window.confirm(
      'You will be redirected to WhatsApp to complete your order with Scrunch & Create. Continue?'
    )

    if (confirmCheckout) {
      const whatsappUrl = generateWhatsAppMessage(items, subtotal)
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>Your cart is empty. <Link to="/products">Browse products</Link>.</div>
      ) : (
        <section className={styles.content}>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.row}>
                <div className={styles.info}>
                  {/* Thumbnail logic: if image exists, show it, else generic */}
                  {item.images && item.images[0] ? (
                    <div className={styles.thumb}>
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className={styles.thumbImg}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.thumb} aria-hidden="true" />
                  )}
                  <div>
                    <div className={styles.productTitle}>{item.name}</div>
                    <div className={styles.price}>₹{item.price.toLocaleString('en-IN')}</div>
                    {/* Optional: Show Variant/Color if available */}
                    {(item.type || item.variant) && <div className={styles.meta}>Type: {item.type || item.variant}</div>}
                    {item.color && <div className={styles.meta}>Color: {item.color}</div>}
                  </div>
                </div>
                <div className={styles.controls}>
                  <button className={styles.qtyBtn} onClick={() => decrement(item.id)} aria-label="Decrease quantity">-</button>
                  <span className={styles.qty}>{item.qty}</span>
                  <button className={styles.qtyBtn} onClick={() => increment(item.id)} aria-label="Increase quantity">+</button>
                </div>
                <div className={styles.rowTotal}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                <button className={styles.remove} onClick={() => removeFromCart(item.id)} aria-label="Remove item">Remove</button>
              </li>
            ))}
          </ul>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Summary</h2>
            <div className={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className={styles.summaryRow}><span>Delivery</span><span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
            <div className={styles.summaryTotal}><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>

            <button
              className={styles.checkout}
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              Proceed to WhatsApp Checkout
            </button>
            <button className={styles.clear} onClick={clearCart}>Clear Cart</button>
          </aside>
        </section>
      )}
    </main>
  )
}
