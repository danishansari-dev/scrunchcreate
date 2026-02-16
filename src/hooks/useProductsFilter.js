import { useMemo, useState, useCallback, useEffect } from 'react'
import { normalizeColor } from '../utils/colorNormalization'

/**
 * Custom hook to filter, sort, and search products efficiently.
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
            // Create a unified searchable string
            _searchable: `${p.name} ${p.category} ${p.type} ${p.tags?.join(' ') || ''} ${p.color} ${p.variants?.map(v => v.color).join(' ') || ''}`.toLowerCase(),
            // Ensure normalized color exists
            _normalizedColor: p.normalizedColor || normalizeColor(p.color),
            // Ensure specific price exists
            _price: p.price || 0
        }))
    }, [allProducts])


    // --- 2. Filtering Logic ---
    const filteredProducts = useMemo(() => {
        return normalizedProducts.filter(p => {
            // 1. Category
            if (selectedCategory && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
                return false
            }

            // 2. Search (Debounce should be handled at UI input level, but we filter here)
            if (search) {
                const searchTerm = search.toLowerCase().trim()
                if (!p._searchable.includes(searchTerm)) return false
            }

            // 3. Type
            if (selectedTypes.length > 0) {
                if (!selectedTypes.includes(p.type)) return false
            }

            // 4. Color
            if (selectedColors.length > 0) {
                // Check main product color OR any variant color
                const productColors = []
                if (p.availableColors && Array.isArray(p.availableColors)) {
                    productColors.push(...p.availableColors)
                } else if (p._normalizedColor) {
                    productColors.push(p._normalizedColor)
                }

                // If product has variants, check them too (though availableColors should cover this)
                if (p.variants) {
                    p.variants.forEach(v => {
                        const vColor = v.normalizedColor || normalizeColor(v.color)
                        if (vColor) productColors.push(vColor)
                    })
                }

                const hasMatch = productColors.some(c => selectedColors.includes(c))
                if (!hasMatch) return false
            }

            // 5. Price
            if (p._price < priceRange.min || p._price > priceRange.max) {
                return false
            }

            return true
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
            // Assuming there isn't a date field yet, but if there was:
            // sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            // For now, rely on array order (often newest first/last) or simple reverse if needed
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
        // This allows seeing what types/colors are available within the current search result.
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

            // Colors
            const pColors = new Set()
            if (p.availableColors) p.availableColors.forEach(c => pColors.add(c))
            if (p._normalizedColor) pColors.add(p._normalizedColor)

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
