import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styles from './CollectionsSection.module.css'
import { getProductsByCategory } from '../utils/getProducts'
import SectionHeader from './SectionHeader'

const collectionDefs = [
    {
        id: 'scrunchies',
        name: 'Scrunchies',
        description: 'Luxurious fabric scrunchies that care for your hair',
        category: 'Scrunchie',
        href: '/products/scrunchie',
        count: '24 styles',
        image: '/assets/products/scrunchie/classic/white/sc-scrunchie-classic-white-1.webp'
    },
    {
        id: 'hairbows',
        name: 'Hair Bows',
        description: 'Elegant bows for a sophisticated touch',
        category: 'HairBow',
        href: '/products/hairbow',
        count: '18 styles',
        image: '/assets/products/hairbow/jimmychoo/peach-pink/sc-hairbow-jimmychoo-peach-pink-1.webp'
    },
    {
        id: 'hairclips',
        name: 'Hairclips',
        description: 'Elegant clips for a stylish look',
        category: 'Hairclip',
        href: '/products/hairclip',
        count: '12 styles',
        image: '/assets/products/hairclip/rose/red/sc-hairclip-rose-red-1.webp'
    },
    {
        id: 'gifthamper',
        name: 'Gift Hampers',
        description: 'Curated gift sets for your loved ones',
        category: 'GiftHamper',
        href: '/products/gifthamper',
        count: '12 styles',
    },
]

export default function CollectionsSection() {
    const [failedImages, setFailedImages] = useState(new Set())

    // Derive collection images dynamically from product data
    const collections = useMemo(() => {
        return collectionDefs
            .map(def => {
                // If image is already defined in collectionDefs, use it
                if (def.image) return def

                const products = getProductsByCategory(def.category)
                // Find first product with valid images
                const productWithImage = products.find(p => p.images && p.images.length > 0)
                const image = productWithImage ? productWithImage.images[0] : null
                return { ...def, image }
            })
            // Only show collections that have at least one product with an image
            .filter(c => c.image !== null)
    }, [])

    const handleImageError = (collectionId) => {
        setFailedImages(prev => new Set([...prev, collectionId]))
    }

    // Filter out collections with failed images
    const visibleCollections = collections.filter(c => !failedImages.has(c.id))

    if (visibleCollections.length === 0) return null

    return (
        <section className={styles.collectionsSection}>
            <SectionHeader
                title="Discover Our Collections"
                subtitle="Handmade for every occasion"
            />
            <div className={styles.collectionsGrid}>
                {visibleCollections.map((collection) => (
                    <Link
                        key={collection.id}
                        to={collection.href}
                        className={styles.collectionCard}
                    >
                        <div className={styles.imageWrapper}>
                            <img
                                src={collection.image}
                                alt={collection.name}
                                className={styles.collectionImage}
                                loading="lazy"
                                onError={() => handleImageError(collection.id)}
                            />
                            <div className={styles.overlay}>
                                <h3 className={styles.collectionName}>{collection.name}</h3>
                                <span className={styles.countPill}>{collection.count}</span>
                            </div>
                        </div>
                        {/* Desktop only description (Hidden on mobile via CSS) */}
                        <div className={styles.cardContent}>
                            <p className={styles.collectionDescription}>
                                {collection.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
