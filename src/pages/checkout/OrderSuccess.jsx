import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './OrderSuccess.module.css'

export default function OrderSuccess() {
    const location = useLocation()
    const orderId = location.state?.orderId || 'N/A'

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.icon}>
                    <svg className={styles.iconSvg} viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className={styles.title}>Order Placed!</h1>
                <p className={styles.subtitle}>
                    Thank you for your order. We'll send you a confirmation email shortly.
                </p>
                <div className={styles.orderId}>
                    Order ID: {orderId}
                </div>
                <div className={styles.actions}>
                    <Link to="/products" className={styles.primaryBtn}>
                        Continue Shopping
                    </Link>
                    <Link to="/profile" className={styles.secondaryBtn}>
                        View Orders
                    </Link>
                </div>
            </div>
        </main>
    )
}
