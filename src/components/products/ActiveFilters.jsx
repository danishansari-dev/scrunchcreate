import React from 'react'
import styles from './ActiveFilters.module.css'
import { getColorDisplayName } from '../../utils/colorNormalization'

export default function ActiveFilters({ activeFilters, handlers }) {
    const { types, colors, search } = activeFilters
    const { removeFilter, clearAllFilters } = handlers

    const hasFilters = types.length > 0 || colors.length > 0 || search

    if (!hasFilters) return null

    return (
        <div className={styles.container}>
            {search && (
                <div className={styles.chip}>
                    <span>Search: "{search}"</span>
                    <button className={styles.remove} onClick={() => removeFilter('search')}>×</button>
                </div>
            )}

            {types.map(type => (
                <div key={type} className={styles.chip}>
                    <span>Type: {type}</span>
                    <button className={styles.remove} onClick={() => removeFilter('type', type)}>×</button>
                </div>
            ))}

            {colors.map(color => (
                <div key={color} className={styles.chip}>
                    <span>{getColorDisplayName(color)}</span>
                    <button className={styles.remove} onClick={() => removeFilter('color', color)}>×</button>
                </div>
            ))}

            <button className={styles.clearAll} onClick={clearAllFilters}>Clear All</button>
        </div>
    )
}
