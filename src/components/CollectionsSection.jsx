import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './CollectionsSection.module.css'
import { getProducts } from '../services/api'
import SectionHeader from './SectionHeader'

/**
 * Category definitions for the "Discover Collections" grid.
 * Images are resolved dynamically from the product catalog
 * so we always get valid Cloudinary URLs, not stale local paths.
 */
const collectionDefs = [
    {
        id: 'scrunchies',
        name: 'Scrunchies',
        description: 'Luxurious fabric scrunchies that care for your hair',
        category: 'scrunchie',
        href: '/products/scrunchie',
        count: '24 styles',
    },
    {
        id: 'hairbows',
        name: 'Hair Bows',
        description: 'Elegant bows for a sophisticated touch',
        category: 'hairbow',
        href: '/products/hairbow',
        count: '18 styles',
    },
    {
        id: 'hairclips',
        name: 'Hairclips',
        description: 'Elegant clips for a stylish look',
        category: 'hairclip',
        href: '/products/hairclip',
        count: '12 styles',
    },
    {
        id: 'gifthamper',
        name: 'Gift Hampers',
        description: 'Curated gift sets for your loved ones',
        category: 'gifthamper',
        href: '/products/gifthamper',
        count: '12 styles',
    },
]

export default function CollectionsSection() {
    const [failedImages, setFailedImages] = useState(new Set())
    const [collections, setCollections] = useState([])

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const allProducts = await getProducts();

                // Resolve a Cloudinary image for every category from the live catalog
                const updatedCollections = collectionDefs.map(def => {
                    const products = allProducts.filter(
                        p => p.category && p.category.toLowerCase() === def.category.toLowerCase()
                    )

                    // Dynamic count from actual product data
                    const count = `${products.length} styles`

                    // Pick the first product with a valid image
                    const productWithImage = products.find(p => p.images && p.images.length > 0)
                    const image = productWithImage ? productWithImage.images[0] : null

                    return { ...def, image, count }
                }).filter(c => c.image !== null)

                setCollections(updatedCollections)
            } catch (err) {
                console.error(err)
            }
        }
        fetchCollections()
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
