/**
 * Why this file exists:
 * Loading skeleton component for product cards to improve perceived performance.
 * Mimics the shape, proportions, and structure of the premium ProductCard component
 * using a modern, fluid shimmering pulse animation.
 */

import styles from './ProductSkeleton.module.css'

export default function ProductSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      {/* 1. Image area */}
      <div className={`${styles.shimmer} ${styles.image}`} />

      <div className={styles.body}>
        {/* 2. Meta row (type + rating) */}
        <div className={styles.metaRow}>
          <div className={`${styles.shimmer} ${styles.type}`} />
          <div className={`${styles.shimmer} ${styles.rating}`} />
        </div>

        {/* 3. Product title */}
        <div className={`${styles.shimmer} ${styles.titleLine}`} />
        <div className={`${styles.shimmer} ${styles.titleLineShort}`} />

        {/* 4. Color swatches */}
        <div className={styles.swatchesRow}>
          <div className={`${styles.shimmer} ${styles.swatch}`} />
          <div className={`${styles.shimmer} ${styles.swatch}`} />
          <div className={`${styles.shimmer} ${styles.swatch}`} />
        </div>

        {/* 5. Price block */}
        <div className={styles.priceRow}>
          <div className={`${styles.shimmer} ${styles.price}`} />
          <div className={`${styles.shimmer} ${styles.originalPrice}`} />
        </div>

        {/* 6. Footer details */}
        <div className={styles.footerRow}>
          <div className={`${styles.shimmer} ${styles.footerItem}`} />
          <div className={`${styles.shimmer} ${styles.footerItem}`} />
        </div>
      </div>
    </div>
  )
}
