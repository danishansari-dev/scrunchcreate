import React, { useEffect, useMemo, useRef, useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from './Products.module.css'
import { useCart } from '../../components/CartContext'
import { useLocation, useNavigate } from 'react-router-dom'
import FilterSidebar from '../../components/FilterSidebar'
import { PRODUCTS } from '../../components/productsData'
import Footer from '../../components/Footer'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../components/ToastContext'
    
const DUMMY_PRODUCTS = PRODUCTS

export default function Products() {
  const { addToCart } = useCart()
  const { search } = useLocation()
  const navigate = useNavigate()
  const { show } = useToast()

  const query = useMemo(() => {
    const params = new URLSearchParams(search)
    return (params.get('search') || '').trim().toLowerCase()
  }, [search])

  const params = useMemo(() => new URLSearchParams(search), [search])
  const category = params.get('category') || ''
  const minPrice = Number(params.get('minPrice') || '') || null
  const maxPrice = Number(params.get('maxPrice') || '') || null
  const rating = Number(params.get('rating') || '') || null
  const sort = params.get('sort') || ''

  const filtered = useMemo(() => {
    let list = DUMMY_PRODUCTS.filter((p) => {
      const byQuery = query ? p.title.toLowerCase().includes(query) : true
      const byCategory = category ? (p.category || '').toLowerCase() === category.toLowerCase() : true
      const byMin = minPrice != null ? p.price >= minPrice : true
      const byMax = maxPrice != null ? p.price <= maxPrice : true
      const byRating = rating != null ? p.rating >= rating : true
      return byQuery && byCategory && byMin && byMax && byRating
    })

    if (sort === 'price_asc') list = list.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') list = list.sort((a, b) => b.price - a.price)
    else if (sort === 'rating_desc') list = list.sort((a, b) => b.rating - a.rating)

    return list
  }, [query, category, minPrice, maxPrice, rating, sort])

  // Lazy loading / infinite scroll
  const [visibleCount, setVisibleCount] = useState(12)
  const loaderRef = useRef(null)

  useEffect(() => {
    setVisibleCount(12)
  }, [query, category, minPrice, maxPrice, rating, sort])

  useEffect(() => {
    const sentinel = loaderRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + 12, filtered.length))
        }
      })
    }, { rootMargin: '200px 0px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filtered.length])

  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        DUMMY_PRODUCTS.map((p) => p.category).filter(Boolean)
      )
    )
  }, [])
  return (
    <>
    <NavBar/>
      <main className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {query ? `Results for "${query}"` : 'Explore our bestsellers and latest drops.'}
          </p>
        </div>

        <section className={styles.content}>
          <div>
            <FilterSidebar availableCategories={availableCategories} />
          </div>
          <ul className={styles.grid}>
            <AnimatePresence initial={false}>
              {filtered.slice(0, visibleCount).map((product, idx) => (
                <motion.li
                  key={product.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 420, damping: 28 }}
                >
                  <div 
                    className={styles.thumb} 
                    style={{ backgroundImage: `url(${product.image})` }}
                    aria-hidden="true" 
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.cardTitle}>{product.title}</h3>
                      {product.tag ? <span className={styles.badge}>{product.tag}</span> : null}
                    </div>
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.meta}>
                      <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                      <span className={styles.rating} aria-label={`Rating ${product.rating} out of 5`}>
                        ★ {product.rating}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.addToCart}
                      onClick={() => {
                        const ok = addToCart(product, 1)
                        if (!ok) navigate('/signin')
                        else show('Added to cart', 'success')
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {visibleCount < filtered.length ? (
              <li>
                <div ref={loaderRef} style={{ height: 1 }} />
              </li>
            ) : null}
          </ul>
        </section>
      </main>
      <Footer/>
    </>
  )
}

