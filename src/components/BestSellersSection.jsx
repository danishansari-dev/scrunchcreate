import React, { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import styles from './BestSellersSection.module.css'
import ProductCard from './ProductCard'
import { getProducts } from '../utils/getProducts'

export default function BestSellersSection() {
    const [products, setProducts] = useState([])

    useEffect(() => {
        const data = getProducts()
        setProducts(data)
    }, [])

    // Select 6 "best sellers" - take a mix of products from different categories
    const bestSellers = useMemo(() => {
        if (products.length === 0) return []

        // Get scrunchies and hairbows
        const scrunchies = products.filter(
            (p) => p.category && p.category.toLowerCase().includes('scrunch')
        )
        const hairbows = products.filter(
            (p) => p.category && p.category.toLowerCase().includes('hairbow')
        )

        // Mix them together - take 3 from each category if available
        const selected = []
        const scrunchieCount = Math.min(3, scrunchies.length)
        const hairbowCount = Math.min(3, hairbows.length)

        for (let i = 0; i < scrunchieCount; i++) {
            selected.push(scrunchies[i])
        }
        for (let i = 0; i < hairbowCount; i++) {
            selected.push(hairbows[i])
        }

        // If we don't have 6, fill with more from either category
        const remaining = 6 - selected.length
        const allProducts = [...scrunchies.slice(scrunchieCount), ...hairbows.slice(hairbowCount)]
        for (let i = 0; i < remaining && i < allProducts.length; i++) {
            selected.push(allProducts[i])
        }

        return selected.slice(0, 6)
    }, [products])

    if (bestSellers.length === 0) {
        return null
    }

    return (
        <section className={styles.bestSellersSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>Best Sellers</h2>
                    <p className={styles.sectionSubtitle}>
                        Handpicked favorites loved by our community
                    </p>
                </div>
                <ul className={styles.productsGrid}>
                    <AnimatePresence initial={false}>
                        {bestSellers.map((product, idx) => (
                            <ProductCard key={product.id} product={product} index={idx} />
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
        </section>
    )
}
