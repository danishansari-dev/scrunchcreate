import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styles from './CollectionsSection.module.css'
import { getProductsByCategory } from '../utils/getProducts'

const collectionDefs = [
    {
        id: 'scrunchies',
        name: 'Scrunchies',
        description: 'Luxurious fabric scrunchies that care for your hair',
        category: 'Scrunchie',
        href: '/products/scrunchies',
    },
    {
        id: 'hairbows',
        name: 'Hair Bows',
        description: 'Elegant bows for a sophisticated touch',
        category: 'HairBow',
        href: '/products/hair-bows',
    },
    {
        id: 'flowerjewellery',
        name: 'Flower Jewellery',
        description: 'Beautiful floral accessories for special occasions',
        category: 'FlowerJewellery',
        href: '/products/flower-jewellery',
    },
    {
        id: 'gifthamper',
        name: 'Gift Hampers',
        description: 'Curated gift sets for your loved ones',
        category: 'GiftHamper',
        href: '/products/hamper',
    },
]


export default function CollectionsSection() {
    const [failedImages, setFailedImages] = useState(new Set())

    // Derive collection images dynamically from product data
    const collections = useMemo(() => {
        return collectionDefs
            .map(def => {
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
            <h2 className={styles.sectionTitle}>Discover Our Collections</h2>
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
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.collectionName}>{collection.name}</h3>
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
