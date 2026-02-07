import React from 'react'
import { Link } from 'react-router-dom'
import styles from './CollectionsSection.module.css'

const collections = [
    {
        id: 'scrunchies',
        name: 'Scrunchies',
        description: 'Luxurious fabric scrunchies that care for your hair',
        image: '/assets/products/scrunchie/classic/golden/sc-scrunchie-classic-golden-1.webp',
        href: '/products?category=Scrunchies',
    },
    {
        id: 'hairbows',
        name: 'Hair Bows',
        description: 'Elegant bows for a sophisticated touch',
        image: '/assets/products/hairbow/satin/cream/sc-hairbow-satin-cream-1.webp',
        href: '/products?category=Hairbows',
    },
    {
        id: 'flowerjewellery',
        name: 'Flower Jewellery',
        description: 'Beautiful floral accessories for special occasions',
        image: '/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-1.webp',
        href: '/products?category=Flowerjewellery',
    },
    {
        id: 'gifthamper',
        name: 'Gift Hampers',
        description: 'Curated gift sets for your loved ones',
        image: '/assets/products/gifthamper/sc-gifthamper-1.webp',
        href: '/products?category=Gifthamper',
    },
]

export default function CollectionsSection() {
    return (
        <section className={styles.collectionsSection}>
            <h2 className={styles.sectionTitle}>Discover Our Collections</h2>
            <div className={styles.collectionsGrid}>
                {collections.map((collection) => (
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
