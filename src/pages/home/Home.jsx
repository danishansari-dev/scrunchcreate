import React from 'react'
import NavBar from '../../componets/navbar/NavBar'
import Banner from '../../componets/banner/Banner'
import Footer from '../../componets/footer/Footer'
import ProductList from '../../componets/productlist/ProductList'
import { PRODUCTS } from '../../componets/productlist/productsData'
export default function Home() {
  return (
    <>
     <NavBar />
     <Banner /> 
     <div style={{ padding: '24px 16px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
       <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gap: '32px' }}>
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
     <Footer/>
    </>
  )
}
