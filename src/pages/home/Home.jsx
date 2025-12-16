import React from 'react'
import Banner from '../../components/Banner'
import ProductList from '../../components/ProductList'
import { PRODUCTS } from '../../components/productsData'

export default function Home() {
  return (
    <>
      <Banner />
      <div className="home-shell">
        <div className="home-shell-inner">
          <ProductList
            title="Hair Bows Collection"
            products={PRODUCTS.filter(p => p.category === 'Hairbows')}
            showViewAllLink
            viewAllHref="/products?category=Hairbows"
          />
          <ProductList
            title="Scrunchies Collection"
            products={PRODUCTS.filter(p => p.category === 'Scrunchies')}
            showViewAllLink
            viewAllHref="/products?category=Scrunchies"
          />
        </div>
      </div>
    </>
  )
}
