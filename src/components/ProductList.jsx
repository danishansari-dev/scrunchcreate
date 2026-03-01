import React from 'react'
import { AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'
import styles from './ProductList.module.css'

export default function ProductList({ title, products = [], showViewAllLink = false, viewAllHref = '/products' }) {
  // Filter out products without images or invalid data
  const validProducts = products.filter(p => p && p.id && p.name && Array.isArray(p.images) && p.images.length > 0)

  if (validProducts.length === 0) {
    return null // Don't render empty sections
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title={title}
        linkText={showViewAllLink ? "View all" : null}
        linkHref={viewAllHref}
      />
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
