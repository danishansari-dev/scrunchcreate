import React, { useState, useEffect, useMemo } from 'react'
import styles from './Products.module.css'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProducts } from '../../utils/getProducts'
import { getColorDisplayName } from '../../utils/colorNormalization'
import { AnimatePresence } from 'framer-motion'
import ProductCard from '../../components/ProductCard'

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

  // Get initial filter values from URL query params
  const urlType = searchParams.get('type')
  const urlColor = searchParams.get('color')
  const urlSearch = searchParams.get('search')

  // Filter state - initialize from URL params
  const [selectedColors, setSelectedColors] = useState(() => urlColor ? [urlColor] : [])
  const [selectedTypes, setSelectedTypes] = useState(() => urlType ? [urlType] : [])

  // Load products on mount
  useEffect(() => {
    const products = getProducts()
    setAllProducts(products)
  }, [])

  // Update filters when URL params change
  useEffect(() => {
    setSelectedColors(urlColor ? [urlColor] : [])
    setSelectedTypes(urlType ? [urlType] : [])
  }, [categorySlug, urlType, urlColor])

  // Get the actual category name from the URL slug
  const selectedCategory = categorySlug ? categorySlugMap[categorySlug] : null

  // Determine if filters should be shown
  const showFilters = !selectedCategory || categoriesWithFilters.includes(selectedCategory)

  // Filter products by category if one is selected
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return allProducts
    return allProducts.filter(p =>
      p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [allProducts, selectedCategory])

  // Apply search filter
  const searchFilteredProducts = useMemo(() => {
    if (!urlSearch || !urlSearch.trim()) return categoryProducts
    const searchTerm = urlSearch.trim().toLowerCase()
    return categoryProducts.filter(p => {
      const nameMatch = p.name && p.name.toLowerCase().includes(searchTerm)
      const tagMatch = p.tags && Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      const categoryMatch = p.category && p.category.toLowerCase().includes(searchTerm)
      return nameMatch || tagMatch || categoryMatch
    })
  }, [categoryProducts, urlSearch])

  // Extract unique normalized colors from filtered products
  const availableColors = useMemo(() => {
    const colors = new Set()
    searchFilteredProducts.forEach(p => {
      if (p.availableColors && Array.isArray(p.availableColors)) {
        p.availableColors.forEach(c => colors.add(c))
      } else if (p.normalizedColor) {
        colors.add(p.normalizedColor)
      }
    })
    return Array.from(colors).sort()
  }, [searchFilteredProducts])

  const availableTypes = useMemo(() => {
    const types = new Set()
    searchFilteredProducts.forEach(p => {
      if (p.type) types.add(p.type)
    })
    return Array.from(types).sort()
  }, [searchFilteredProducts])

  // Apply color and type filters
  const filteredProducts = useMemo(() => {
    let products = searchFilteredProducts

    if (selectedColors.length > 0) {
      products = products.filter(p => {
        if (p.availableColors && Array.isArray(p.availableColors)) {
          // Check if ANY of the product's colors match the selected filters
          return p.availableColors.some(c => selectedColors.includes(c))
        }
        return p.normalizedColor && selectedColors.includes(p.normalizedColor)
      })
    }

    if (selectedTypes.length > 0) {
      products = products.filter(p => p.type && selectedTypes.includes(p.type))
    }

    return products
  }, [searchFilteredProducts, selectedColors, selectedTypes])

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = new Map()
    filteredProducts.forEach(product => {
      const category = product.category || 'Uncategorized'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category).push(product)
    })
    return grouped
  }, [filteredProducts])

  // Get all categories dynamically
  const categories = useMemo(() => {
    return Array.from(productsByCategory.keys()).sort()
  }, [productsByCategory])

  // Page title based on selection
  const pageTitle = urlSearch
    ? `Search: "${urlSearch}"`
    : selectedCategory
      ? (categoryDisplayNames[selectedCategory] || selectedCategory)
      : 'Products'

  // Toggle filter handlers
  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedColors([])
    setSelectedTypes([])
  }

  const hasActiveFilters = selectedColors.length > 0 || selectedTypes.length > 0

  if (categoryProducts.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>No products found in this category.</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <p className={styles.subtitle}>
          {selectedCategory ? `Browse our ${pageTitle.toLowerCase()} collection.` : 'Explore our bestsellers and latest drops.'}
        </p>
      </div>

      <div className={showFilters ? styles.contentWithFilters : styles.content}>
        {/* Filter Sidebar - Only for Hair Bows and Scrunchies */}
        {showFilters && (
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filters</h3>
              {hasActiveFilters && (
                <button className={styles.clearFilters} onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>

            {/* Type Filter */}
            {availableTypes.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Type</h4>
                <ul className={styles.filterList}>
                  {availableTypes.map(type => (
                    <li key={type}>
                      <label className={styles.filterLabel}>
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className={styles.filterCheckbox}
                        />
                        <span>{type}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Color</h4>
                <ul className={styles.filterList}>
                  {availableColors.map(color => (
                    <li key={color}>
                      <label className={styles.filterLabel}>
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                          className={styles.filterCheckbox}
                        />
                        <span>{getColorDisplayName(color)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}

        {/* Products Grid */}
        <section className={styles.productsSection}>
          {filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p>No products match your filters.</p>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            categories.map((category) => {
              const products = productsByCategory.get(category) || []
              return (
                <div key={category} style={{ marginBottom: '3rem' }}>
                  {!selectedCategory && (
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
