import styles from './ActiveFilters.module.css'
import { formatTypeName } from '../../utils/catalogDisplay'
import { getColorDisplayName } from '../../utils/colorNormalization'

const DEFAULT_PRICE_RANGE = { min: 0, max: 10000 }

/**
 * Formats the active price preset into shopper-friendly text.
 * @danishansari-dev priceRange - Current min/max price filter
 * @returns Human-readable price filter label
 */
function formatPriceLabel(priceRange) {
    if (!priceRange || (priceRange.min === DEFAULT_PRICE_RANGE.min && priceRange.max === DEFAULT_PRICE_RANGE.max)) {
        return ''
    }

    if (priceRange.min === 0) {
        return `Under \u20b9${priceRange.max}`
    }

    return `\u20b9${priceRange.min}+`
}

/**
 * Shows removable active filter tags above the product grid.
 * @danishansari-dev activeFilters - Current filter state from useProductsFilter
 * @danishansari-dev handlers - Filter mutation callbacks
 * @returns Active filter tag row or null when no filters are applied
 */
export default function ActiveFilters({ activeFilters, handlers }) {
    const { types, colors, search, priceRange } = activeFilters
    const { removeFilter, clearAllFilters } = handlers
    const priceLabel = formatPriceLabel(priceRange)

    const hasFilters = types.length > 0 || colors.length > 0 || Boolean(search) || Boolean(priceLabel)

    if (!hasFilters) return null

    return (
        <div className={styles.container} aria-label="Active filters">
            {search && (
                <div className={styles.chip}>
                    <span>Search: {search}</span>
                    <button type="button" className={styles.remove} onClick={() => removeFilter('search')} aria-label="Remove search filter">
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
            )}

            {types.map((type) => (
                <div key={type} className={styles.chip}>
                    <span>{formatTypeName(type)}</span>
                    <button type="button" className={styles.remove} onClick={() => removeFilter('type', type)} aria-label={`Remove ${formatTypeName(type)} filter`}>
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
            ))}

            {colors.map((color) => (
                <div key={color} className={styles.chip}>
                    <span>{getColorDisplayName(color)}</span>
                    <button type="button" className={styles.remove} onClick={() => removeFilter('color', color)} aria-label={`Remove ${getColorDisplayName(color)} filter`}>
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
            ))}

            {priceLabel && (
                <div className={styles.chip}>
                    <span>{priceLabel}</span>
                    <button type="button" className={styles.remove} onClick={() => removeFilter('price')} aria-label="Remove price filter">
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
            )}

            <button type="button" className={styles.clearAll} onClick={clearAllFilters}>Clear all</button>
        </div>
    )
}
