import { useMemo, useState, useCallback, useEffect } from 'react'
import { normalizeColor, CANONICAL_COLORS } from '../utils/colorNormalization'

// Set of canonical colors for fast lookup — only these should appear in the color filter
const VALID_COLORS = new Set(CANONICAL_COLORS)

/**
 * Check if a normalized color value is a real color (not a product type/style name).
 * Filters out values like "standard", "mixed", "3-layered", "jimmi-choo", "pigtail", etc.
 */
function isRealColor(normalizedColor) {
    if (!normalizedColor) return false
    return VALID_COLORS.has(normalizedColor)
}

/**
 * Get all real (canonical) colors from a product, checking variants, availableColors, and base color.
 */
function getProductRealColors(product) {
    const colors = new Set()

    // From availableColors
    if (product.availableColors && Array.isArray(product.availableColors)) {
        product.availableColors.forEach(c => {
            if (isRealColor(c)) colors.add(c)
        })
    }

    // From base product normalizedColor
    const baseColor = product._normalizedColor || product.normalizedColor || normalizeColor(product.color)
    if (baseColor && isRealColor(baseColor)) colors.add(baseColor)

    // From all variants
    if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(v => {
            const vColor = v.normalizedColor || normalizeColor(v.color)
            if (vColor && isRealColor(vColor)) colors.add(vColor)
        })
    }

    return colors
}

/**
 * Find the variant that matches one of the selected colors.
 * Returns the first matching variant, or null if none match.
 */
function findMatchingVariant(product, selectedColors) {
    if (!product.variants || !Array.isArray(product.variants) || selectedColors.length === 0) {
        return null
    }

    for (const variant of product.variants) {
        const vColor = variant.normalizedColor || normalizeColor(variant.color)
        if (vColor && selectedColors.includes(vColor)) {
            return variant
        }
    }
    return null
}


/**
 * Custom hook to filter, sort, and search products efficiently.
 * 
 * When a color filter is active, the product's displayed image is swapped
 * to show the matching variant's image instead of the default.
 * 
 * @param {Array} allProducts - Full list of products.
 * @param {Object} initialFilters - Initial state { category, type, color, price, search, sort }
 * @returns {Object} - { filteredProducts, availableFilters, activeFilters, handlers }
 */
export function useProductsFilter(allProducts = [], initialFilters = {}) {
    // --- State ---
    const [search, setSearch] = useState(initialFilters.search || '')
    const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || null)
    const [selectedTypes, setSelectedTypes] = useState(initialFilters.type ? [initialFilters.type] : [])
    const [selectedColors, setSelectedColors] = useState(initialFilters.color ? [initialFilters.color] : [])
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 }) // Default wide range
    const [sortOption, setSortOption] = useState(initialFilters.sort || '')

    // --- External Sync (if props change) ---
    useEffect(() => {
        if (initialFilters.category !== undefined) setSelectedCategory(initialFilters.category)
        if (initialFilters.type) setSelectedTypes([initialFilters.type])
        if (initialFilters.color) setSelectedColors([initialFilters.color])
        if (initialFilters.search !== undefined) setSearch(initialFilters.search)
        if (initialFilters.sort !== undefined) setSortOption(initialFilters.sort)
    }, [initialFilters.category, initialFilters.type, initialFilters.color, initialFilters.search, initialFilters.sort])


    // --- 1. Pre-computation / Normalization ---
    // Memoize the normalized products to avoid re-calculating on every render
    const normalizedProducts = useMemo(() => {
        return allProducts.map(p => ({
            ...p,
            // Create a unified searchable string (include all variant colors)
            _searchable: `${p.name} ${p.category} ${p.type} ${p.tags?.join(' ') || ''} ${p.color} ${p.variants?.map(v => v.color).join(' ') || ''}`.toLowerCase(),
            // Ensure normalized color exists
            _normalizedColor: p.normalizedColor || normalizeColor(p.color),
            // Ensure specific price exists
            _price: p.price || 0
        }))
    }, [allProducts])


    // --- 2. Filtering Logic ---
    // Filter products AND swap images when a color filter is active
    const filteredProducts = useMemo(() => {
        return normalizedProducts
            .filter(p => {
                // 1. Category
                if (selectedCategory && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false
                }

                // 2. Search
                if (search) {
                    const searchTerm = search.toLowerCase().trim()
                    if (!p._searchable.includes(searchTerm)) return false
                }

                // 3. Type
                if (selectedTypes.length > 0) {
                    if (!selectedTypes.includes(p.type)) return false
                }

                // 4. Color — check ALL variants / availableColors for match
                if (selectedColors.length > 0) {
                    const productColors = getProductRealColors(p)
                    const hasMatch = [...productColors].some(c => selectedColors.includes(c))
                    if (!hasMatch) return false
                }

                // 5. Price
                if (p._price < priceRange.min || p._price > priceRange.max) {
                    return false
                }

                return true
            })
            .map(p => {
                // If a color filter is active, swap the displayed image to the matching variant
                if (selectedColors.length > 0 && p.variants && p.variants.length > 0) {
                    const matchingVariant = findMatchingVariant(p, selectedColors)
                    if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
                        return {
                            ...p,
                            primaryImage: matchingVariant.images[0],
                            images: matchingVariant.images,
                            // Keep everything else the same so ProductCard renders correctly
                            _matchedColor: matchingVariant.normalizedColor || normalizeColor(matchingVariant.color)
                        }
                    }
                }
                return p
            })
    }, [normalizedProducts, selectedCategory, search, selectedTypes, selectedColors, priceRange])


    // --- 3. Sorting Logic ---
    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts]
        if (sortOption === 'price_asc') {
            sorted.sort((a, b) => a._price - b._price)
        } else if (sortOption === 'price_desc') {
            sorted.sort((a, b) => b._price - a._price)
        } else if (sortOption === 'newest') {
            // Assuming there isn't a date field yet
        }
        return sorted
    }, [filteredProducts, sortOption])


    // --- 4. Facet Generation (Counts) ---
    // Create facets based on the CURRENT search/category context, 
    // but IGNORING their own filter to show available options.
    // E.g. If "Red" is selected, we still want to show "Blue (5)" so user knows they can switch.

    const availableFilters = useMemo(() => {
        // Base set of products for facet calculation:
        // Filtered by Category + Search, but NOT by Type/Color/Price yet.
        const baseProducts = normalizedProducts.filter(p => {
            if (selectedCategory && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false
            if (search && !p._searchable.includes(search.toLowerCase().trim())) return false
            return true
        })

        const types = {}
        const colors = {}
        let minPrice = Infinity
        let maxPrice = -Infinity

        baseProducts.forEach(p => {
            // Types
            if (p.type) {
                types[p.type] = (types[p.type] || 0) + 1
            }

            // Colors — collect ALL real colors from product + ALL variants
            const pColors = getProductRealColors(p)

            pColors.forEach(c => {
                colors[c] = (colors[c] || 0) + 1
            })

            // Price
            if (p._price < minPrice) minPrice = p._price
            if (p._price > maxPrice) maxPrice = p._price
        })

        return {
            types: Object.entries(types).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
            colors: Object.entries(colors).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
            price: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice === -Infinity ? 100 : maxPrice }
        }
    }, [normalizedProducts, selectedCategory, search])


    // --- 5. Handlers ---
    const toggleType = useCallback((type) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
    }, [])

    const toggleColor = useCallback((color) => {
        setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
    }, [])

    const clearAllFilters = useCallback(() => {
        setSelectedTypes([])
        setSelectedColors([])
        setPriceRange({ min: 0, max: 10000 })
        setSearch('')
    }, [])

    const removeFilter = useCallback((type, value) => {
        if (type === 'color') toggleColor(value)
        if (type === 'type') toggleType(value)
        if (type === 'search') setSearch('')
    }, [toggleColor, toggleType])

    return {
        products: sortedProducts,
        totalCount: sortedProducts.length,
        availableFilters,
        state: {
            search,
            category: selectedCategory,
            types: selectedTypes,
            colors: selectedColors,
            priceRange,
            sort: sortOption
        },
        setters: {
            setSearch,
            setCategory: setSelectedCategory,
            setSort: setSortOption,
            setPriceRange
        },
        handlers: {
            toggleType,
            toggleColor,
            clearAllFilters,
            removeFilter
        }
    }
}