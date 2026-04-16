import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import styles from './Wishlist.module.css'
import { useWishlist } from '../../context/WishlistContext'
import { getProducts } from '../../services/api'
import ProductCard from '../../components/ProductCard'

export default function Wishlist() {
    const { wishlist } = useWishlist()
    const [wishlistProducts, setWishlistProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch products from API, then filter to only wishlisted items
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true)
                const allProducts = await getProducts()
                setWishlistProducts(allProducts.filter(p => wishlist.includes(p.id || p._id)))
            } catch (err) {
                console.error('Failed to load wishlist products', err)
            } finally {
                setLoading(false)
            }
        }
        fetchWishlist()
    }, [wishlist])

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>
                    {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                </p>
            </div>

            <div className={styles.content}>
                {wishlistProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg
                            className={styles.emptyIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
                        <p className={styles.emptyText}>
                            Keep track of your favorite items by clicking the heart icon on any product.
                        </p>
                        <Link to="/products" className={styles.ctaButton}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <ul className={styles.grid}>
                        <AnimatePresence initial={false}>
                            {wishlistProducts.map((product, idx) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={idx}
                                />
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </div>
        </main>
    )
}
