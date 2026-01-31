import React from 'react'
import { useCart } from '../../components/CartContext'
import styles from './Cart.module.css'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { items, increment, decrement, removeFromCart, subtotal, clearCart } = useCart()

  const delivery = subtotal >= 499 ? 0 : 49
  const total = subtotal + delivery

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
                  <div className={styles.thumb} aria-hidden="true" />
                  <div>
                    <div className={styles.productTitle}>{item.name}</div>
                    <div className={styles.price}>₹{item.price.toLocaleString('en-IN')}</div>
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
            <Link to="/checkout" className={styles.checkout}>Checkout</Link>
            <button className={styles.clear} onClick={clearCart}>Clear Cart</button>
          </aside>
        </section>
      )}
    </main>
  )
}
