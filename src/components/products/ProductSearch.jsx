import React, { useEffect, useState } from 'react'
import styles from './ProductSearch.module.css'

/**
 * Provides debounced catalogue search so the product grid can respond while users type.
 * @danishansari-dev onSearch - Callback that receives the debounced search value
 * @danishansari-dev initialValue - Search value controlled by the parent filter state
 * @returns Product search input
 */
export default function ProductSearch({ onSearch, initialValue = '' }) {
    const [value, setValue] = useState(initialValue)

    // Keep the field aligned with parent resets such as "Clear all".
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (value !== initialValue) {
                onSearch(value)
            }
        }, 300)

        return () => clearTimeout(handler)
    }, [value, onSearch, initialValue])

    return (
        <div className={styles.searchContainer}>
            <label className={styles.label} htmlFor="product-search">Search products</label>
            <input
                id="product-search"
                type="text"
                className={styles.input}
                placeholder="Search handcrafted accessories"
                value={value}
                onChange={(event) => setValue(event.target.value)}
            />
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>
        </div>
    )
}
