import React, { useState, useEffect } from 'react'
import styles from './FilterSidebar.module.css'
import { getColorDisplayName, getColorHex } from '../../utils/colorNormalization'

// Human-readable type display names
const TYPE_DISPLAY_NAMES = {
    'jimmychoo': 'Jimmy Choo',
    'satin': 'Satin',
    'sheer-satin': 'Sheer Satin',
    'velvet': 'Velvet',
    'scarf': 'Scarf',
    'combo': 'Combo',
    'printed-mini': 'Printed Mini',
    'printed_mini': 'Printed Mini',
    'satin-mini': 'Satin Mini',
    'satin_mini': 'Satin Mini',
    'satin-printed': 'Satin Printed',
    'satin_printed': 'Satin Printed',
    'satin-tulip': 'Satin Tulip',
    'satin-princes': 'Satin Princess',
    'classic': 'Classic',
    'tulip': 'Tulip',
    'tulip-sheer': 'Tulip Sheer',
    'rose': 'Rose',
    'satin-hamper': 'Satin Hamper',
    'Satin Tulip Bows': 'Satin Tulip Bows',
    'Satin princes Bow': 'Satin Princess Bow',
    'Printed_mini': 'Printed Mini',
    'Satin_printed': 'Satin Printed',
    'Satin_mini': 'Satin Mini',
    'Classic': 'Classic',
    'Combo': 'Combo',
}

function formatTypeName(rawType) {
    if (!rawType) return ''
    if (TYPE_DISPLAY_NAMES[rawType]) return TYPE_DISPLAY_NAMES[rawType]
    // Fallback: capitalize and replace separators
    return rawType
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
}

function CollapseSection({ title, count, defaultOpen = true, children }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={styles.section}>
            <button
                className={styles.sectionHeader}
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
            >
                <span className={styles.sectionTitle}>
                    {title}
                    {count > 0 && <span className={styles.sectionBadge}>{count}</span>}
                </span>
                <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div className={`${styles.sectionBody} ${isOpen ? styles.sectionBodyOpen : ''}`}>
                <div className={styles.sectionInner}>
                    {children}
                </div>
            </div>
        </div>
    )
}

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

    // Lock background scroll when drawer is open (mobile)
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
            {/* Backdrop overlay (mobile) */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer / Sidebar panel */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                role="dialog"
                aria-label="Product Filters"
            >
                {/* Header */}
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="8" y1="12" x2="20" y2="12" />
                            <line x1="12" y1="18" x2="20" y2="18" />
                        </svg>
                        Filters
                        {hasActiveFilters && (
                            <button className={styles.clearLink} onClick={clearAllFilters}>
                                Clear all
                            </button>
                        )}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className={styles.drawerContent}>

                    {/* ── Subcategory / Type Filter ── */}
                    {types.length > 0 && (
                        <CollapseSection
                            title="Categories"
                            count={selectedTypes.length}
                            defaultOpen={true}
                        >
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
                                            {formatTypeName(name)}
                                            <span className={styles.pillCount}>({count})</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </CollapseSection>
                    )}

                    {/* ── Color Swatches ── */}
                    {colors.length > 0 && (
                        <CollapseSection
                            title="Colors"
                            count={selectedColors.length}
                            defaultOpen={true}
                        >
                            <div className={styles.colorList}>
                                {colors.map(({ name, count }) => {
                                    const isActive = selectedColors.includes(name)
                                    const bgValue = getColorHex(name)
                                    const isGradient = bgValue.startsWith('linear-gradient')

                                    return (
                                        <button
                                            key={name}
                                            className={`${styles.colorPill} ${isActive ? styles.active : ''}`}
                                            onClick={() => toggleColor(name)}
                                            aria-label={`${getColorDisplayName(name)} (${count})`}
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
                                            <span className={styles.colorName}>
                                                {getColorDisplayName(name)}
                                            </span>
                                            <span className={styles.colorCount}>{count}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </CollapseSection>
                    )}
                </div>

                {/* Footer (mobile) */}
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
