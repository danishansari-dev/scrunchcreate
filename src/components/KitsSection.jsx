import React from 'react'
import { Link } from 'react-router-dom'
import SectionHeader from './SectionHeader'
import styles from './KitsSection.module.css'

/**
 * FIX #6: Hardcoded Kits section with 3 curated kits.
 * Uses real product images from existing assets.
 */
const kits = [
    {
        id: 'daily-essentials',
        name: 'Daily Essentials Kit',
        description: 'Your everyday go-to set — 3 classic scrunchies + 1 mini bow',
        price: '₹699',
        originalPrice: '₹999',
        image: '/assets/products/scrunchie/combo/sc-scrunchie-combo-1.webp',
        href: '/products?category=GiftHamper',
    },
    {
        id: 'gift-kit',
        name: 'Gift Kit',
        description: 'A curated hamper with premium scrunchies, bows & hairclips',
        price: '₹1,299',
        originalPrice: '₹1,799',
        image: '/assets/products/hairbow/combo/jimmi-choo-bow-combo/sc-hairbow-combo-jimmi-choo-bow-combo-1.webp',
        href: '/products?category=GiftHamper',
    },
    {
        id: 'statement-kit',
        name: 'Statement Kit',
        description: 'Bold satin bows & luxe scrunchies for special occasions',
        price: '₹1,599',
        originalPrice: '₹2,199',
        image: '/assets/products/hairbow/combo/satin-tulip/sc-hairbow-combo-satin-tulip-1.webp',
        href: '/products?category=GiftHamper',
    },
]

export default function KitsSection() {
    return (
        <section className={styles.kitsSection}>
            <SectionHeader
                title="The Kits"
                subtitle="Curated sets — ready to gift or keep"
                linkText="Shop all kits"
                linkHref="/products?category=GiftHamper"
            />
            <div className={styles.kitsGrid}>
                {kits.map((kit) => (
                    <Link key={kit.id} to={kit.href} className={styles.kitCard}>
                        <div className={styles.kitImage}>
                            <img src={kit.image} alt={kit.name} loading="lazy" />
                        </div>
                        <div className={styles.kitBody}>
                            <h3 className={styles.kitName}>{kit.name}</h3>
                            <p className={styles.kitDesc}>{kit.description}</p>
                            <div className={styles.kitPricing}>
                                <span className={styles.kitPrice}>{kit.price}</span>
                                <span className={styles.kitOriginal}>{kit.originalPrice}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
