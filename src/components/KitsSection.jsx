import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import styles from './KitsSection.module.css'
import { getProductsByCategory } from '../services/api'

/**
 * Dynamically fetches gift hamper / kit products from the API
 * and renders them as curated kit cards.
 * Falls back to a static empty state if the API call fails.
 */
export default function KitsSection() {
    const [kits, setKits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function fetchKits() {
            try {
                const products = await getProductsByCategory('gifthamper')
                if (!cancelled && products.length > 0) {
                    // Show up to 3 visually diverse kits (pick first 3)
                    setKits(products.slice(0, 3))
                }
            } catch (err) {
                console.warn('⚠️ [KitsSection] Could not fetch kits:', err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchKits()
        return () => { cancelled = true }
    }, [])

    // Don't render the section at all if there are no kits to show
    if (!loading && kits.length === 0) return null

    return (
        <section className={styles.kitsSection}>
            <SectionHeader
                title="The Kits"
                subtitle="Curated sets — ready to gift or keep"
                linkText="Shop all kits"
                linkHref="/products?category=GiftHamper"
            />
            <div className={styles.kitsGrid}>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`${styles.kitCard} ${styles.skeleton}`}>
                            <div className={styles.kitImage} />
                            <div className={styles.kitBody}>
                                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                                <div className={styles.skeletonLine} style={{ width: '90%' }} />
                                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                            </div>
                        </div>
                    ))
                    : kits.map((kit) => (
                        <Link
                            key={kit._id}
                            to={`/product/${kit.slug}`}
                            className={styles.kitCard}
                        >
                            <div className={styles.kitImage}>
                                <img
                                    src={kit.images?.[0] || ''}
                                    alt={kit.name}
                                    loading="lazy"
                                />
                            </div>
                            <div className={styles.kitBody}>
                                <h3 className={styles.kitName}>{kit.name}</h3>
                                <p className={styles.kitDesc}>{kit.description}</p>
                                <div className={styles.kitPricing}>
                                    <span className={styles.kitPrice}>
                                        ₹{kit.price?.toLocaleString('en-IN')}
                                    </span>
                                    {kit.originalPrice && (
                                        <span className={styles.kitOriginal}>
                                            ₹{kit.originalPrice?.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
        </section>
    )
}
