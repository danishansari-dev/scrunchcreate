import React, { useEffect } from 'react'
import styles from './FilterSidebar.module.css'
import { getColorDisplayName, getColorHex } from '../../utils/colorNormalization'

export default function FilterSidebar({
    availableFilters,
    activeFilters,
    handlers,
    isOpen,
    onClose
}) {
    const { types = [], colors = [] } = availableFilters
    const { types: selectedTypes, colors: selectedColors } = activeFilters
    const { toggleType, toggleColor, clearAllFilters } = handlers

    // Lock background scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const hasActiveFilters = selectedTypes.length > 0 || selectedColors.length > 0

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                role="dialog"
                aria-label="Product Filters"
            >
                {/* Header (mobile) */}
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Filters</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable content */}
                <div className={styles.drawerContent}>

                    {/* ── Color Swatches ── */}
                    {colors.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Filter by Color</h3>
                            <div className={styles.swatchGrid}>
                                {colors.map(({ name, count }) => {
                                    const isActive = selectedColors.includes(name)
                                    const bgValue = getColorHex(name)
                                    const isGradient = bgValue.startsWith('linear-gradient')

                                    return (
                                        <button
                                            key={name}
                                            className={`${styles.swatchItem} ${isActive ? styles.active : ''}`}
                                            onClick={() => toggleColor(name)}
                                            aria-label={`${getColorDisplayName(name)} (${count})`}
                                            aria-pressed={isActive}
                                        >
                                            <span
                                                className={styles.swatchCircle}
                                                data-color={name}
                                                style={{
                                                    background: isGradient ? bgValue : bgValue,
                                                    backgroundColor: !isGradient ? bgValue : undefined
                                                }}
                                            />
                                            <span className={styles.swatchLabel}>
                                                {getColorDisplayName(name)}
                                                <span className={styles.swatchCount}> {count}</span>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Categories (Product Types) ── */}
                    {types.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Categories</h3>
                            <div className={styles.categoryList}>
                                {types.map(({ name, count }) => {
                                    const isActive = selectedTypes.includes(name)
                                    return (
                                        <button
                                            key={name}
                                            className={`${styles.categoryPill} ${isActive ? styles.active : ''}`}
                                            onClick={() => toggleType(name)}
                                            aria-pressed={isActive}
                                        >
                                            {name}
                                            <span className={styles.pillCount}>({count})</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.drawerFooter}>
                    <button
                        className={styles.clearAllBtn}
                        onClick={clearAllFilters}
                        disabled={!hasActiveFilters}
                    >
                        Clear All
                    </button>
                    <button
                        className={styles.applyBtn}
                        onClick={onClose}
                    >
                        View Results
                    </button>
                </div>
            </aside>
        </>
    )
}
