import React, { useState, useEffect, useMemo } from 'react'
import styles from './Products.module.css'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProducts } from '../../utils/getProducts'
import { AnimatePresence } from 'framer-motion'
import ProductCard from '../../components/ProductCard'
import { useProductsFilter } from '../../hooks/useProductsFilter'
import FilterSidebar from '../../components/products/FilterSidebar'
import ActiveFilters from '../../components/products/ActiveFilters'
import ProductSearch from '../../components/products/ProductSearch'

// Map URL slugs to actual category names
const categorySlugMap = {
  'hair-bows': 'HairBow',
  'scrunchies': 'Scrunchie',
  'combo': 'Combo',
  'earings': 'Earring',
  'hamper': 'GiftHamper',
  'paraandi': 'Paraandi',
  'flower-jewellery': 'FlowerJewellery'
}

// Friendly display names for categories
const categoryDisplayNames = {
  'HairBow': 'Hair Bows',
  'Scrunchie': 'Scrunchies',
  'Combo': 'Combo Sets',
  'Earring': 'Earrings',
  'GiftHamper': 'Gift Hampers',
  'Paraandi': 'Paraandi',
  'FlowerJewellery': 'Flower Jewellery'
}

// Categories that should show filters
const categoriesWithFilters = ['HairBow', 'Scrunchie']

export default function Products() {
  const { category: categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Load products on mount
  useEffect(() => {
    const products = getProducts()
    setAllProducts(products)
  }, [])

  // Resolve category name
  const selectedCategory = categorySlug ? categorySlugMap[categorySlug] : null

  // Initial filters from URL
  const initialFilters = useMemo(() => ({
    category: selectedCategory,
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    color: searchParams.get('color') || '',
    sort: searchParams.get('sort') || ''
  }), [selectedCategory, searchParams])

  // Use Custom Hook
  const {
    products: filteredProducts,
    availableFilters,
    state: filterState,
    setters,
    handlers
  } = useProductsFilter(allProducts, initialFilters)


  // Determine if filters should be shown
  const showFilters = !selectedCategory || categoriesWithFilters.includes(selectedCategory)

  // Group products by category for display
  const productsByCategory = useMemo(() => {
    const grouped = new Map()
    filteredProducts.forEach(product => {
      // Use the friendly name for grouping key if possible, or category code
      const catKey = product.category || 'Uncategorized'
      if (!grouped.has(catKey)) {
        grouped.set(catKey, [])
      }
      grouped.get(catKey).push(product)
    })
    return grouped
  }, [filteredProducts])

  // Get displayed categories
  const displayCategories = Array.from(productsByCategory.keys()).sort()

  const pageTitle = filterState.search
    ? `Search: "${filterState.search}"`
    : selectedCategory
      ? (categoryDisplayNames[selectedCategory] || selectedCategory)
      : 'Products'

  const activeFilterCount = filterState.types.length + filterState.colors.length

  return (
    <main className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <p className={styles.subtitle}>
          {filteredProducts.length} products found
        </p>

        {/* Search + Filter row */}
        <div className={styles.searchFilterRow}>
          <ProductSearch
            initialValue={filterState.search}
            onSearch={(val) => setters.setSearch(val)}
          />
          {showFilters && (
            <button
              className={styles.filterToggleBtn}
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="12" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="0" />
                <circle cx="8" cy="12" r="0" />
                <circle cx="12" cy="18" r="0" />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={showFilters ? styles.contentWithFilters : styles.content}>

        {/* Filter Sidebar (desktop: inline, mobile: drawer overlay) */}
        {showFilters && (
          <FilterSidebar
            availableFilters={availableFilters}
            activeFilters={filterState}
            handlers={handlers}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Products Grid */}
        <section className={styles.productsSection}>

          <ActiveFilters
            activeFilters={filterState}
            handlers={handlers}
          />

          {filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p>No products match your filters.</p>
              <button className={styles.clearFiltersBtn} onClick={handlers.clearAllFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            displayCategories.map((category) => {
              const products = productsByCategory.get(category) || [] // Use category key directly
              return (
                <div key={category} style={{ marginBottom: '3rem' }}>
                  {/* Only show category heading if we are NOT in a specific category page 
                        OR if we are searching (mixed results) */}
                  {(!selectedCategory || filterState.search) && (
                    <h2 className={styles.categoryTitle} style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                      {categoryDisplayNames[category] || category}
                    </h2>
                  )}
                  <ul className={styles.grid}>
                    <AnimatePresence initial={false}>
                      {products.map((product, idx) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={idx}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}
