import React, { useState, useEffect } from 'react'
import styles from './ProductSearch.module.css'

export default function ProductSearch({ onSearch, initialValue = '' }) {
    const [value, setValue] = useState(initialValue)

    // Sync local state if parent changes it (e.g. clear all filters)
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (value !== initialValue) {
                onSearch(value)
            }
        }, 300) // 300ms debounce

        return () => clearTimeout(handler)
    }, [value, onSearch, initialValue])

    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                className={styles.input}
                placeholder="Search products..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <span className={styles.icon}>🔍</span>
        </div>
    )
}
