import React, { useState, useEffect, useMemo } from 'react'
import Banner from '../../components/Banner'
import FeaturesSection from '../../components/FeaturesSection'
import CollectionsSection from '../../components/CollectionsSection'
import BestSellersSection from '../../components/BestSellersSection'
import ProductList from '../../components/ProductList'
import InstagramSection from '../../components/InstagramSection'
import KitsSection from '../../components/KitsSection'
import { getProducts } from '../../utils/getProducts'
import styles from './Home.module.css'

/**
 * Homepage — mobile-first redesign
 * Removed WhyChooseSection per FIX #8
 */
export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const data = getProducts()
    setProducts(data)
  }, [])

  // Filter products by category for the "New Arrivals" section
  const scrunchiesProducts = useMemo(() =>
    products.filter(p =>
      p.category && (p.category.toLowerCase() === 'scrunchies' || p.category.toLowerCase() === 'scrunchie')
    ).reverse().slice(0, 4), [products]
  )

  return (
    <div className={styles.homeContainer}>
      <Banner />
      <FeaturesSection />

      <div className={styles.contentWrapper}>
        <CollectionsSection />
        <BestSellersSection />

        <ProductList
          title="New Arrivals"
          products={scrunchiesProducts}
          showViewAllLink
          viewAllHref="/products?category=Scrunchies"
        />

        {/* FIX #6: Hardcoded kits section with 3 curated kits */}
        <KitsSection />

        {/* FIX #7: Static UGC-style Instagram grid (no iframes) */}
        <InstagramSection />
      </div>
    </div>
  )
}
