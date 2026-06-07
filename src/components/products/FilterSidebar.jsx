import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import styles from './FilterSidebar.module.css'
import { formatTypeName } from '../../utils/catalogDisplay'
import { getColorDisplayName, getColorHex } from '../../utils/colorNormalization'

const DEFAULT_PRICE_RANGE = { min: 0, max: 10000 }

/**
 * Checks whether two price ranges represent the same preset.
 * @danishansari-dev a - First price range
 * @danishansari-dev b - Second price range
 * @returns True when both ranges use the same min and max values
 */
function isSameRange(a, b) {
    return a?.min === b.min && a?.max === b.max
}

/**
 * Renders an accordion section used by both desktop and mobile filter surfaces.
 * @danishansari-dev id - Section identifier used for aria relationships
 * @danishansari-dev title - Visible section title
 * @danishansari-dev isOpen - Whether the section content is visible
 * @danishansari-dev onToggle - Callback for expanding/collapsing
 * @danishansari-dev children - Section controls
 * @returns Filter accordion section
 */
function FilterSection({ id, title, isOpen, onToggle, children }) {
    return (
        <section className={styles.section}>
            <button
                type="button"
                className={styles.sectionToggle}
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
            >
                <span>{title}</span>
                <svg className={isOpen ? styles.chevronOpen : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            {isOpen && (
                <div id={`${id}-panel`} className={styles.sectionPanel}>
                    {children}
                </div>
            )}
        </section>
    )
}

/**
 * Provides faceted product filtering in a sticky sidebar and mobile bottom sheet.
 * @danishansari-dev availableFilters - Filter facets derived from current catalogue context
 * @danishansari-dev activeFilters - Current selected filter values
 * @danishansari-dev handlers - Filter mutation callbacks from useProductsFilter
 * @danishansari-dev isOpen - Whether the mobile filter sheet is visible
 * @danishansari-dev onClose - Callback to close the mobile filter sheet
 * @returns Responsive filter sidebar
 */
export default function FilterSidebar({
    availableFilters,
    activeFilters,
    handlers,
    isOpen,
    onClose
}) {
    const { types = [], colors = [] } = availableFilters
    const { types: selectedTypes, colors: selectedColors, priceRange } = activeFilters
    const { toggleType, toggleColor, clearAllFilters, removeFilter, setPricePreset } = handlers
    const [typeSearch, setTypeSearch] = useState('')
    const [colorSearch, setColorSearch] = useState('')
    const [showAllTypes, setShowAllTypes] = useState(false)
    const [showAllColors, setShowAllColors] = useState(false)
    const [openSections, setOpenSections] = useState({
        category: true,
        color: true,
        price: true
    })

    // Prevent page scroll behind the mobile sheet so filter changes feel intentional.
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const filteredTypes = useMemo(() => {
        const query = typeSearch.trim().toLowerCase()
        return types.filter(({ name }) => formatTypeName(name).toLowerCase().includes(query))
    }, [types, typeSearch])

    const filteredColors = useMemo(() => {
        const query = colorSearch.trim().toLowerCase()
        return colors.filter(({ name }) => getColorDisplayName(name).toLowerCase().includes(query))
    }, [colors, colorSearch])

    const visibleTypes = showAllTypes ? filteredTypes : filteredTypes.slice(0, 8)
    const visibleColors = showAllColors ? filteredColors : filteredColors.slice(0, 10)
    const isPriceActive = !isSameRange(priceRange, DEFAULT_PRICE_RANGE)
    const hasActiveFilters = selectedTypes.length > 0 || selectedColors.length > 0 || isPriceActive

    const priceOptions = [
        { id: 'under-100', label: 'Under', amount: 100, range: { min: 0, max: 100 } },
        { id: 'under-500', label: 'Under', amount: 500, range: { min: 0, max: 500 } },
        { id: 'premium', label: 'Premium', amount: 500, range: { min: 500, max: 10000 } }
    ]

    const toggleSection = (section) => {
        setOpenSections((current) => ({
            ...current,
            [section]: !current[section]
        }))
    }

    const FilterContent = (
        <>
            <div className={styles.drawerHeader}>
                <div>
                    <p className={styles.eyebrow}>Refine</p>
                    <h2 className={styles.drawerTitle}>Filters</h2>
                </div>
                <div className={styles.headerActions}>
                    {hasActiveFilters && (
                        <button type="button" className={styles.clearLink} onClick={clearAllFilters}>
                            Clear all
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.drawerContent}>
                {types.length > 0 && (
                    <FilterSection
                        id="category-filter"
                        title="Categories"
                        isOpen={openSections.category}
                        onToggle={() => toggleSection('category')}
                    >
                        <label className={styles.inputLabel} htmlFor="type-filter-search">Search category</label>
                        <input
                            id="type-filter-search"
                            className={styles.filterSearch}
                            value={typeSearch}
                            onChange={(event) => setTypeSearch(event.target.value)}
                            placeholder="Search categories"
                            type="search"
                        />
                        <div className={styles.categoryList}>
                            {visibleTypes.map(({ name, count }) => {
                                const isActive = selectedTypes.includes(name)
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        className={`${styles.categoryPill} ${isActive ? styles.active : ''}`}
                                        onClick={() => toggleType(name)}
                                        aria-pressed={isActive}
                                    >
                                        <span>{formatTypeName(name)}</span>
                                        <span className={styles.count}>{count}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {filteredTypes.length > 8 && (
                            <button type="button" className={styles.showMore} onClick={() => setShowAllTypes((value) => !value)}>
                                {showAllTypes ? 'Show fewer' : `Show ${filteredTypes.length - 8} more`}
                            </button>
                        )}
                    </FilterSection>
                )}

                {colors.length > 0 && (
                    <FilterSection
                        id="color-filter"
                        title="Colors"
                        isOpen={openSections.color}
                        onToggle={() => toggleSection('color')}
                    >
                        <label className={styles.inputLabel} htmlFor="color-filter-search">Search color</label>
                        <input
                            id="color-filter-search"
                            className={styles.filterSearch}
                            value={colorSearch}
                            onChange={(event) => setColorSearch(event.target.value)}
                            placeholder="Search colors"
                            type="search"
                        />
                        <div className={styles.colorList}>
                            {visibleColors.map(({ name, count }) => {
                                const isActive = selectedColors.includes(name)
                                const bgValue = getColorHex(name)
                                const isGradient = bgValue.startsWith('linear-gradient')

                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        className={`${styles.colorOption} ${isActive ? styles.active : ''}`}
                                        onClick={() => toggleColor(name)}
                                        aria-pressed={isActive}
                                    >
                                        <span
                                            className={styles.colorDot}
                                            data-color={name}
                                            style={{
                                                background: bgValue,
                                                backgroundColor: !isGradient ? bgValue : undefined
                                            }}
                                        />
                                        <span className={styles.colorName}>{getColorDisplayName(name)}</span>
                                        <span className={styles.count}>{count}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {selectedColors.length > 0 && (
                            <button
                                type="button"
                                className={styles.clearSubset}
                                onClick={() => selectedColors.forEach((color) => removeFilter('color', color))}
                            >
                                Clear colors
                            </button>
                        )}
                        {filteredColors.length > 10 && (
                            <button type="button" className={styles.showMore} onClick={() => setShowAllColors((value) => !value)}>
                                {showAllColors ? 'Show fewer' : `Show ${filteredColors.length - 10} more shades`}
                            </button>
                        )}
                    </FilterSection>
                )}

                <FilterSection
                    id="price-filter"
                    title="Price"
                    isOpen={openSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <div className={styles.priceGrid}>
                        {priceOptions.map((option) => {
                            const active = isSameRange(priceRange, option.range)
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`${styles.priceChip} ${active ? styles.active : ''}`}
                                    onClick={() => setPricePreset(active ? DEFAULT_PRICE_RANGE : option.range)}
                                    aria-pressed={active}
                                >
                                    {option.label} <span>&#8377;{option.amount}</span>
                                </button>
                            )
                        })}
                    </div>
                    {isPriceActive && (
                        <button type="button" className={styles.clearSubset} onClick={() => removeFilter('price')}>
                            Clear price
                        </button>
                    )}
                </FilterSection>
            </div>

            <div className={styles.drawerFooter}>
                <button type="button" className={styles.applyBtn} onClick={onClose}>
                    Show results
                </button>
            </div>
        </>
    )

    return (
        <>
            <aside className={styles.desktopSidebar} aria-label="Product filters">
                {FilterContent}
            </aside>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            aria-hidden="true"
                        />
                        <motion.aside
                            className={styles.bottomSheet}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Product filters"
                        >
                            <div className={styles.dragHandle} />
                            {FilterContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
