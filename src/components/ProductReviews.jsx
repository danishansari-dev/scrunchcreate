import React, { useMemo } from 'react'
import styles from './ProductReviews.module.css'

// Simulated reviews data - in a real app this would come from an API or localStorage
const simulatedReviews = [
    {
        id: 1,
        name: 'Priya S.',
        rating: 5,
        date: '2025-12-15',
        text: 'Absolutely love this product! The quality is amazing and it matches perfectly with my outfits. Highly recommend!',
    },
    {
        id: 2,
        name: 'Ananya M.',
        rating: 4,
        date: '2025-11-28',
        text: 'Beautiful design and very comfortable to wear. Delivery was quick too. Would buy again!',
    },
    {
        id: 3,
        name: 'Riya K.',
        rating: 5,
        date: '2025-11-10',
        text: 'Such a cute accessory! I got so many compliments when I wore it. The color is exactly as shown in the pictures.',
    },
    {
        id: 4,
        name: 'Shreya P.',
        rating: 4,
        date: '2025-10-22',
        text: 'Good quality and pretty design. The only thing is it took a bit longer to arrive than expected, but worth the wait!',
    },
]

// Star rating component
function StarRating({ rating }) {
    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${styles.star} ${star <= rating ? '' : styles.starEmpty}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    )
}

function formatReviewDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function ProductReviews({ productId }) {
    // For now, we use simulated reviews for all products
    // In a real app, you would filter by productId or fetch from API
    const reviews = useMemo(() => {
        // Simulate different reviews for different products by using productId as seed
        const seed = productId ? parseInt(productId, 10) || 1 : 1
        // Shuffle reviews based on product ID to give variety
        return [...simulatedReviews].sort(() => (seed % 2 === 0 ? 1 : -1))
    }, [productId])

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
        return (sum / reviews.length).toFixed(1)
    }, [reviews])

    if (reviews.length === 0) {
        return (
            <section className={styles.reviewsSection}>
                <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
                <p className={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
            </section>
        )
    }

    return (
        <section className={styles.reviewsSection}>
            <h2 className={styles.reviewsTitle}>Customer Reviews</h2>

            {/* Ratings Summary */}
            <div className={styles.ratingsSummary}>
                <div className={styles.averageRating}>
                    <span className={styles.averageNumber}>{averageRating}</span>
                    <StarRating rating={Math.round(parseFloat(averageRating))} />
                </div>
                <span className={styles.totalReviews}>
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <article key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewerInfo}>
                                <span className={styles.reviewerName}>{review.name}</span>
                                <span className={styles.reviewDate}>{formatReviewDate(review.date)}</span>
                            </div>
                            <StarRating rating={review.rating} />
                        </div>
                        <p className={styles.reviewText}>{review.text}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
