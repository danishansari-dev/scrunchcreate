import React, { useEffect, useMemo, useState } from 'react'
import styles from './FilterSidebar.module.css'
import { useLocation, useNavigate } from 'react-router-dom'

export default function FilterSidebar({ availableCategories = [] }) {
  const location = useLocation()
  const navigate = useNavigate()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialCategory = params.get('category') || ''
  const initialMinPrice = params.get('minPrice') || ''
  const initialMaxPrice = params.get('maxPrice') || ''
  const initialSort = params.get('sort') || ''

  const [category, setCategory] = useState(initialCategory)
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState(initialSort)

  useEffect(() => {
    setCategory(initialCategory)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setSort(initialSort)
  }, [initialCategory, initialMinPrice, initialMaxPrice, initialSort])

  const apply = () => {
    const next = new URLSearchParams(location.search)
    const setOrDelete = (key, value) => {
      if (value && String(value).trim() !== '') next.set(key, String(value).trim())
      else next.delete(key)
    }
    setOrDelete('category', category)
    setOrDelete('minPrice', minPrice)
    setOrDelete('maxPrice', maxPrice)
    setOrDelete('sort', sort)
    navigate(`/products?${next.toString()}`)
  }

  const clearAll = () => {
    const next = new URLSearchParams(location.search)
      ;['category', 'minPrice', 'maxPrice', 'sort'].forEach((k) => next.delete(k))
    navigate(`/products?${next.toString()}`)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Filters</h3>
        <button className={styles.clear} onClick={clearAll} type="button">Clear</button>
      </div>

      <div className={styles.group}>
        <div className={styles.label}>Category</div>
        <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <div className={styles.label}>Price</div>
        <div className={styles.row}>
          <input
            className={`${styles.input} ${styles.minPrice}`}
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className={styles.sep}>-</span>
          <input
            className={`${styles.input} ${styles.maxPrice}`}
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.label}>Sort By</div>
        <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <button className={styles.apply} type="button" onClick={apply}>Apply Filters</button>
    </aside>
  )
}
