import React from 'react'
import styles from './ProductList.module.css'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../components/ToastContext'

export default function ProductList({ title, products = [], showViewAllLink = false, viewAllHref = '/products' }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { show } = useToast()

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {title ? <h3 className={styles.sectionTitle}>{title}</h3> : null}
        {showViewAllLink ? (
          <a className={styles.viewAll} href={viewAllHref}>View all</a>
        ) : null}
      </div>
      <ul className={styles.grid}>
        <AnimatePresence initial={false}>
          {products.map((p, idx) => (
            <motion.li
              key={p.id}
              className={styles.card}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
            >
              <button
                className={styles.thumb}
                style={{ backgroundImage: `url(${p.image})` }}
                aria-label={`Open ${p.title}`}
                onClick={() => {
                  const params = new URLSearchParams()
                  if (p.category) params.set('category', p.category)
                  navigate(`/products?${params.toString()}`)
                }}
              />
              <div className={styles.title}>{p.title}</div>
              <div className={styles.meta}>
                <span className={styles.price}>₹{p.price.toLocaleString('en-IN')}</span>
                <span>★ {p.rating}</span>
              </div>
              <button
                className={styles.button}
                onClick={() => {
                  const ok = addToCart(p, 1)
                  if (!ok) {
                    navigate('/signin')
                  } else {
                    show('Added to cart', 'success')
                  }
                }}
              >
                Add to Cart
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
