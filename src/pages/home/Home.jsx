import { useState, useEffect, useMemo } from 'react'
import Banner from '../../components/Banner'
import FeaturesSection from '../../components/FeaturesSection'
import CollectionsSection from '../../features/products/components/CollectionsSection'
import BestSellersSection from '../../features/products/components/BestSellersSection'
import ProductList from '../../features/products/components/ProductList'
import InstagramSection from '../../components/InstagramSection'
import KitsSection from '../../features/products/components/KitsSection'
import { getProducts } from '../../services/api'
import styles from './Home.module.css'

/**
 * Homepage — mobile-first redesign
 * Removed WhyChooseSection per FIX #8
 */
export default function Home() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Show products flagged as new arrivals by the DB patch script
  const newArrivals = useMemo(() =>
    products.filter(p => p.isNew || p.isNewArrival).slice(0, 8), [products]
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
          products={newArrivals}
          showViewAllLink
          viewAllHref="/products?category=scrunchie"
          isLoading={isLoading}
        />

        {/* FIX #6: Hardcoded kits section with 3 curated kits */}
        <KitsSection />

        {/* FIX #7: Static UGC-style Instagram grid (no iframes) */}
        <InstagramSection />
      </div>
    </div>
  )
}
