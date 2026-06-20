import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import styles from './Products.module.css'
import ProductCard from '../../features/products/components/ProductCard'
import ProductSkeleton from '../../features/products/components/ProductSkeleton'
import FilterSidebar from '../../features/products/components/FilterSidebar'
import ActiveFilters from '../../features/products/components/ActiveFilters'
import ProductSearch from '../../features/products/components/ProductSearch'
import { getProducts } from '../../services/api'
import { CATEGORY_SLUGS, getCategoryDisplayName } from '../../shared/utils/catalogDisplay'
import { useProductsFilter } from '../../features/products/hooks/useProductsFilter'

const categorySlugMap = {
  'combo': 'combo',
  'earings': 'earring',
  'flower-jewellery': 'flowerjewellery',
  'hair-bows': 'hairbow',
  'hairclips': 'hairclip',
  'hamper': 'gifthamper',
  'paraandi': 'paraandi',
  'scrunchies': 'scrunchie'
}

const INITIAL_VISIBLE_COUNT = 24
const LOAD_MORE_COUNT = 12

/**
 * Reads recently viewed product IDs without letting malformed storage break the catalogue.
 * @returns Array of product IDs ordered from newest to oldest
 */
function getRecentlyViewedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]')
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

/**
 * Renders a compact product rail for recommendations and viewed items.
 * @danishansari-dev title - Rail heading
 * @danishansari-dev subtitle - Short supporting text
 * @danishansari-dev products - Products to display
 * @returns Discovery product rail or null
 */
function DiscoveryRail({ title, subtitle, products }) {
  if (!products.length) return null

  return (
    <section className={styles.discoveryRail} aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>
      <div className={styles.railHeader}>
        <div>
          <p className={styles.eyebrow}>Curated picks</p>
          <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-title`} className={styles.railTitle}>{title}</h2>
        </div>
        <p className={styles.railSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.railGrid}>
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={`${title}-${product.id}`} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}

/**
 * Builds the premium product listing page while preserving catalogue data and filters.
 * @returns Product listing route
 */
export default function Products() {
  const { category: categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getProducts()
        setAllProducts(data)
      } catch (err) {
        console.error('Failed to load products', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    setRecentlyViewedIds(getRecentlyViewedIds())
  }, [])

  const selectedCategory = categorySlug ? categorySlugMap[categorySlug] : null

  const initialFilters = useMemo(() => ({
    category: selectedCategory,
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    color: searchParams.get('color') || '',
    sort: searchParams.get('sort') || ''
  }), [selectedCategory, searchParams])

  const {
    products: filteredProducts,
    availableFilters,
    state: filterState,
    setters,
    handlers
  } = useProductsFilter(allProducts, initialFilters)

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }, [filterState.search, filterState.category, filterState.types, filterState.colors, filterState.priceRange, filterState.sort])

  const categoryNav = useMemo(() => {
    const counts = new Map()

    allProducts.forEach((product) => {
      const key = String(product.category || '').toLowerCase()
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        label: getCategoryDisplayName(category),
        slug: CATEGORY_SLUGS[category] || category
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [allProducts])

  const displayedProducts = filteredProducts.slice(0, visibleCount)
  const hasMoreProducts = visibleCount < filteredProducts.length
  const activeFilterCount = filterState.types.length
    + filterState.colors.length
    + (filterState.search ? 1 : 0)
    + (filterState.priceRange.min > 0 || filterState.priceRange.max < 10000 ? 1 : 0)

  const pageTitle = filterState.search
    ? `Search results for "${filterState.search}"`
    : selectedCategory
      ? getCategoryDisplayName(selectedCategory)
      : 'All Products'

  const selectedCategoryLabel = selectedCategory ? getCategoryDisplayName(selectedCategory) : 'All Accessories'
  const bestSellers = useMemo(
    () => allProducts
      .filter((product) => /scrunchie|hairbow|gifthamper/i.test(`${product.category} ${product.type}`))
      .slice(0, 4),
    [allProducts]
  )
  const newArrivals = useMemo(
    () => allProducts.filter((product, index) => product.isNew || product.badge || index % 7 === 0).slice(0, 4),
    [allProducts]
  )
  const recommendedProducts = useMemo(
    () => filteredProducts.filter((product) => (product.discountPercent || 0) >= 20).slice(0, 4),
    [filteredProducts]
  )
  const recentlyViewedProducts = useMemo(
    () => recentlyViewedIds
      .map((id) => allProducts.find((product) => product.id === id || product._id === id))
      .filter(Boolean)
      .slice(0, 4),
    [allProducts, recentlyViewedIds]
  )

  return (
    <main className={styles.page}>
      <section className={styles.header} aria-labelledby="products-heading">
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Handcrafted accessories</p>
          <h1 id="products-heading" className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>
            Premium scrunchies, bows, hampers and floral jewellery designed for everyday gifting and occasion styling.
          </p>
        </div>

        <div className={styles.headerStats} aria-label="Store benefits">
          <div>
            <strong>{filteredProducts.length}</strong>
            <span>pieces</span>
          </div>
          <div>
            <strong>4.8</strong>
            <span>avg rating</span>
          </div>
          <div>
            <strong>2-4</strong>
            <span>day dispatch</span>
          </div>
        </div>
      </section>

      <nav className={styles.categoryBar} aria-label="Product categories">
        <Link className={`${styles.categoryChip} ${!selectedCategory ? styles.categoryChipActive : ''}`} to="/products">
          <span>All</span>
          <span>{allProducts.length}</span>
        </Link>
        {categoryNav.map((item) => (
          <Link
            key={item.category}
            className={`${styles.categoryChip} ${selectedCategory?.toLowerCase() === item.category ? styles.categoryChipActive : ''}`}
            to={`/products/${item.slug}`}
          >
            <span>{item.label}</span>
            <span>{item.count}</span>
          </Link>
        ))}
      </nav>

      <section className={styles.discoveryStrip} aria-label="Shopping highlights">
        <div>
          <span className={styles.stripBadge}>New arrivals</span>
          <strong>{newArrivals.length || 0} fresh drops</strong>
        </div>
        <div>
          <span className={styles.stripBadge}>Best sellers</span>
          <strong>{bestSellers.length || 0} customer picks</strong>
        </div>
        <div>
          <span className={styles.stripBadge}>Returns</span>
          <strong>Easy exchange support</strong>
        </div>
      </section>

      <div className={styles.contentWithFilters}>
        <FilterSidebar
          availableFilters={availableFilters}
          activeFilters={filterState}
          handlers={handlers}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        <section className={styles.productsSection} aria-labelledby="product-grid-heading">
          <div className={styles.toolbar}>
            <div>
              <p className={styles.toolbarLabel}>{selectedCategoryLabel}</p>
              <h2 id="product-grid-heading" className={styles.categoryTitle}>
                {filteredProducts.length} styles ready to shop
              </h2>
            </div>

            <div className={styles.toolbarControls}>
              <ProductSearch
                initialValue={filterState.search}
                onSearch={(value) => setters.setSearch(value)}
              />

              <label className={styles.sortWrap}>
                <span>Sort</span>
                <select
                  className={styles.sortSelect}
                  value={filterState.sort}
                  onChange={(event) => setters.setSort(event.target.value)}
                >
                  <option value="">Featured</option>
                  <option value="newest">New arrivals</option>
                  <option value="best_sellers">Best sellers</option>
                  <option value="discount">Highest discount</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>

              <button
                type="button"
                className={styles.filterToggleBtn}
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path d="M4 7h16" />
                  <path d="M7 12h10" />
                  <path d="M10 17h4" />
                </svg>
                Filters
                {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <ActiveFilters activeFilters={filterState} handlers={handlers} />

          {isLoading ? (
            <ul className={styles.grid}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <li key={idx} style={{ listStyle: 'none' }}>
                  <ProductSkeleton />
                </li>
              ))}
            </ul>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <h2>No matching pieces</h2>
              <p>Try a different color, category, or price range.</p>
              <button className={styles.clearFiltersBtn} onClick={handlers.clearAllFilters} type="button">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <ul className={styles.grid}>
                <AnimatePresence initial={false}>
                  {displayedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </ul>

              {hasMoreProducts && (
                <div className={styles.loadMoreWrap}>
                  <p>{displayedProducts.length} of {filteredProducts.length} products shown</p>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <DiscoveryRail
        title="Recommended for you"
        subtitle="High-value styles with strong discount signals and easy gifting appeal."
        products={recommendedProducts}
      />

      <DiscoveryRail
        title="Recently viewed"
        subtitle="Your latest product views, kept close for easy comparison."
        products={recentlyViewedProducts}
      />
    </main>
  )
}
