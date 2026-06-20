import { AnimatePresence } from 'framer-motion'
import ProductCard from '../ProductCard'
import ProductSkeleton from '../ProductSkeleton'
import SectionHeader from '../../../../components/SectionHeader'
import styles from './ProductList.module.css'

export default function ProductList({ title, products = [], showViewAllLink = false, viewAllHref = '/products', isLoading = false }) {
  // Filter out products without images or invalid data (support both _id and id)
  const validProducts = products.filter(p => p && (p.id || p._id) && p.name && Array.isArray(p.images) && p.images.length > 0)

  if (!isLoading && validProducts.length === 0) {
    return null // Don't render empty sections
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title={title}
        linkText={showViewAllLink && !isLoading ? "View all" : null}
        linkHref={viewAllHref}
      />
      <ul className={styles.grid}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <li key={idx} style={{ listStyle: 'none' }}>
              <ProductSkeleton />
            </li>
          ))
        ) : (
          <AnimatePresence initial={false}>
            {validProducts.map((p, idx) => (
              <ProductCard key={p.id || p._id} product={p} index={idx} />
            ))}
          </AnimatePresence>
        )}
      </ul>
    </section>
  )
}
