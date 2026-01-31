import React from 'react'
import styles from './ProductList.module.css'
import { AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'

export default function ProductList({ title, products = [], showViewAllLink = false, viewAllHref = '/products' }) {
  // Filter out products without images or invalid data
  const validProducts = products.filter(p => p && p.id && p.name)

  if (validProducts.length === 0) {
    return null // Don't render empty sections
  }

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
          {validProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
