import React, { useState, useEffect, useMemo } from 'react'
import Banner from '../../components/Banner'
import FeaturesSection from '../../components/FeaturesSection'
import CollectionsSection from '../../components/CollectionsSection'
import BestSellersSection from '../../components/BestSellersSection'
import WhyChooseSection from '../../components/WhyChooseSection'
import ProductList from '../../components/ProductList'
import InstagramSection from '../../components/InstagramSection'
import { getProducts } from '../../utils/getProducts'

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const data = getProducts()
    setProducts(data)
  }, [])

  // Filter products by category (case-insensitive matching) - limit to 8 for preview
  const hairbowsProducts = useMemo(() =>
    products.filter(p =>
      p.category && (p.category.toLowerCase() === 'hairbows' || p.category.toLowerCase() === 'hairbow')
    ).slice(0, 8), [products]
  )


  const scrunchiesProducts = useMemo(() =>
    products.filter(p =>
      p.category && (p.category.toLowerCase() === 'scrunchies' || p.category.toLowerCase() === 'scrunchie')
    ).slice(0, 8), [products]
  )

  return (
    <>
      <Banner />
      <FeaturesSection />
      <CollectionsSection />
      <BestSellersSection />
      <WhyChooseSection />
      <div className="home-shell">
        <div className="home-shell-inner">
          <ProductList
            title="Hair Bows Collection"
            products={hairbowsProducts}
            showViewAllLink
            viewAllHref="/products?category=Hairbows"
          />
          <ProductList
            title="Scrunchies Collection"
            products={scrunchiesProducts}
            showViewAllLink
            viewAllHref="/products?category=Scrunchies"
          />
        </div>
      </div>
      <InstagramSection />
    </>
  )
}
